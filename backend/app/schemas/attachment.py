from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class AttachmentResponse(BaseModel):
    id: str
    filename: str
    file_path: str
    file_type: str
    mime_type: Optional[str] = None
    size: Optional[int] = None
    session_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
