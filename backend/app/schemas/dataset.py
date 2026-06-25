from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class DatasetResponse(BaseModel):
    id: UUID
    filename: str
    dataset_type: str
    status: str
    size_bytes: int
    sha256_hash: Optional[str] = None
    rows: Optional[int] = None
    columns: Optional[int] = None
    missing_values: Optional[int] = None
    uploaded_by: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
