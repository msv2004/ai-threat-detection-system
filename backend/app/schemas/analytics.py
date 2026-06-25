from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Any, Optional
from datetime import datetime
from uuid import UUID

# Overview
class ActiveModelOverview(BaseModel):
    id: UUID
    name: str
    version: int
    algorithm: str
    accuracy: Optional[float] = None

class AnalyticsOverviewResponse(BaseModel):
    total_predictions: int
    total_threats: int
    total_datasets: int
    total_training_jobs: int
    average_latency: float  # in seconds
    active_model: Optional[ActiveModelOverview] = None

# Threats Breakdown
class RecentThreatInfo(BaseModel):
    id: UUID
    prediction_id: UUID
    severity: str
    confidence: float
    threat_score: int
    attack_type: str
    mitre_technique: Optional[str] = None
    recommended_action: Optional[str] = None
    detection_time: datetime
    resolution_status: str

class ThreatsAnalyticsResponse(BaseModel):
    total_threats: int
    by_severity: Dict[str, int]
    by_category: Dict[str, int]
    by_status: Dict[str, int]
    recent_threats: List[RecentThreatInfo]

# Threat Timeline
class ThreatTimelineDataPoint(BaseModel):
    time_label: str  # e.g., "2026-06-25" or "14:00"
    total_threats: int
    by_severity: Dict[str, int]
    by_category: Dict[str, int]

class ThreatTimelineResponse(BaseModel):
    range: str
    timeline: List[ThreatTimelineDataPoint]

# Models Analytics
class ModelPerformanceHistoryItem(BaseModel):
    id: UUID
    name: str
    version: int
    algorithm: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    created_at: datetime

class ModelsAnalyticsResponse(BaseModel):
    total_models: int
    active_model_metrics: Optional[Dict[str, Any]] = None
    model_performance_history: List[ModelPerformanceHistoryItem]
    training_job_stats: Dict[str, int]

# Model Monitoring
class ModelMonitoringResponse(BaseModel):
    active_model_id: Optional[UUID] = None
    active_model_name: Optional[str] = None
    active_model_version: Optional[int] = None
    prediction_count: int
    average_confidence: float
    average_latency: float
    failure_count: int

# Datasets Analytics
class RecentDatasetInfo(BaseModel):
    id: UUID
    filename: str
    dataset_type: str
    size_bytes: int
    status: str
    created_at: datetime

class DatasetsAnalyticsResponse(BaseModel):
    total_datasets: int
    total_size_bytes: int
    by_type: Dict[str, int]
    recent_datasets: List[RecentDatasetInfo]

# Audit Logs
class AuditLogItem(BaseModel):
    id: UUID
    event_type: str
    payload: Dict[str, Any]
    correlation_id: Optional[UUID] = None
    user_id: Optional[int] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
