import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class DetectionSession(Base):
    __tablename__ = "detection_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    interface = Column(String, nullable=False)  # 'pcap' or 'eth0', 'en0', etc.
    mode = Column(String, nullable=False)  # 'offline' or 'live'
    status = Column(String, default="running", nullable=False)  # running, completed, failed
    
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    stop_time = Column(DateTime(timezone=True), nullable=True)
    
    packet_count = Column(Integer, default=0, nullable=False)
    flow_count = Column(Integer, default=0, nullable=False)
    threat_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="detection_sessions")
