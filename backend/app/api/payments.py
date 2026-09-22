import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/payments", tags=["Payments"])

MONTHLY_AMOUNT = 29900   # ₹299 in paise
YEARLY_AMOUNT  = 297800  # ₹2978 in paise


class CreateOrderRequest(BaseModel):
    billing: Literal["monthly", "yearly"]


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    billing: Literal["monthly", "yearly"]


def _get_razorpay_client():
    try:
        import razorpay
        return razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    except ImportError:
        raise HTTPException(status_code=500, detail="razorpay package not installed. Run: pip install razorpay")


@router.post("/create-order")
def create_order(
    body: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
):
    print(f"DEBUG keys: ID={settings.RAZORPAY_KEY_ID[:10]}... SECRET={settings.RAZORPAY_KEY_SECRET[:10]}...", flush=True)

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured.")

    client = _get_razorpay_client()
    amount = MONTHLY_AMOUNT if body.billing == "monthly" else YEARLY_AMOUNT

    order = client.order.create({
        "amount": amount,
        "currency": "INR",
        "receipt": f"order_{current_user.id}_{body.billing}",
        "notes": {
            "user_id": str(current_user.id),
            "billing": body.billing,
        },
    })
    return {"id": order["id"], "amount": order["amount"], "currency": order["currency"]}


@router.post("/verify")
def verify_payment(
    body: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured.")

    # Verify HMAC signature
    payload = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")

    current_user.is_pro = True
    db.add(current_user)
    db.commit()

    return {"success": True}
