from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.services.prediction_service import PredictionService
from app.repositories.prediction_repository import PredictionRepository
from app.services.event_store_service import EventStoreService

from app.detection.schemas import DetectionStartRequest, DetectionSessionResponse
from app.detection.services import DetectionService

router = APIRouter()

def get_detection_service(db: Session = Depends(get_db)):
    prediction_repo = PredictionRepository(db)
    prediction_service = PredictionService(prediction_repo)
    event_store = EventStoreService()
    return DetectionService(db, prediction_service, event_store)

# Global singleton so state persists across requests during development.
# In a production app, we would resolve this properly using dependency injection and Redis.
_global_detection_service = None

def get_global_detection_service(db: Session = Depends(get_db)):
    global _global_detection_service
    if _global_detection_service is None:
        prediction_repo = PredictionRepository(db)
        prediction_service = PredictionService(prediction_repo)
        event_store = EventStoreService()
        _global_detection_service = DetectionService(db, prediction_service, event_store)
    # Just update the DB session to the current request
    _global_detection_service.db = db
    return _global_detection_service

@router.post("/start", response_model=DetectionSessionResponse)
def start_detection(
    request: DetectionStartRequest,
    background_tasks: BackgroundTasks,
    service: DetectionService = Depends(get_global_detection_service),
    current_user: dict = Depends(get_current_user)
):
    """Start a live network detection session."""
    try:
        session = service.start_session(current_user.id, request, background_tasks)
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/stop")
def stop_detection(
    service: DetectionService = Depends(get_global_detection_service),
    current_user: dict = Depends(get_current_user)
):
    """Stop the active detection session."""
    try:
        service.stop_session(current_user.id)
        return {"message": "Session stopped successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
def get_status(
    service: DetectionService = Depends(get_global_detection_service),
    current_user: dict = Depends(get_current_user)
):
    """Get the live statistics of the current running session."""
    return service.get_status()

# To satisfy prompt: GET /api/v1/detection/sessions, /sessions/{id}, /statistics
@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from app.models.detection import DetectionSession
    return db.query(DetectionSession).filter(DetectionSession.user_id == current_user.id).order_by(DetectionSession.start_time.desc()).limit(50).all()

@router.get("/sessions/{session_id}")
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from app.models.detection import DetectionSession
    session = db.query(DetectionSession).filter(DetectionSession.id == session_id, DetectionSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/statistics")
def get_statistics(
    service: DetectionService = Depends(get_global_detection_service),
    current_user: dict = Depends(get_current_user)
):
    # This acts similarly to status but could return historical stats too
    return service.get_status()
