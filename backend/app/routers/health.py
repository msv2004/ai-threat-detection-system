from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import tempfile
from typing import Optional

from app.database.session import get_db
from app.models.training import TrainedModel
from app.services.prediction_service import model_cache
from app.auth.dependencies import get_current_user, get_current_user_optional
from app.models.user import User

router = APIRouter(prefix="/health", tags=["Health Check"])

def health_model_internal(db: Session):
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

def health_storage_internal():
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

def health_cache_internal():
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
def health_model(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Checks the status of the active model and verifies its physical artifacts exist on disk.
    Requires authentication to protect path details.
    """
    return health_model_internal(db)

@router.get("/storage")
def health_storage(current_user: User = Depends(get_current_user)):
    """
    Verifies that system storage locations (datasets/ and models/) are writable.
    Requires authentication to protect absolute system paths.
    """
    return health_storage_internal()

@router.get("/cache")
def health_cache(current_user: User = Depends(get_current_user)):
    """
    Returns statistics and status of the in-memory trained model/preprocessor caches.
    Requires authentication.
    """
    try:
        return health_cache_internal()
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
def health_aggregator(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    """
    Aggregated health check endpoint querying database, models, storage, and caches.
    Exposes full diagnostics if authenticated, and only basic database/project status if unauthenticated.
    """
    # 1. Check Database
    database_status = {"status": "healthy", "database": "connected"}
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        database_status = {"status": "unhealthy", "database": "disconnected", "error": str(e)}

    # If the user is authenticated, we return full details.
    # Otherwise, we return only database and project info for privacy/security.
    if current_user:
        health_results = {
            "database": database_status
        }
        
        # 2. Check Model Config
        try:
            health_results["model"] = health_model_internal(db)
        except Exception as e:
            health_results["model"] = {"status": "unhealthy", "error": str(e)}

        # 3. Check Storage
        try:
            health_results["storage"] = health_storage_internal()
        except HTTPException as e:
            health_results["storage"] = e.detail
        except Exception as e:
            health_results["storage"] = {"status": "unhealthy", "error": str(e)}

        # 4. Check Cache
        try:
            health_results["cache"] = health_cache_internal()
        except Exception as e:
            health_results["cache"] = {"status": "unhealthy", "error": str(e)}

        is_healthy = database_status["status"] == "healthy" and all(
            res.get("status") in ("healthy", "ok") if isinstance(res, dict) else True
            for res in health_results.values()
        )
        
        return {
            "status": "ok" if is_healthy else "unhealthy",
            "project": "AI Threat Detection System",
            "version": "1.0.0",
            "components": health_results
        }
    else:
        return {
            "status": "ok" if database_status["status"] == "healthy" else "unhealthy",
            "project": "AI Threat Detection System",
            "version": "1.0.0",
            "database": database_status["status"]
        }

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Exposes system metrics including active sessions, job counts, websocket connections, and resource usage.
    Requires authentication.
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
