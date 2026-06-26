from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime

ALLOWED_ALGORITHMS = ["Logistic Regression", "Decision Tree", "Random Forest", "Isolation Forest"]

class TrainingJobCreate(BaseModel):
    processed_dataset_id: UUID
    algorithm: str
    model_name: str = Field(..., min_length=1, max_length=100)
    hyperparameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        if v not in ALLOWED_ALGORITHMS:
            raise ValueError(f"Algorithm must be one of {ALLOWED_ALGORITHMS}")
        return v


class TrainingJobResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    processed_dataset_id: Optional[UUID]
    algorithm: str
    status: str
    config: Dict[str, Any]
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    duration: Optional[float] = None
    error_message: Optional[str] = None
    
    # Progress monitoring
    progress_stage: Optional[str] = "Queued"
    progress_percent: Optional[int] = 0
    progress_logs: Optional[List[str]] = None
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrainedModelResponse(BaseModel):
    id: UUID
    name: str
    version: int
    algorithm: str
    dataset_id: UUID
    processed_dataset_id: UUID
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    confusion_matrix: Optional[Any] = None
    feature_importance: Optional[List[Dict[str, Any]]] = None
    file_path: str
    active_flag: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ModelComparisonResponse(BaseModel):
    id: UUID
    name: str
    version: int
    algorithm: str
    accuracy: Optional[float] = None
    f1_score: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    roc_auc: Optional[float] = None
    training_time: Optional[float] = None  # matches job duration

    class Config:
        from_attributes = True
