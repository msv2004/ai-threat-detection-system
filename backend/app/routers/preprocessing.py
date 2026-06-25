from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.preprocessing import PreprocessingConfig, PreprocessingJobResponse, DatasetProfileResponse
from app.repositories.preprocessing_repository import PreprocessingRepository
from app.repositories.dataset_repository import DatasetRepository
from app.services.preprocessing_service import PreprocessingService

router = APIRouter(tags=["Preprocessing"])

def get_preprocessing_service(db: Session = Depends(get_db)):
    repo = PreprocessingRepository(db)
    dataset_repo = DatasetRepository(db)
    return PreprocessingService(repo, dataset_repo)

@router.post("/start", response_model=PreprocessingJobResponse, status_code=status.HTTP_202_ACCEPTED)
def start_preprocessing(
    config: PreprocessingConfig,
    background_tasks: BackgroundTasks,
    service: PreprocessingService = Depends(get_preprocessing_service),
    current_user: User = Depends(get_current_user)
):
    """
    Start an asynchronous data preprocessing job.
    """
    return service.start_job(config, current_user.id, background_tasks)

@router.get("/jobs", response_model=List[PreprocessingJobResponse])
def list_preprocessing_jobs(
    service: PreprocessingService = Depends(get_preprocessing_service),
    current_user: User = Depends(get_current_user)
):
    """
    List all preprocessing jobs for the current user.
    """
    return service.list_jobs(current_user.id)

@router.get("/jobs/{job_id}", response_model=PreprocessingJobResponse)
def get_preprocessing_job(
    job_id: UUID,
    service: PreprocessingService = Depends(get_preprocessing_service),
    current_user: User = Depends(get_current_user)
):
    """
    Get the status of a specific preprocessing job.
    """
    return service.get_job(job_id, current_user.id)

@router.get("/report/{dataset_id}", response_model=DatasetProfileResponse)
def get_preprocessing_report(
    dataset_id: UUID,
    service: PreprocessingService = Depends(get_preprocessing_service),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the dataset profile report after preprocessing.
    """
    return service.get_profile(dataset_id, current_user.id)
