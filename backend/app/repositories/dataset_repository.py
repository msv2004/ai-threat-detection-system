from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.models.dataset import Dataset

class DatasetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, dataset: Dataset) -> Dataset:
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def get_by_id(self, dataset_id: UUID) -> Optional[Dataset]:
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def get_by_filename_and_user(self, filename: str, user_id: int) -> Optional[Dataset]:
        return self.db.query(Dataset).filter(Dataset.filename == filename, Dataset.uploaded_by == user_id).first()

    def list_all(self, skip: int = 0, limit: int = 100) -> List[Dataset]:
        return self.db.query(Dataset).offset(skip).limit(limit).all()
        
    def list_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Dataset]:
        return self.db.query(Dataset).filter(Dataset.uploaded_by == user_id).offset(skip).limit(limit).all()

    def update(self, dataset: Dataset) -> Dataset:
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def delete(self, dataset: Dataset) -> None:
        self.db.delete(dataset)
        self.db.commit()
