import os
from fastapi import UploadFile, BackgroundTasks
from uuid import UUID
from typing import List
from app.repositories.dataset_repository import DatasetRepository
from app.models.dataset import Dataset
from app.services.dataset_tasks import process_dataset_background_task
from app.core.exceptions import ValidationError, NotFoundError

# Root path for datasets
DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../datasets"))
os.makedirs(DATASETS_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".csv", ".pcap"}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB

class DatasetService:
    def __init__(self, repository: DatasetRepository):
        self.repository = repository

    def upload_dataset(self, file: UploadFile, user_id: int, background_tasks: BackgroundTasks) -> Dataset:
        # 1. Validation: Check Extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValidationError(f"Invalid file extension. Allowed: {ALLOWED_EXTENSIONS}")

        # 2. Validation: Duplicate filename
        if self.repository.get_by_filename_and_user(file.filename, user_id):
            raise ValidationError("A dataset with this filename already exists for this user.")

        # Determine Dataset Type
        dataset_type = "CSV" if ext == ".csv" else "PCAP"

        # Define file path
        # Using user_id and filename to avoid global collisions
        user_dir = os.path.join(DATASETS_DIR, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        file_path = os.path.join(user_dir, file.filename)

        # 3. Save File and Check Size
        size_bytes = 0
        try:
            with open(file_path, "wb") as buffer:
                while chunk := file.file.read(1024 * 1024):  # Read 1MB chunks
                    size_bytes += len(chunk)
                    if size_bytes > MAX_FILE_SIZE:
                        os.remove(file_path)
                        raise ValidationError("File exceeds maximum allowed size of 500MB")
                    buffer.write(chunk)
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e

        # 4. Create DB Record
        dataset = Dataset(
            filename=file.filename,
            dataset_type=dataset_type,
            size_bytes=size_bytes,
            file_path=file_path,
            status="processing",
            uploaded_by=user_id
        )
        created_dataset = self.repository.create(dataset)

        # Log dataset_upload event
        from app.services.event_store_service import EventStoreService
        try:
            EventStoreService.record_event(
                db=self.repository.db,
                event_type="dataset_upload",
                payload={
                    "dataset_id": str(created_dataset.id),
                    "filename": created_dataset.filename,
                    "size_bytes": created_dataset.size_bytes,
                    "status": created_dataset.status
                },
                user_id=user_id
            )
        except Exception:
            pass

        # 5. Queue Background Task
        background_tasks.add_task(
            process_dataset_background_task,
            dataset_id=created_dataset.id,
            file_path=file_path,
            dataset_type=dataset_type
        )

        return created_dataset

    def list_datasets(self, user_id: int) -> List[Dataset]:
        return self.repository.list_by_user(user_id)

    def get_dataset(self, dataset_id: UUID, user_id: int) -> Dataset:
        dataset = self.repository.get_by_id(dataset_id)
        if not dataset or dataset.uploaded_by != user_id:
            raise NotFoundError("Dataset not found")
        return dataset

    def delete_dataset(self, dataset_id: UUID, user_id: int) -> None:
        dataset = self.get_dataset(dataset_id, user_id)
        
        # 1. Collect all associated file paths before database deletion
        files_to_delete = []
        if dataset.file_path:
            files_to_delete.append(dataset.file_path)
            
        # Processed datasets (parquet files and preprocessor models)
        try:
            processed_datasets = dataset.processed_datasets
            for pd in processed_datasets:
                for attr in ["train_features_path", "train_labels_path", "test_features_path", "test_labels_path", "preprocessor_path"]:
                    val = getattr(pd, attr, None)
                    if val:
                        files_to_delete.append(val)
        except Exception:
            pass

        # Trained models
        try:
            trained_models = dataset.trained_models
            for model in trained_models:
                if model.file_path:
                    files_to_delete.append(model.file_path)
        except Exception:
            pass

        # Prediction jobs
        try:
            prediction_jobs = dataset.prediction_jobs
            for pj in prediction_jobs:
                if pj.output_file_path:
                    files_to_delete.append(pj.output_file_path)
        except Exception:
            pass

        # 2. Perform DB deletion first (relying on ON DELETE CASCADE in SQL)
        self.repository.delete(dataset)

        # 3. Clean up physical files from disk
        from app.core.logger import logger
        for file_path in files_to_delete:
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    logger.error(f"Failed to remove file {file_path} during dataset deletion: {e}")

