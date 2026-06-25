from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database.session import get_db, SessionLocal
from app.models.role import Role
from app.repositories.user_repository import UserRepository
from app.routers.auth import router as auth_router
from app.routers.datasets import router as datasets_router
from app.routers.preprocessing import router as preprocessing_router
from app.routers.training import router as training_router
from app.routers.prediction import router as prediction_router
from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router

from app.middleware.request_id_middleware import RequestIDMiddleware
from app.core.exceptions import AppException
from app.core.exception_handlers import (
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from app.core.logger import setup_logging, logger

def seed_roles():
    """
    Seeds default system security roles if they do not exist.
    """
    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        roles = [
            ("Admin", "Full administrative access to the platform."),
            ("Security Analyst", "Access to training models, uploading datasets, and threat detection analysis."),
            ("Viewer", "Read-only access to threats history and dashboards.")
        ]
        for name, description in roles:
            try:
                if not user_repo.get_role_by_name(name):
                    new_role = Role(name=name, description=description)
                    user_repo.create_role(new_role)
            except Exception as e:
                # If DB is not available yet (e.g. during migrations), skip seeding silently
                pass
    finally:
        db.close()

def setup_event_listeners():
    from app.core.events import event_bus
    from app.services.threat_intelligence_service import threat_intelligence_service
    from app.websocket.manager import websocket_manager
    
    event_bus.subscribe("threat_generated", threat_intelligence_service.handle_threat_generated)
    
    # Bridge key event bus events to WebSockets
    async def forward_event_to_websocket(event, **kwargs):
        try:
            event_type = getattr(event, "event_type", None) or (event.get("event_type") if isinstance(event, dict) else "unknown")
            payload = getattr(event, "payload", None) or (event.get("payload") if isinstance(event, dict) else {})
            user_id = getattr(event, "user_id", None) or (event.get("user_id") if isinstance(event, dict) else None)
            
            await websocket_manager.broadcast_json({
                "type": "system_event",
                "event_type": str(event_type),
                "payload": payload,
                "user_id": user_id
            })
        except Exception as e:
            logger.error(f"Error forwarding event to websocket: {e}")

    events_to_forward = [
        "training_started", "training_completed", "training_failed",
        "batch_prediction_started", "batch_prediction_completed", "batch_prediction_failed",
        "threat_generated", "threat_status_updated",
        "dataset_uploaded", "dataset_processed", "dataset_failed",
        "detection_started", "detection_stopped"
    ]
    for et in events_to_forward:
        event_bus.subscribe(et, forward_event_to_websocket)
        
    logger.info("Event listeners registered and bridged to websocket.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    setup_logging()
    logger.info("Starting up application...")
    seed_roles()
    setup_event_listeners()
    
    yield
    
    # Shutdown logic
    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Add Middleware
app.add_middleware(RequestIDMiddleware)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Global Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(datasets_router, prefix=f"{settings.API_V1_STR}/datasets")
app.include_router(preprocessing_router, prefix=f"{settings.API_V1_STR}/preprocessing")
app.include_router(training_router, prefix=settings.API_V1_STR)
app.include_router(prediction_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(health_router)  # /health prefix routes (not prefixed with /api/v1)

from app.detection.routers import router as detection_router
app.include_router(detection_router, prefix=f"{settings.API_V1_STR}/detection")

from fastapi import WebSocket, WebSocketDisconnect
from app.websocket.manager import websocket_manager

@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
