from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from app.models.training import TrainingJob, TrainedModel
from datetime import datetime

class TrainingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_job(
        self, 
        dataset_id: UUID, 
        processed_dataset_id: UUID, 
        algorithm: str, 
        config: dict, 
        user_id: int
    ) -> TrainingJob:
        job = TrainingJob(
            dataset_id=dataset_id,
            processed_dataset_id=processed_dataset_id,
            algorithm=algorithm,
            config=config,
            status="queued",
            user_id=user_id
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_job(self, job_id: UUID) -> Optional[TrainingJob]:
        return self.db.query(TrainingJob).filter(TrainingJob.id == job_id).first()

    def list_jobs(self, user_id: int) -> List[TrainingJob]:
        return self.db.query(TrainingJob)\
            .filter(TrainingJob.user_id == user_id)\
            .order_by(TrainingJob.created_at.desc())\
            .all()

    def update_job(
        self, 
        job_id: UUID, 
        status: str, 
        started_at: Optional[datetime] = None, 
        finished_at: Optional[datetime] = None, 
        duration: Optional[float] = None, 
        error_message: Optional[str] = None
    ) -> Optional[TrainingJob]:
        job = self.get_job(job_id)
        if job:
            job.status = status
            if started_at:
                job.started_at = started_at
            if finished_at:
                job.finished_at = finished_at
            if duration is not None:
                job.duration = duration
            if error_message:
                job.error_message = error_message
            self.db.commit()
            self.db.refresh(job)
        return job

    def get_next_model_version(self, name: str, user_id: int) -> int:
        max_version = self.db.query(func.max(TrainedModel.version))\
            .filter(TrainedModel.name == name, TrainedModel.user_id == user_id)\
            .scalar()
        return (max_version or 0) + 1

    def create_model(self, model_data: dict) -> TrainedModel:
        model = TrainedModel(**model_data)
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model

    def get_model(self, model_id: UUID) -> Optional[TrainedModel]:
        return self.db.query(TrainedModel).filter(TrainedModel.id == model_id).first()

    def list_models(self, user_id: int) -> List[TrainedModel]:
        return self.db.query(TrainedModel)\
            .filter(TrainedModel.user_id == user_id)\
            .order_by(TrainedModel.created_at.desc())\
            .all()

    def get_models_by_name(self, name: str, user_id: int) -> List[TrainedModel]:
        return self.db.query(TrainedModel)\
            .filter(TrainedModel.name == name, TrainedModel.user_id == user_id)\
            .all()

    def activate_model(self, model_id: UUID, user_id: int) -> Optional[TrainedModel]:
        model = self.get_model(model_id)
        if not model or model.user_id != user_id:
            return None

        # Deactivate all other models with the same name for this user
        other_models = self.db.query(TrainedModel)\
            .filter(
                TrainedModel.name == model.name, 
                TrainedModel.user_id == user_id,
                TrainedModel.id != model_id
            ).all()
        
        for om in other_models:
            om.active_flag = False
            
        model.active_flag = True
        self.db.commit()
        self.db.refresh(model)
        return model

    def delete_model(self, model_id: UUID) -> bool:
        model = self.get_model(model_id)
        if model:
            self.db.delete(model)
            self.db.commit()
            return True
        return False
