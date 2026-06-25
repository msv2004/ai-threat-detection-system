from fastapi import APIRouter, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    PredictionJobResponse,
    ThreatResponse,
    ThreatStatusUpdate
)
from app.repositories.prediction_repository import PredictionRepository
from app.services.prediction_service import PredictionService

router = APIRouter()

def get_prediction_service(db: Session = Depends(get_db)):
    repo = PredictionRepository(db)
    return PredictionService(repo)

# 1. Single Prediction
@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK, tags=["Threat Detection"])
def predict_single(
    request: PredictionRequest,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    Perform on-the-fly threat detection/inference on a single network flow record.
    Uses the active model from the registry (or specified model_id).
    """
    return service.predict(request, current_user.id)

# 2. Batch Prediction
@router.post("/predict/batch", response_model=PredictionJobResponse, status_code=status.HTTP_202_ACCEPTED, tags=["Threat Detection"])
def predict_batch(
    config: BatchPredictionRequest,
    background_tasks: BackgroundTasks,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    Start an asynchronous batch prediction job on an uploaded dataset.
    """
    return service.start_batch_job(config, current_user.id, background_tasks)

# 3. Get Batch Threat Report (placed before /{id} to avoid conflicts)
@router.get("/predictions/report/{job_id}", response_model=dict, tags=["Threat Detection"])
def get_batch_report(
    job_id: UUID,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the aggregated threat report for a completed batch prediction job.
    """
    job = service.get_prediction_job(job_id, current_user.id)
    if job.status != "completed":
        return {
            "job_id": str(job_id),
            "status": job.status,
            "error_message": job.error_message,
            "report": None
        }
    return job.report

# 4. List Predictions History
@router.get("/predictions", response_model=List[PredictionResponse], tags=["Inference Audit Trail"])
def list_predictions(
    model_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the audit trail of all previous inference requests.
    """
    records = service.list_predictions(current_user.id, model_id, skip, limit)
    # Map to schema response
    responses = []
    for r in records:
        explainability = []
        responses.append(PredictionResponse(
            prediction_id=r.id,
            model_id=r.model_id or UUID("00000000-0000-0000-0000-000000000000"),
            model_version=r.model.version if r.model else 0,
            prediction_label=r.prediction_label,
            confidence=r.confidence,
            threat_score=r.threat_score,
            severity=service._resolve_severity(r.threat_score),
            explainability=[]
        ))
    return responses

# 5. Get Prediction Detail by ID
@router.get("/predictions/{id}", response_model=PredictionResponse, tags=["Inference Audit Trail"])
def get_prediction(
    id: UUID,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve audit details of a specific prediction query by its ID.
    """
    r = service.get_prediction(id, current_user.id)
    return PredictionResponse(
        prediction_id=r.id,
        model_id=r.model_id or UUID("00000000-0000-0000-0000-000000000000"),
        model_version=r.model.version if r.model else 0,
        prediction_label=r.prediction_label,
        confidence=r.confidence,
        threat_score=r.threat_score,
        severity=service._resolve_severity(r.threat_score),
        explainability=[]
    )

# 6. List Incidents (Threats for SOC workflow)
@router.get("/threats", response_model=List[ThreatResponse], tags=["SOC Incidents Dashboard"])
def list_threats(
    status: Optional[str] = None,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    List all detected malicious threat incidents for the SOC analyst dashboard workflow.
    """
    return service.list_threats(current_user.id, status)

# 7. Update Incident status (investigating, resolved, etc.)
@router.put("/threats/{id}/status", response_model=ThreatResponse, tags=["SOC Incidents Dashboard"])
def update_threat_status(
    id: UUID,
    payload: ThreatStatusUpdate,
    service: PredictionService = Depends(get_prediction_service),
    current_user: User = Depends(get_current_user)
):
    """
    Update the resolution status of a detected threat incident (e.g., Open -> Resolved).
    """
    return service.update_threat_status(id, payload.resolution_status, current_user.id)
