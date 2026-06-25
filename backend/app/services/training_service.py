from fastapi import BackgroundTasks
from uuid import UUID
from typing import List, Optional
import os
import shutil

from app.repositories.training_repository import TrainingRepository
from app.repositories.preprocessing_repository import PreprocessingRepository
from app.schemas.training import TrainingJobCreate
from app.models.training import TrainingJob, TrainedModel
from app.models.preprocessing import ProcessedDataset
from app.core.exceptions import NotFoundError, BadRequestError
from app.services.training_tasks import run_training_job

class TrainingService:
    def __init__(self, repo: TrainingRepository, preprocessing_repo: PreprocessingRepository):
        self.repo = repo
        self.preprocessing_repo = preprocessing_repo

    def start_job(
        self, 
        config: TrainingJobCreate, 
        user_id: int, 
        background_tasks: BackgroundTasks
    ) -> TrainingJob:
        # Verify processed dataset exists and belongs to the user
        db = self.preprocessing_repo.db
        processed_dataset = db.query(ProcessedDataset).filter(ProcessedDataset.id == config.processed_dataset_id).first()
        
        if not processed_dataset:
            raise NotFoundError("Processed dataset not found")
            
        # Get original dataset to verify owner
        dataset = processed_dataset.original_dataset
        if not dataset or dataset.uploaded_by != user_id:
            raise NotFoundError("Processed dataset not found")

        # Create job
        job = self.repo.create_job(
            dataset_id=dataset.id,
            processed_dataset_id=processed_dataset.id,
            algorithm=config.algorithm,
            config=config.hyperparameters or {},
            user_id=user_id
        )

        # Enqueue background task
        background_tasks.add_task(
            run_training_job,
            job.id,
            dataset.id,
            processed_dataset.id,
            config.algorithm,
            config.hyperparameters or {},
            config.model_name,
            user_id
        )

        return job

    def get_job(self, job_id: UUID, user_id: int) -> TrainingJob:
        job = self.repo.get_job(job_id)
        if not job or job.user_id != user_id:
            raise NotFoundError("Training job not found")
        return job

    def list_jobs(self, user_id: int) -> List[TrainingJob]:
        return self.repo.list_jobs(user_id)

    def list_models(self, user_id: int) -> List[TrainedModel]:
        return self.repo.list_models(user_id)

    def get_model(self, model_id: UUID, user_id: int) -> TrainedModel:
        model = self.repo.get_model(model_id)
        if not model or model.user_id != user_id:
            raise NotFoundError("Model not found")
        return model

    def activate_model(self, model_id: UUID, user_id: int) -> TrainedModel:
        model = self.repo.get_model(model_id)
        if not model or model.user_id != user_id:
            raise NotFoundError("Model not found")
            
        activated = self.repo.activate_model(model_id, user_id)
        if not activated:
            raise BadRequestError("Failed to activate model")
        return activated

    def delete_model(self, model_id: UUID, user_id: int) -> None:
        model = self.repo.get_model(model_id)
        if not model or model.user_id != user_id:
            raise NotFoundError("Model not found")

        # Delete from disk
        if model.file_path and os.path.exists(model.file_path):
            shutil.rmtree(model.file_path, ignore_errors=True)

        # Delete from DB
        self.repo.delete_model(model_id)

    def compare_models(self, user_id: int) -> List[dict]:
        models = self.repo.list_models(user_id)
        comparison_list = []
        
        db = self.preprocessing_repo.db
        for model in models:
            # Query training job to get duration/training time
            job = db.query(TrainingJob).filter(
                TrainingJob.processed_dataset_id == model.processed_dataset_id,
                TrainingJob.algorithm == model.algorithm,
                TrainingJob.status == "completed"
            ).order_by(TrainingJob.created_at.desc()).first()
            
            training_time = job.duration if job else None
            
            comparison_list.append({
                "id": model.id,
                "name": model.name,
                "version": model.version,
                "algorithm": model.algorithm,
                "accuracy": model.accuracy,
                "f1_score": model.f1_score,
                "precision": model.precision,
                "recall": model.recall,
                "roc_auc": model.roc_auc,
                "training_time": training_time
            })
            
        return comparison_list
