from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import tempfile

from app.database.session import get_db
from app.models.training import TrainedModel
from app.services.prediction_service import model_cache

router = APIRouter(prefix="/health", tags=["Health Check"])

@router.get("/database")
def health_database(db: Session = Depends(get_db)):
    """
    Tests database connection connectivity.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )

@router.get("/model")
def health_model(db: Session = Depends(get_db)):
    """
    Checks the status of the active model and verifies its physical artifacts exist on disk.
    """
    model = db.query(TrainedModel).filter(TrainedModel.active_flag).first()
    if not model:
        return {
            "status": "degraded",
            "message": "No active model is configured in the model registry."
        }

    # Verify model directory exists
    folder_exists = os.path.exists(model.file_path)
    
    # Verify exact files are present (model.joblib, preprocessor.joblib)
    model_exists = os.path.exists(os.path.join(model.file_path, "model.joblib"))
    preprocessor_exists = os.path.exists(os.path.join(model.file_path, "preprocessor.joblib"))

    is_healthy = folder_exists and model_exists and preprocessor_exists
    
    return {
        "status": "healthy" if is_healthy else "unhealthy",
        "active_model": {
            "id": str(model.id),
            "name": model.name,
            "version": model.version,
            "algorithm": model.algorithm,
            "file_path": model.file_path,
            "artifacts": {
                "folder_exists": folder_exists,
                "model_file_exists": model_exists,
                "preprocessor_file_exists": preprocessor_exists
            }
        }
    }

@router.get("/storage")
def health_storage():
    """
    Verifies that system storage locations (datasets/ and models/) are writable by creating and deleting temporary files.
    """
    # Root path for datasets and models directories
    datasets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../datasets"))
    models_dir = "models"
    
    dirs = {
        "datasets": datasets_dir,
        "models": models_dir
    }
    
    overall_status = "healthy"
    details = {}
    
    for key, path in dirs.items():
        os.makedirs(path, exist_ok=True)
        try:
            # Try to write a temp file in the directory
            temp_file = tempfile.NamedTemporaryFile(dir=path, delete=False)
            temp_file.write(b"healthcheck_write")
            temp_file.close()
            # Try to delete the temp file
            os.remove(temp_file.name)
            
            details[key] = {
                "status": "healthy",
                "path": path,
                "writable": True
            }
        except Exception as e:
            overall_status = "unhealthy"
            details[key] = {
                "status": "unhealthy",
                "path": path,
                "writable": False,
                "error": str(e)
            }
            
    if overall_status == "unhealthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "storage": details
            }
        )
        
    return {
        "status": "healthy",
        "storage": details
    }

@router.get("/cache")
def health_cache():
    """
    Returns statistics and status of the in-memory trained model/preprocessor caches.
    """
    try:
        # Fetch key counts and active keys from model cache
        loaded_models = list(model_cache._models.keys())
        loaded_preprocessors = list(model_cache._preprocessors.keys())
        
        return {
            "status": "healthy",
            "cache": {
                "models_count": len(loaded_models),
                "preprocessors_count": len(loaded_preprocessors),
                "models_loaded": loaded_models,
                "preprocessors_loaded": loaded_preprocessors
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "unhealthy",
                "cache": "error",
                "error": str(e)
            }
        )

@router.get("")
def health_aggregator(db: Session = Depends(get_db)):
    """
    Aggregated health check endpoint querying database, models, storage, and caches.
    """
    health_results = {}
    is_healthy = True
    
    # 1. Check Database
    try:
        health_results["database"] = health_database(db)
    except Exception as e:
        is_healthy = False
        health_results["database"] = {"status": "unhealthy", "error": str(e)}

    # 2. Check Model Config
    try:
        health_results["model"] = health_model(db)
        if health_results["model"]["status"] == "unhealthy":
            is_healthy = False
    except Exception as e:
        is_healthy = False
        health_results["model"] = {"status": "unhealthy", "error": str(e)}

    # 3. Check Storage
    try:
        health_results["storage"] = health_storage()
    except Exception as e:
        is_healthy = False
        # Extract details if it is an HTTPException
        if isinstance(e, HTTPException):
            health_results["storage"] = e.detail
        else:
            health_results["storage"] = {"status": "unhealthy", "error": str(e)}

    # 4. Check Cache
    try:
        health_results["cache"] = health_cache()
    except Exception as e:
        is_healthy = False
        health_results["cache"] = {"status": "unhealthy", "error": str(e)}

    
    # We return the aggregated status
    return {
        "status": "ok" if is_healthy else "unhealthy",
        "project": "AI Threat Detection System",
        "version": "1.0.0",
        "components": health_results
    }

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """
    Exposes system metrics including active sessions, job counts, websocket connections, and resource usage.
    """
    from app.websocket.manager import websocket_manager
    from app.models.detection import DetectionSession
    from app.models.training import TrainingJob
    from app.models.prediction import PredictionHistory
    from sqlalchemy import func
    import os
    
    # System CPU/Memory check
    try:
        import psutil
    except ImportError:
        psutil = None

    cpu_usage = 0.0
    mem_rss = 0.0
    system_cpu = 0.0
    system_mem = 0.0

    if psutil:
        try:
            process = psutil.Process(os.getpid())
            cpu_usage = process.cpu_percent(interval=None)
            mem_rss = process.memory_info().rss / (1024 * 1024) # MB
            system_cpu = psutil.cpu_percent()
            system_mem = psutil.virtual_memory().percent
        except Exception:
            pass
    else:
        try:
            import resource
            rusage = resource.getrusage(resource.RUSAGE_SELF)
            mem_rss = rusage.ru_maxrss / 1024.0 # MB
            if hasattr(os, "getloadavg"):
                cpu_usage = os.getloadavg()[0] * 100.0
                system_cpu = cpu_usage
        except Exception:
            pass

    # WebSocket connection count
    ws_connections = len(websocket_manager.active_connections)

    # Active detection sessions (status = running)
    active_detection_sessions = db.query(DetectionSession).filter(DetectionSession.status == "running").count()

    # Training jobs status counts
    queued_training_jobs = db.query(TrainingJob).filter(TrainingJob.status == "queued").count()
    running_training_jobs = db.query(TrainingJob).filter(TrainingJob.status == "running").count()

    # Prediction counts and latency metrics
    total_predictions = db.query(PredictionHistory).count()
    avg_prediction_latency = db.query(func.avg(PredictionHistory.processing_latency)).scalar() or 0.0

    return {
        "websocket": {
            "active_connections": ws_connections
        },
        "detection": {
            "active_sessions": active_detection_sessions
        },
        "training": {
            "queued_jobs": queued_training_jobs,
            "running_jobs": running_training_jobs
        },
        "predictions": {
            "total": total_predictions,
            "average_latency_seconds": float(avg_prediction_latency)
        },
        "system": {
            "process_cpu_percent": float(cpu_usage),
            "process_memory_rss_mb": float(mem_rss),
            "system_cpu_percent": float(system_cpu),
            "system_memory_percent": float(system_mem)
        }
    }

