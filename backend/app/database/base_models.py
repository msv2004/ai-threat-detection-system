# Import all database models in one place so that Alembic's env.py
# can discover all tables dynamically for autogenerating migrations.

from app.database.base import Base
from app.models.role import Role
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.dataset import Dataset
from app.models.preprocessing import DatasetProfile, PreprocessingJob, ProcessedDataset
from app.models.training import TrainingJob, TrainedModel
from app.models.prediction import PredictionHistory, Threat, PredictionJob, ThreatIntelligence
from app.models.system_event import SystemEvent
from app.models.detection import DetectionSession

