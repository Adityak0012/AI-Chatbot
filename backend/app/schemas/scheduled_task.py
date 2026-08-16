from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from croniter import croniter

class ScheduledTaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    prompt: str
    cron_expression: str = Field(..., max_length=100)
    timezone: str = Field("UTC", max_length=100)
    is_active: bool = True
    
    @validator('cron_expression')
    def validate_cron(cls, v):
        if not croniter.is_valid(v):
            raise ValueError('Invalid cron expression')
        return v

class ScheduledTaskCreate(ScheduledTaskBase):
    pass

class ScheduledTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    prompt: Optional[str] = None
    cron_expression: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

    @validator('cron_expression')
    def validate_cron(cls, v):
        if v is not None and not croniter.is_valid(v):
            raise ValueError('Invalid cron expression')
        return v

class ScheduledTaskExecutionLogResponse(BaseModel):
    id: str
    task_id: str
    status: str
    response_content: Optional[str] = None
    error_message: Optional[str] = None
    executed_at: datetime

    class Config:
        from_attributes = True

class ScheduledTaskResponse(ScheduledTaskBase):
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
