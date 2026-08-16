import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True, index=True)

    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # 'image' | 'pdf' | 'code' | 'document'
    mime_type = Column(String(150), nullable=True)
    size = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="attachments")
