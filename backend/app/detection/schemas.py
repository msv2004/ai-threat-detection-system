from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class DetectionStartRequest(BaseModel):
    interface: str
    mode: str = "live" # 'live' or 'offline'
    file_path: Optional[str] = None # For offline mode
    replay_speed: float = 0.0

class DetectionSessionResponse(BaseModel):
    id: UUID
    interface: str
    mode: str
    status: str
    start_time: datetime
    stop_time: Optional[datetime]
    packet_count: int
    flow_count: int
    threat_count: int

    class Config:
        from_attributes = True

class DetectionStatisticsResponse(BaseModel):
    session_id: str
    interface: str
    duration_seconds: float
    packet_count: int
    flow_count: int
    threat_count: int
    benign_count: int
    critical_count: int
    packets_per_sec: float
    flows_per_sec: float
    average_latency: float
