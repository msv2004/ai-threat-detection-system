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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    setup_logging()
    logger.info("Starting up application...")
    seed_roles()
    
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

@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Health check endpoint to verify backend status.
    """
    logger.info("Health check pinged")
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

@app.get("/health/database", tags=["Health Check"])
def health_database(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify database connectivity.
    """
    try:
        # Execute simple query to test connection (pings the database)
        db.execute(text("SELECT 1"))
        logger.info("Database health check pinged - connected")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
