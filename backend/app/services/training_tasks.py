import os
import time
import json
import shutil
import traceback
from uuid import UUID
from datetime import datetime, timezone
import pandas as pd
import joblib

from app.database.session import SessionLocal
from app.repositories.training_repository import TrainingRepository
from app.repositories.preprocessing_repository import PreprocessingRepository
from app.ai.factory import TrainerFactory
from app.core.logger import logger

def run_training_job(
    job_id: UUID,
    dataset_id: UUID,
    processed_dataset_id: UUID,
    algorithm: str,
    config: dict,
    model_name: str,
    user_id: int
):
    """
    Background worker that handles the model training lifecycle.
    """
    logger.info(f"Starting training job {job_id} for algorithm {algorithm}")
    
    db = SessionLocal()
    repo = TrainingRepository(db)
    PreprocessingRepository(db)
    
    started_at = datetime.now(timezone.utc)
    repo.update_job(job_id, status="running", started_at=started_at)
    
    # Log training_started event
    from app.services.event_store_service import EventStoreService
    try:
        EventStoreService.record_event(
            db=db,
            event_type="training_started",
            payload={
                "training_job_id": str(job_id),
                "algorithm": algorithm,
                "dataset_id": str(dataset_id),
                "processed_dataset_id": str(processed_dataset_id)
            },
            user_id=user_id
        )
    except Exception:
        pass
    
    start_time = time.time()
    
    try:
        # 1. Fetch Processed Dataset Metadata
        from app.models.preprocessing import ProcessedDataset
        processed_dataset = db.query(ProcessedDataset).filter(ProcessedDataset.id == processed_dataset_id).first()
        if not processed_dataset:
            raise ValueError(f"ProcessedDataset with ID {processed_dataset_id} not found")
        
        # 2. Load Parquet files
        if not os.path.exists(processed_dataset.train_features_path):
            raise FileNotFoundError(f"Training features file not found at {processed_dataset.train_features_path}")
        if not os.path.exists(processed_dataset.train_labels_path):
            raise FileNotFoundError(f"Training labels file not found at {processed_dataset.train_labels_path}")
        if not os.path.exists(processed_dataset.test_features_path):
            raise FileNotFoundError(f"Test features file not found at {processed_dataset.test_features_path}")
        if not os.path.exists(processed_dataset.test_labels_path):
            raise FileNotFoundError(f"Test labels file not found at {processed_dataset.test_labels_path}")
            
        X_train = pd.read_parquet(processed_dataset.train_features_path)
        y_train = pd.read_parquet(processed_dataset.train_labels_path).iloc[:, 0]
        X_test = pd.read_parquet(processed_dataset.test_features_path)
        y_test = pd.read_parquet(processed_dataset.test_labels_path).iloc[:, 0]
        
        # Ensure correct type (e.g. integer target labels)
        if y_train.dtype == object or y_train.dtype.name == 'category':
            y_train = y_train.astype(int)
        if y_test.dtype == object or y_test.dtype.name == 'category':
            y_test = y_test.astype(int)

        # 3. Instantiate Trainer from Abstraction Factory
        trainer = TrainerFactory.get_trainer(algorithm)
        
        # 4. Train Model
        model = trainer.train(X_train, y_train, config)
        
        # 5. Evaluate Model
        metrics = trainer.evaluate(model, X_test, y_test)
        
        # 6. Explain Model (Feature Importance)
        feature_names = list(X_train.columns)
        explainability = trainer.get_explainability(model, feature_names)
        
        # 7. Create model directory: models/{user_id}/{model_name}/v{version}/
        version = repo.get_next_model_version(model_name, user_id)
        model_dir = os.path.join("models", str(user_id), model_name, f"v{version}")
        os.makedirs(model_dir, exist_ok=True)
        
        # 8. Save Artifacts
        model_path = os.path.join(model_dir, "model.joblib")
        metrics_path = os.path.join(model_dir, "metrics.json")
        features_path = os.path.join(model_dir, "feature_names.json")
        config_path = os.path.join(model_dir, "training_config.json")
        model_preprocessor_path = os.path.join(model_dir, "preprocessor.joblib")
        
        # Dump model.joblib
        joblib.dump(model, model_path)
        
        # Dump metrics.json
        with open(metrics_path, "w") as f:
            json.dump(metrics, f, indent=4)
            
        # Dump feature_names.json
        with open(features_path, "w") as f:
            json.dump(feature_names, f, indent=4)
            
        # Dump training_config.json
        with open(config_path, "w") as f:
            json.dump(config, f, indent=4)
            
        # Copy or save preprocessor.joblib
        if processed_dataset.preprocessor_path and os.path.exists(processed_dataset.preprocessor_path):
            shutil.copy(processed_dataset.preprocessor_path, model_preprocessor_path)
        else:
            # Create a mock/empty preprocessor if preprocessing didn't create one (backward compatibility)
            mock_state = {
                "scaling_strategy": None,
                "encoding_strategy": None,
                "target_column": getattr(processed_dataset.original_dataset, "config", {}).get("target_column", "label"),
                "categorical_cols": [],
                "numeric_cols": feature_names,
                "scaler": None,
                "label_encoders": {},
                "feature_names": feature_names
            }
            joblib.dump(mock_state, model_preprocessor_path)

        # 9. Register Model in Registry
        model_data = {
            "name": model_name,
            "version": version,
            "algorithm": algorithm,
            "dataset_id": dataset_id,
            "processed_dataset_id": processed_dataset_id,
            "accuracy": metrics.get("accuracy"),
            "precision": metrics.get("precision"),
            "recall": metrics.get("recall"),
            "f1_score": metrics.get("f1_score"),
            "roc_auc": metrics.get("roc_auc"),
            "confusion_matrix": metrics.get("confusion_matrix"),
            "feature_importance": explainability,
            "file_path": model_dir,
            "active_flag": False,
            "user_id": user_id
        }
        model_record = repo.create_model(model_data)
        
        # 10. Update job status to completed
        finished_at = datetime.now(timezone.utc)
        duration = float(time.time() - start_time)
        repo.update_job(
            job_id, 
            status="completed", 
            finished_at=finished_at, 
            duration=duration
        )
        logger.info(f"Training job {job_id} completed successfully in {duration:.2f}s")
        
        # Log training_completed event
        from app.services.event_store_service import EventStoreService
        try:
            EventStoreService.record_event(
                db=db,
                event_type="training_completed",
                payload={
                    "training_job_id": str(job_id),
                    "model_id": str(model_record.id),
                    "model_name": model_record.name,
                    "accuracy": metrics.get("accuracy"),
                    "f1_score": metrics.get("f1_score"),
                    "duration": duration
                },
                user_id=user_id
            )
        except Exception:
            pass
        
    except Exception as e:
        logger.error(f"Training job {job_id} failed: {str(e)}")
        logger.error(traceback.format_exc())
        
        finished_at = datetime.now(timezone.utc)
        duration = float(time.time() - start_time)
        repo.update_job(
            job_id, 
            status="failed", 
            finished_at=finished_at, 
            duration=duration, 
            error_message=str(e)
        )
        
        # Log training_failed event
        from app.services.event_store_service import EventStoreService
        try:
            EventStoreService.record_event(
                db=db,
                event_type="training_failed",
                payload={
                    "training_job_id": str(job_id),
                    "error": str(e),
                    "duration": duration
                },
                user_id=user_id
            )
        except Exception:
            pass
    finally:
        db.close()
