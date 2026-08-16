from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.token import Token
from app.services.user_service import get_user_by_email
from app.utils.security import verify_password, create_access_token, hash_password
from app.models.user import User
from app.schemas.user import OTPRequest, OTPVerify, PasswordResetConfirm
from app.services.otp_service import create_otp, verify_otp
from app.database.database import SessionLocal
from app.utils.security import verify_password, create_access_token, hash_password
from app.core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your account before logging in."
        )

    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/verify-otp")
def verify_signup_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    if not verify_otp(db, target=payload.target, purpose=payload.purpose, code=payload.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")

    if payload.purpose == "signup":
        user = db.query(User).filter(
            (User.email == payload.target) | (User.phone == payload.target)
        ).first()
        if user:
            user.is_verified = True
            db.commit()

    return {"verified": True}


@router.post("/resend-otp")
def resend_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    create_otp(db, target=payload.target, channel=payload.channel, purpose=payload.purpose)
    return {"sent": True}


@router.post("/forgot-password")
def forgot_password(payload: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == payload.target) | (User.phone == payload.target)
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No account found with that email/phone")
    create_otp(db, target=payload.target, channel=payload.channel, purpose="reset")
    return {"sent": True}


@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    if not verify_otp(db, target=payload.target, purpose="reset", code=payload.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")

    user = db.query(User).filter(
        (User.email == payload.target) | (User.phone == payload.target)
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password = hash_password(payload.new_password)
    db.commit()
    return {"reset": True}


@router.post("/test-smtp")
def test_smtp_connection():
    from app.services.otp_service import send_otp_email
    if not settings.SMTP_USERNAME:
        return {"configured": False, "message": "SMTP_USERNAME is empty in .env"}
    send_otp_email(settings.SMTP_USERNAME, "123456", "signup")
    return {"configured": True, "message": f"Attempted send to {settings.SMTP_USERNAME} — check backend terminal for [SMTP] logs"}
