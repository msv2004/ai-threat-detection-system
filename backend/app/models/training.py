import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class TrainingJob(Base):
    __tablename__ = "training_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    processed_dataset_id = Column(UUID(as_uuid=True), ForeignKey("processed_datasets.id", ondelete="CASCADE"), nullable=True)
    
    algorithm = Column(String, nullable=False)
    status = Column(String, default="queued", nullable=False)  # queued, running, completed, failed
    config = Column(JSON, default=dict, nullable=False)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration = Column(Float, nullable=True)
    error_message = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Progress monitoring fields
    progress_stage = Column(String, default="Queued", nullable=True)
    progress_percent = Column(Integer, default=0, nullable=True)
    progress_logs = Column(JSON, default=list, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    dataset = relationship("Dataset", backref="training_jobs")
    processed_dataset = relationship("ProcessedDataset", backref="training_jobs")
    user = relationship("User", backref="training_jobs")


class TrainedModel(Base):
    __tablename__ = "trained_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    version = Column(Integer, nullable=False)
    algorithm = Column(String, nullable=False)
    
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    processed_dataset_id = Column(UUID(as_uuid=True), ForeignKey("processed_datasets.id", ondelete="CASCADE"), nullable=False)
    
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    confusion_matrix = Column(JSON, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    
    file_path = Column(String, nullable=False)
    active_flag = Column(Boolean, default=False, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dataset = relationship("Dataset", backref="trained_models")
    processed_dataset = relationship("ProcessedDataset", backref="trained_models")
    user = relationship("User", backref="trained_models")
