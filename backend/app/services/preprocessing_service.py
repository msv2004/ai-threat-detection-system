from fastapi import BackgroundTasks
from uuid import UUID
from typing import List
from app.repositories.preprocessing_repository import PreprocessingRepository
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.preprocessing import PreprocessingConfig
from app.models.preprocessing import PreprocessingJob, DatasetProfile
from app.core.exceptions import NotFoundError, BadRequestError
from app.services.preprocessing_tasks import run_preprocessing_job

class PreprocessingService:
    def __init__(self, repo: PreprocessingRepository, dataset_repo: DatasetRepository):
        self.repo = repo
        self.dataset_repo = dataset_repo

    def start_job(self, config: PreprocessingConfig, user_id: int, background_tasks: BackgroundTasks) -> PreprocessingJob:
        # Verify dataset exists and belongs to user
        dataset = self.dataset_repo.get_by_id(config.dataset_id)
        if not dataset or dataset.uploaded_by != user_id:
            raise NotFoundError("Dataset not found")
            
        if dataset.status != "ready":
            raise BadRequestError("Dataset is not ready for preprocessing.")

        # Create job
        job = self.repo.create_job(dataset.id, config)

        # Enqueue background task
        background_tasks.add_task(
            run_preprocessing_job,
            job.id,
            dataset.id,
            config.model_dump(mode="json"),
            dataset.file_path,
            user_id
        )

        return job

    def get_job(self, job_id: UUID, user_id: int) -> PreprocessingJob:
        job = self.repo.get_job(job_id)
        if not job or job.dataset.uploaded_by != user_id:
            raise NotFoundError("Preprocessing job not found")
        return job

    def list_jobs(self, user_id: int) -> List[PreprocessingJob]:
        # Simple implementation: list jobs for all datasets owned by user
        # In a real app, you might want to paginate or filter by dataset
        datasets = self.dataset_repo.list_by_user(user_id)
        all_jobs = []
        for d in datasets:
            all_jobs.extend(self.repo.get_jobs_by_dataset(d.id))
        return sorted(all_jobs, key=lambda j: j.created_at, reverse=True)

    def get_profile(self, dataset_id: UUID, user_id: int) -> DatasetProfile:
        dataset = self.dataset_repo.get_by_id(dataset_id)
        if not dataset or dataset.uploaded_by != user_id:
            raise NotFoundError("Dataset not found")
            
        profile = self.repo.get_profile(dataset_id)
        if not profile:
            raise NotFoundError("Profile not generated yet. Run a preprocessing job first.")
        return profile
