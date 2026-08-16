from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None

class ChatSessionUpdateRequest(BaseModel):
    title: str

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    is_saved: bool
    created_at: datetime
    session_id: Optional[str] = None
    session_title: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    project_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionDetailResponse(ChatSessionResponse):
    messages: List[ChatMessageResponse]
