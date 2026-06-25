from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.models.preprocessing import DatasetProfile, PreprocessingJob, ProcessedDataset
from app.schemas.preprocessing import PreprocessingConfig

class PreprocessingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_profile(self, dataset_id: UUID) -> Optional[DatasetProfile]:
        return self.db.query(DatasetProfile).filter(DatasetProfile.dataset_id == dataset_id).first()

    def create_profile(self, profile_data: dict) -> DatasetProfile:
        profile = DatasetProfile(**profile_data)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def create_job(self, dataset_id: UUID, config: PreprocessingConfig) -> PreprocessingJob:
        job = PreprocessingJob(
            dataset_id=dataset_id,
            config=config.model_dump(mode="json"),
            status="queued"
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_job(self, job_id: UUID) -> Optional[PreprocessingJob]:
        return self.db.query(PreprocessingJob).filter(PreprocessingJob.id == job_id).first()

    def get_jobs_by_dataset(self, dataset_id: UUID) -> List[PreprocessingJob]:
        return self.db.query(PreprocessingJob).filter(PreprocessingJob.dataset_id == dataset_id).order_by(PreprocessingJob.created_at.desc()).all()
        
    def list_jobs(self, skip: int = 0, limit: int = 100) -> List[PreprocessingJob]:
        return self.db.query(PreprocessingJob).order_by(PreprocessingJob.created_at.desc()).offset(skip).limit(limit).all()

    def update_job_status(self, job_id: UUID, status: str, error_message: str = None) -> PreprocessingJob:
        job = self.get_job(job_id)
        if job:
            job.status = status
            if error_message:
                job.error_message = error_message
            self.db.commit()
            self.db.refresh(job)
        return job

    def create_processed_dataset(self, processed_data: dict) -> ProcessedDataset:
        processed = ProcessedDataset(**processed_data)
        self.db.add(processed)
        self.db.commit()
        self.db.refresh(processed)
        return processed
