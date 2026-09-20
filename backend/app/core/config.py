from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_NAME: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    AI_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5-coder:3b"
    GEMINI_API_KEY: str = ""
    TAVILY_API_KEY: str = ""

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore"
    )


settings = Settings()