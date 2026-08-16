import random
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from app.models.otp import OTP
from app.core.config import settings

OTP_EXPIRY_MINUTES = 10


def generate_otp_code() -> str:
    return str(random.randint(100000, 999999))


def create_otp(db: Session, target: str, channel: str, purpose: str) -> str:
    code = generate_otp_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)
    otp = OTP(target=target, channel=channel, purpose=purpose, code=code, expires_at=expires_at)
    db.add(otp)
    db.commit()

    if channel == "email":
        send_otp_email(target, code, purpose)
    elif channel == "phone":
        send_otp_sms(target, code, purpose)

    return code


def verify_otp(db: Session, target: str, purpose: str, code: str) -> bool:
    otp = db.query(OTP).filter(
        OTP.target == target,
        OTP.purpose == purpose,
        OTP.code == code,
        OTP.is_used == False,
    ).order_by(OTP.created_at.desc()).first()

    if not otp:
        return False
    if otp.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return False

    otp.is_used = True
    db.commit()
    return True


def build_otp_email_html(code: str, purpose: str) -> str:
    heading = "Verify your account" if purpose == "signup" else "Reset your password"
    subtext = (
        "Enter this code to verify your email and finish creating your account."
        if purpose == "signup"
        else "Enter this code to reset your password."
    )
    code_spaced = " ".join(list(code))
    return f"""<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{heading}</title>
<style>
  body, table, td {{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
  table, td {{ mso-table-lspace:0pt; mso-table-rspace:0pt; }}
  img {{ -ms-interpolation-mode:bicubic; border:0; }}
  body {{ margin:0 !important; padding:0 !important; width:100% !important; background-color:#F4F4F7; font-family:'Segoe UI', Arial, sans-serif; }}
  .outer-bg {{ background-color:#F4F4F7; }}
  .card {{ background-color:#FFFFFF; border:1px solid #E5E7EB; }}
  .heading {{ color:#111827; }}
  .subheading {{ color:#6B7280; }}
  .bodytext {{ color:#374151; }}
  .code-box {{ background-color:#F5F3FF; border:1.5px solid #7C3AED; color:#7C3AED; }}
  .footnote {{ color:#9CA3AF; }}
  .divider {{ border-top:1px solid #E5E7EB; }}
  .copyright {{ color:#9CA3AF; }}

  @media screen and (max-width: 480px) {{
    .container {{ width: 100% !important; max-width: 100% !important; }}
    .fluid-padding {{ padding-left: 20px !important; padding-right: 20px !important; }}
    .code-box {{ letter-spacing: 1px !important; font-size: 22px !important; padding: 16px 6px !important; }}
    .heading {{ font-size: 20px !important; }}
  }}
</style>
</head>
<body class="outer-bg" style="margin:0; padding:0; width:100%; background-color:#F4F4F7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="outer-bg" style="width:100%; background-color:#F4F4F7;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <!--[if mso]>
        <table role="presentation" width="380" align="center"><tr><td>
        <![endif]-->
        <table role="presentation" class="container card" width="380" cellpadding="0" cellspacing="0" border="0" align="center" style="width:380px !important; max-width:380px !important; background-color:#FFFFFF; border-radius:20px; border:1px solid #E5E7EB; margin:0 auto;">
          <tr>
            <td class="fluid-padding" align="center" style="padding: 40px 32px 16px 32px;">
              <div style="width:56px; height:56px; background-color:#7C3AED; border-radius:16px; display:inline-block; line-height:56px; font-size:26px; text-align:center;">🤖</div>
              <h1 class="heading" style="font-size:22px; margin: 20px 0 4px 0; font-weight:800; line-height:1.3;">AI Chatbot Pro</h1>
              <p class="subheading" style="font-size:14px; margin:0; font-weight:500;">{heading}</p>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" style="padding: 0 32px;">
              <p class="bodytext" style="font-size:14px; line-height:1.6; text-align:center; margin: 8px 0 24px 0;">{subtext}</p>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" align="center" style="padding: 0 32px 24px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td align="center" class="code-box" style="border-radius:12px; padding: 18px 10px; letter-spacing: 2px; font-size: 24px; font-weight:800; font-family: 'Courier New', monospace;">
                    {code}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" align="center" style="padding: 0 32px 32px 32px;">
              <p class="footnote" style="font-size:13px; margin:0; font-weight:500;">Expires in {OTP_EXPIRY_MINUTES} minutes</p>
              <p class="footnote" style="font-size:12px; margin-top:12px; line-height:1.5;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" class="divider" style="padding: 18px;">
              <p class="copyright" style="font-size:11px; margin:0;">© AI Chatbot Pro · All rights reserved</p>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_otp_email(to_email: str, code: str, purpose: str):
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[DEV MODE] OTP for {to_email} ({purpose}): {code}")
        print("[DEV MODE] SMTP_USERNAME or SMTP_PASSWORD is empty in .env — email was NOT sent.")
        return
    subject = "Your verification code" if purpose == "signup" else "Your password reset code"
    html_body = build_otp_email_html(code, purpose)
    plain_body = f"Your OTP code is: {code}\nThis code expires in {OTP_EXPIRY_MINUTES} minutes."

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
    msg["To"] = to_email
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        print(f"[SMTP] Connecting to {settings.SMTP_HOST}:{settings.SMTP_PORT} as {settings.SMTP_USERNAME}...")
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.set_debuglevel(1)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], [to_email], msg.as_string())
        print(f"[SMTP] OTP email successfully sent to {to_email}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"[SMTP ERROR] Authentication failed — check SMTP_USERNAME and SMTP_PASSWORD (must be a Gmail App Password, not your normal password). Details: {e}")
        print(f"[DEV MODE] OTP for {to_email} ({purpose}): {code}")
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send OTP email: {type(e).__name__}: {e}")
        print(f"[DEV MODE] OTP for {to_email} ({purpose}): {code}")


def send_otp_sms(to_phone: str, code: str, purpose: str):
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print(f"[DEV MODE] OTP for {to_phone} ({purpose}): {code}")
        return
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"Your verification code is {code}",
            from_=settings.TWILIO_FROM_NUMBER,
            to=to_phone,
        )
    except Exception as e:
        print(f"Failed to send OTP SMS: {e}")
