from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database.session import get_db

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

