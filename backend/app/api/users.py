from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.models.user import User
from app.api.deps import get_current_user, get_db

from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import create_user, get_user_by_email
from app.services.otp_service import create_otp
import os
import re
import shutil
import uuid

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    new_user = create_user(db=db, user=user)
    create_otp(db, target=new_user.email, channel="email", purpose="signup")
    return new_user

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_users_me(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update.username is not None:
        if not re.fullmatch(r"[a-z0-9_]+", update.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must only contain lowercase letters, numbers, and underscores"
            )
        existing = db.query(User).filter(User.username == update.username, User.id != current_user.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = update.username

    if update.full_name is not None:
        current_user.full_name = update.full_name

    if update.nickname is not None:
        current_user.nickname = update.nickname

    if update.custom_instructions is not None:
        current_user.custom_instructions = update.custom_instructions

    if update.occupation is not None:
        current_user.occupation = update.occupation

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/usage")
def get_usage(current_user: User = Depends(get_current_user)):
    return {
        "daily_message_count": current_user.daily_message_count or 0,
        "is_pro": current_user.is_pro or False,
        "limit": 20,
    }

@router.post("/me/avatar", response_model=UserResponse)
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.avatar_url = f"/static/uploads/{unique_filename}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
