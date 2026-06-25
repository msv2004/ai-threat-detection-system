from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    ThreatsAnalyticsResponse,
    ThreatTimelineResponse,
    ModelsAnalyticsResponse,
    ModelMonitoringResponse,
    DatasetsAnalyticsResponse,
    AuditLogItem
)

router = APIRouter(prefix="/analytics", tags=["Security Analytics & Observability"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exposes top-level system metrics overview: prediction counts, threat counts, dataset counts, and active model overview.
    """
    service = AnalyticsService(db)
    return service.get_overview(current_user.id)

@router.get("/threats", response_model=ThreatsAnalyticsResponse)
def get_threats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregates threat analytics by severity, status, and attack category, returning recent threat records.
    """
    service = AnalyticsService(db)
    return service.get_threats_analytics(current_user.id)

@router.get("/threats/timeline", response_model=ThreatTimelineResponse)
def get_timeline(
    range: str = Query("this_week", description="Timeline range: today, yesterday, this_week, this_month, custom"),
    start_date: Optional[datetime] = Query(None, description="Start date (UTC) for custom range"),
    end_date: Optional[datetime] = Query(None, description="End date (UTC) for custom range"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves threat timeline data points showing trends over time grouped by severity and attack category.
    """
    service = AnalyticsService(db)
    timeline_data = service.get_threats_timeline(current_user.id, range, start_date, end_date)
    return {
        "range": range,
        "timeline": timeline_data
    }

@router.get("/models", response_model=ModelsAnalyticsResponse)
def get_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregates models registry stats: trained models count, active model metrics, performance history, and training job statuses.
    """
    service = AnalyticsService(db)
    return service.get_models_analytics(current_user.id)

@router.get("/models/monitoring", response_model=ModelMonitoringResponse)
def get_monitoring(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Provides real-time model monitoring metrics for the active model: prediction counts, confidence, latency, and failures.
    """
    service = AnalyticsService(db)
    return service.get_model_monitoring(current_user.id)

@router.get("/datasets", response_model=DatasetsAnalyticsResponse)
def get_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exposes dataset statistics: count of datasets, total sizing, and breakdown by formats.
    """
    service = AnalyticsService(db)
    return service.get_datasets_analytics(current_user.id)

@router.get("/audit-logs", response_model=List[AuditLogItem])
def get_audit_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves audit logs of critical actions stored in the Event Store (login, uploads, training, predictions, threats).
    """
    service = AnalyticsService(db)
    return service.get_audit_logs(current_user.id, event_type, skip, limit)
