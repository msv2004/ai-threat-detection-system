from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.session import get_db
from app.schemas.dataset import DatasetResponse
from app.repositories.dataset_repository import DatasetRepository
from app.services.dataset_service import DatasetService
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Datasets"])

def get_dataset_service(db: Session = Depends(get_db)):
    repo = DatasetRepository(db)
    return DatasetService(repo)

@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_202_ACCEPTED)
def upload_dataset(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    service: DatasetService = Depends(get_dataset_service),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a dataset (CSV or PCAP) for processing.
    Processing happens asynchronously in the background.
    """
    dataset = service.upload_dataset(file, current_user.id, background_tasks)
    return dataset

@router.get("/", response_model=List[DatasetResponse])
def list_datasets(
    service: DatasetService = Depends(get_dataset_service),
    current_user: User = Depends(get_current_user)
):
    """
    Lists all datasets uploaded by the current user.
    """
    return service.list_datasets(current_user.id)

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: UUID,
    service: DatasetService = Depends(get_dataset_service),
    current_user: User = Depends(get_current_user)
):
    """
    Gets details and processing status of a specific dataset.
    """
    return service.get_dataset(dataset_id, current_user.id)

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: UUID,
    service: DatasetService = Depends(get_dataset_service),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a dataset and its associated file.
    """
    service.delete_dataset(dataset_id, current_user.id)
    return None
