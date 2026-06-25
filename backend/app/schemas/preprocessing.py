from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime

class PreprocessingConfig(BaseModel):
    dataset_id: UUID
    target_column: str
    missing_value_strategy: str = Field(default="mean", description="'mean', 'median', 'most_frequent', or 'drop'")
    scaling_strategy: str = Field(default="standard", description="'standard' or 'min-max'")
    encoding_strategy: str = Field(default="label", description="'label' or 'one-hot'")
    test_size: float = Field(default=0.2, ge=0.05, le=0.5)
    random_state: int = Field(default=42)

class DatasetProfileResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    duplicate_rows: int
    numeric_features: List[str]
    categorical_features: List[str]
    class_distribution: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ProcessedDatasetResponse(BaseModel):
    id: UUID
    train_samples: int
    test_samples: int
    created_at: datetime

    class Config:
        from_attributes = True

class PreprocessingJobResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    status: str
    config: Dict[str, Any]
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    processed_dataset: Optional[ProcessedDatasetResponse] = None

    class Config:
        from_attributes = True
