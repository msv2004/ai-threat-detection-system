from pydantic import BaseModel, Field, field_validator
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime

class PredictionRequest(BaseModel):
    input_data: Dict[str, Any] = Field(..., description="Key-value mapping of raw features for inference.")
    model_id: Optional[UUID] = Field(None, description="Optional. UUID of model to use. Defaults to the active model.")


class PredictionResponse(BaseModel):
    prediction_id: UUID
    model_id: UUID
    model_version: int
    prediction_label: int  # 0 or 1
    confidence: float
    threat_score: int  # 0-100
    severity: str  # Benign, Low, Medium, High, Critical
    explainability: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class BatchPredictionRequest(BaseModel):
    dataset_id: UUID
    model_id: Optional[UUID] = Field(None, description="Optional. UUID of model to use. Defaults to active model.")


class PredictionJobResponse(BaseModel):
    id: UUID
    status: str
    model_id: UUID
    dataset_id: Optional[UUID] = None
    output_file_path: Optional[str] = None
    report: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ThreatIntelligenceResponse(BaseModel):
    id: UUID
    provider: str
    malicious_score: Optional[float] = None
    tags: Optional[List[str]] = []
    details: Optional[Dict[str, Any]] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class ThreatResponse(BaseModel):
    id: UUID
    prediction_id: UUID
    severity: str
    confidence: float
    threat_score: int
    attack_type: str
    mitre_technique: Optional[str] = None
    recommended_action: Optional[str] = None
    source_dataset_id: Optional[UUID] = None
    model_version: int
    detection_time: datetime
    resolution_status: str
    created_at: datetime
    intelligence_reports: Optional[List[ThreatIntelligenceResponse]] = []

    class Config:
        from_attributes = True


ALLOWED_RESOLUTION_STATUSES = ["Open", "Investigating", "Resolved", "False Positive"]

class ThreatStatusUpdate(BaseModel):
    resolution_status: str

    @field_validator("resolution_status")
    @classmethod
    def validate_resolution_status(cls, v: str) -> str:
        if v not in ALLOWED_RESOLUTION_STATUSES:
            raise ValueError(f"Resolution status must be one of {ALLOWED_RESOLUTION_STATUSES}")
        return v
