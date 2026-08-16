import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base

class ScheduledTask(Base):
    __tablename__ = "scheduled_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    cron_expression = Column(String(100), nullable=False)
    timezone = Column(String(100), nullable=False, default="UTC")
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="scheduled_tasks")
    logs = relationship("ScheduledTaskExecutionLog", back_populates="task", cascade="all, delete-orphan", order_by="ScheduledTaskExecutionLog.executed_at.desc()")


class ScheduledTaskExecutionLog(Base):
    __tablename__ = "scheduled_task_execution_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    task_id = Column(String(36), ForeignKey("scheduled_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False) # 'success' or 'failed'
    response_content = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    executed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("ScheduledTask", back_populates="logs")
