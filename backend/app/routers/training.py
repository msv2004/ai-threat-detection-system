from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.training import (
    TrainingJobCreate,
    TrainingJobResponse,
    TrainedModelResponse,
    ModelComparisonResponse
)
from app.repositories.training_repository import TrainingRepository
from app.repositories.preprocessing_repository import PreprocessingRepository
from app.services.training_service import TrainingService

router = APIRouter()

def get_training_service(db: Session = Depends(get_db)):
    repo = TrainingRepository(db)
    preprocessing_repo = PreprocessingRepository(db)
    return TrainingService(repo, preprocessing_repo)

# 1. Start Training Job
@router.post("/models/train", response_model=TrainingJobResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Training"])
def train_model(
    config: TrainingJobCreate,
    background_tasks: BackgroundTasks,
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    Start an asynchronous training job for a specified algorithm and preprocessed dataset.
    """
    return service.start_job(config, current_user.id, background_tasks)

# 2. List Models
@router.get("/models", response_model=List[TrainedModelResponse], tags=["Model Registry"])
def list_models(
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    List all trained models in the registry for the current user.
    """
    return service.list_models(current_user.id)

# 3. Compare Models (placed before /{id} to prevent path conflict)
@router.get("/models/compare", response_model=List[ModelComparisonResponse], tags=["Model Registry"])
def compare_models(
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    Compare performance metrics and training times across all registered models.
    """
    return service.compare_models(current_user.id)

# 4. Get Model by ID
@router.get("/models/{id}", response_model=TrainedModelResponse, tags=["Model Registry"])
def get_model(
    id: UUID,
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific trained model from the registry.
    """
    return service.get_model(id, current_user.id)

# 5. List Training Jobs
@router.get("/training/jobs", response_model=List[TrainingJobResponse], tags=["Training"])
def list_jobs(
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    List all training jobs for the current user.
    """
    return service.list_jobs(current_user.id)

# 6. Get Training Job by ID
@router.get("/training/jobs/{id}", response_model=TrainingJobResponse, tags=["Training"])
def get_job(
    id: UUID,
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    Get the status of a specific training job.
    """
    return service.get_job(id, current_user.id)

# 7. Activate Model
@router.post("/models/{id}/activate", response_model=TrainedModelResponse, tags=["Model Registry"])
def activate_model(
    id: UUID,
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    Activate a model in the registry (deactivates other versions of the same name).
    """
    return service.activate_model(id, current_user.id)

# 8. Delete Model
@router.delete("/models/{id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Model Registry"])
def delete_model(
    id: UUID,
    service: TrainingService = Depends(get_training_service),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a trained model from the registry and remove its artifacts from disk.
    """
    service.delete_model(id, current_user.id)
    return None
