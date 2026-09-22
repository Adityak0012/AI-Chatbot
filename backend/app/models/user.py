from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    username = Column(String(50), unique=True, nullable=True)

    avatar_url = Column(String(500), nullable=True)

    nickname = Column(String(100), nullable=True)

    custom_instructions = Column(Text, nullable=True)

    occupation = Column(String(150), nullable=True)

    email = Column(String(255), unique=True, nullable=False, index=True)

    phone = Column(String(20), unique=True, nullable=True)

    password = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)

    is_verified = Column(Boolean, default=False, nullable=False, server_default="false")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    is_pro = Column(Boolean, default=False, nullable=False, server_default="false")
    daily_message_count = Column(Integer, default=0, nullable=False, server_default="0")
    last_message_date = Column(Date, nullable=True)