import os
from uuid import UUID
from app.database.session import SessionLocal
from app.repositories.dataset_repository import DatasetRepository
from app.repositories.preprocessing_repository import PreprocessingRepository
from app.core.preprocessor import DatasetPreprocessor
from app.schemas.preprocessing import PreprocessingConfig
from app.core.logger import logger
import traceback

def run_preprocessing_job(job_id: UUID, dataset_id: UUID, config_dict: dict, file_path: str, user_id: int):
    """
    Background task that executes the preprocessing pipeline.
    """
    logger.info(f"Starting preprocessing job {job_id} for dataset {dataset_id}")
    db = SessionLocal()
    try:
        repo = PreprocessingRepository(db)
        dataset_repo = DatasetRepository(db)

        # Update status to running
        repo.update_job_status(job_id, "running")

        # Construct Config
        config = PreprocessingConfig(**config_dict)

        # Initialize preprocessor
        preprocessor = DatasetPreprocessor(file_path, config)
        
        # 1. Profile Dataset
        profile_data = preprocessor.profile_dataset()
        
        # Save profile if it doesn't exist
        existing_profile = repo.get_profile(dataset_id)
        if not existing_profile:
            repo.create_profile({
                "dataset_id": dataset_id,
                **profile_data
            })

        # 2. Run processing pipeline
        X_train, X_test, y_train, y_test = preprocessor.process()

        # 3. Save splits
        # Create output directory: datasets/{user_id}/processed/
        processed_dir = os.path.join("datasets", str(user_id), "processed")
        os.makedirs(processed_dir, exist_ok=True)

        # File paths
        train_features_path = os.path.join(processed_dir, f"{job_id}_X_train.parquet")
        test_features_path = os.path.join(processed_dir, f"{job_id}_X_test.parquet")
        train_labels_path = os.path.join(processed_dir, f"{job_id}_y_train.parquet")
        test_labels_path = os.path.join(processed_dir, f"{job_id}_y_test.parquet")

        # Save to disk as parquet
        X_train.to_parquet(train_features_path, index=False)
        X_test.to_parquet(test_features_path, index=False)
        y_train.to_frame().to_parquet(train_labels_path, index=False)
        y_test.to_frame().to_parquet(test_labels_path, index=False)

        # Save preprocessor state
        preprocessor_path = os.path.join(processed_dir, f"{job_id}_preprocessor.joblib")
        import joblib
        preprocessor_state = {
            "scaling_strategy": config.scaling_strategy,
            "encoding_strategy": config.encoding_strategy,
            "target_column": config.target_column,
            "categorical_cols": getattr(preprocessor, "categorical_cols", []),
            "numeric_cols": getattr(preprocessor, "numeric_cols", []),
            "scaler": getattr(preprocessor, "scaler", None),
            "label_encoders": getattr(preprocessor, "label_encoders", {}),
            "target_label_encoder": getattr(preprocessor, "target_label_encoder", None),
            "feature_names": list(X_train.columns)
        }
        joblib.dump(preprocessor_state, preprocessor_path)

        # 4. Save ProcessedDataset Record
        repo.create_processed_dataset({
            "original_dataset_id": dataset_id,
            "job_id": job_id,
            "train_features_path": train_features_path,
            "train_labels_path": train_labels_path,
            "test_features_path": test_features_path,
            "test_labels_path": test_labels_path,
            "preprocessor_path": preprocessor_path,
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        })

        # Update job status to completed
        repo.update_job_status(job_id, "completed")
        logger.info(f"Preprocessing job {job_id} completed successfully")

    except Exception as e:
        logger.error(f"Preprocessing job {job_id} failed: {str(e)}")
        error_msg = str(e)
        repo = PreprocessingRepository(db)
        repo.update_job_status(job_id, "failed", error_message=error_msg)
    finally:
        db.close()
