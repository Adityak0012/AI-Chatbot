from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    full_name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    phone: str | None = None


class OTPRequest(BaseModel):
    target: str
    channel: str  # "email" or "phone"
    purpose: str  # "signup" or "reset"


class OTPVerify(BaseModel):
    target: str
    purpose: str
    code: str


class PasswordResetConfirm(BaseModel):
    target: str
    code: str
    new_password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    username: str | None = None
    nickname: str | None = None
    custom_instructions: str | None = None
    occupation: str | None = None


class UserResponse(UserBase):
    id: int
    username: str | None = None
    avatar_url: str | None = None
    nickname: str | None = None
    custom_instructions: str | None = None
    occupation: str | None = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
