import secrets
import urllib.parse

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
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

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
FRONTEND_CALLBACK_URL = "http://localhost:5173/auth/callback"

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


@router.get("/google")
def google_login():
    """Return the Google OAuth authorization URL."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured")
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    url = GOOGLE_AUTH_URL + "?" + urllib.parse.urlencode(params)
    return {"url": url}


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    """Exchange Google authorization code for a JWT, then redirect to the frontend."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth is not configured")

    # Exchange code for tokens
    with httpx.Client() as client:
        token_resp = client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
    if token_resp.status_code != 200:
        return RedirectResponse(f"{FRONTEND_CALLBACK_URL}?error=token_exchange_failed")

    access_token_google = token_resp.json().get("access_token")

    # Fetch user profile
    with httpx.Client() as client:
        info_resp = client.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token_google}"})
    if info_resp.status_code != 200:
        return RedirectResponse(f"{FRONTEND_CALLBACK_URL}?error=userinfo_failed")

    info = info_resp.json()
    email = info.get("email")
    full_name = info.get("name") or email.split("@")[0]
    avatar_url = info.get("picture")

    if not email:
        return RedirectResponse(f"{FRONTEND_CALLBACK_URL}?error=no_email")

    # Find or create the user
    user = get_user_by_email(db, email=email)
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            password=hash_password(secrets.token_hex(32)),  # placeholder — not used for OAuth
            is_verified=True,
            is_active=True,
            avatar_url=avatar_url,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_verified:
        user.is_verified = True
        db.commit()

    jwt = create_access_token(data={"sub": user.email})
    return RedirectResponse(f"{FRONTEND_CALLBACK_URL}?token={jwt}")


@router.post("/test-smtp")
def test_smtp_connection():
    from app.services.otp_service import send_otp_email
    if not settings.SMTP_USERNAME:
        return {"configured": False, "message": "SMTP_USERNAME is empty in .env"}
    send_otp_email(settings.SMTP_USERNAME, "123456", "signup")
    return {"configured": True, "message": f"Attempted send to {settings.SMTP_USERNAME} — check backend terminal for [SMTP] logs"}
