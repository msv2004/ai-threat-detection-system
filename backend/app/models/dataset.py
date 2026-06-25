import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    filename = Column(String, index=True, nullable=False)
    dataset_type = Column(String, nullable=False)
    status = Column(String, default="processing", nullable=False)
    size_bytes = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    sha256_hash = Column(String, nullable=True)
    
    # Metadata
    rows = Column(Integer, nullable=True)
    columns = Column(Integer, nullable=True)
    missing_values = Column(Integer, nullable=True)

    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to user
    user = relationship("User", backref="datasets")
