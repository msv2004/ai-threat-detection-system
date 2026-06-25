import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, backref
from app.database.base import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_histories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("trained_models.id", ondelete="SET NULL"), nullable=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    prediction_job_id = Column(UUID(as_uuid=True), ForeignKey("prediction_jobs.id", ondelete="SET NULL"), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    input_data = Column(JSON, nullable=False)
    prediction_label = Column(Integer, nullable=False)  # 0 for benign, 1 for anomaly/threat
    confidence = Column(Float, nullable=False)
    threat_score = Column(Integer, nullable=False)  # 0-100
    processing_latency = Column(Float, nullable=True)  # in seconds
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="prediction_histories")
    model = relationship("TrainedModel", backref="prediction_histories")
    dataset = relationship("Dataset", backref="prediction_histories")
    prediction_job = relationship("PredictionJob", back_populates="prediction_records")
    
    threat = relationship("Threat", back_populates="prediction", uselist=False, cascade="all, delete-orphan")


class Threat(Base):
    __tablename__ = "threats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey("prediction_histories.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    severity = Column(String, nullable=False)  # Benign, Low, Medium, High, Critical
    confidence = Column(Float, nullable=False)
    threat_score = Column(Integer, nullable=False)  # 0-100
    attack_type = Column(String, default="Malicious Traffic", nullable=False)
    mitre_technique = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)
    source_dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    model_version = Column(Integer, nullable=False)
    
    detection_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolution_status = Column(String, default="Open", nullable=False)  # Open, Investigating, Resolved, False Positive
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("PredictionHistory", back_populates="threat")
    user = relationship("User", backref="threats")
    source_dataset = relationship("Dataset", backref="threats")
    intelligence_reports = relationship("ThreatIntelligence", back_populates="threat", cascade="all, delete-orphan")

class ThreatIntelligence(Base):
    __tablename__ = "threat_intelligence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    threat_id = Column(UUID(as_uuid=True), ForeignKey("threats.id", ondelete="CASCADE"), nullable=False)
    
    provider = Column(String, nullable=False)  # e.g., AbuseIPDB, VirusTotal
    malicious_score = Column(Float, nullable=True)
    tags = Column(JSON, nullable=True)
    details = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    threat = relationship("Threat", back_populates="intelligence_reports")



class PredictionJob(Base):
    __tablename__ = "prediction_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    status = Column(String, default="queued", nullable=False)  # queued, running, completed, failed
    model_id = Column(UUID(as_uuid=True), ForeignKey("trained_models.id", ondelete="CASCADE"), nullable=False)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="SET NULL"), nullable=True)
    
    output_file_path = Column(String, nullable=True)
    report = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    model = relationship("TrainedModel", backref="prediction_jobs")
    dataset = relationship("Dataset", backref="prediction_jobs")
    user = relationship("User", backref="prediction_jobs")
    prediction_records = relationship("PredictionHistory", back_populates="prediction_job")
