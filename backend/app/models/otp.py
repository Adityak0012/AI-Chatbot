from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database.database import Base


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String(255), nullable=False, index=True)  # email or phone number
    channel = Column(String(10), nullable=False)  # "email" or "phone"
    purpose = Column(String(20), nullable=False)  # "signup" or "reset"
    code = Column(String(6), nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
