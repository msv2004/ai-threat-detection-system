from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database.session import get_db, SessionLocal
from app.models.role import Role
from app.repositories.user_repository import UserRepository
from app.routers.auth import router as auth_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)

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
            except Exception:
                # If DB is not available yet (e.g. during migrations), skip seeding silently
                pass
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    seed_roles()

@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Health check endpoint to verify backend status.
    """
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
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


