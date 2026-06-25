import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class DatasetProfile(Base):
    __tablename__ = "dataset_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    duplicate_rows = Column(Integer, default=0)
    numeric_features = Column(JSON, default=list)
    categorical_features = Column(JSON, default=list)
    class_distribution = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dataset = relationship("Dataset", backref="profile")


class PreprocessingJob(Base):
    __tablename__ = "preprocessing_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String, default="queued", nullable=False) # queued, running, completed, failed
    config = Column(JSON, nullable=False)
    error_message = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    dataset = relationship("Dataset", backref="preprocessing_jobs")
    processed_dataset = relationship("ProcessedDataset", back_populates="job", uselist=False)


class ProcessedDataset(Base):
    __tablename__ = "processed_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    original_dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("preprocessing_jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    train_features_path = Column(String, nullable=False)
    train_labels_path = Column(String, nullable=False)
    test_features_path = Column(String, nullable=False)
    test_labels_path = Column(String, nullable=False)
    preprocessor_path = Column(String, nullable=True)
    
    train_samples = Column(Integer, nullable=False)
    test_samples = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    original_dataset = relationship("Dataset", backref="processed_datasets")
    job = relationship("PreprocessingJob", back_populates="processed_dataset")
