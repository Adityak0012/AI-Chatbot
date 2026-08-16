from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import quote_plus

from app.core.config import settings

DATABASE_URL = (
    f"postgresql+psycopg2://"
    f"{settings.DATABASE_USER}:"
    f"{quote_plus(settings.DATABASE_PASSWORD)}@"
    f"127.0.0.1:"
    f"{settings.DATABASE_PORT}/"
    f"{settings.DATABASE_NAME}"
)

print("DATABASE_USER =", settings.DATABASE_USER)
print("DATABASE_PASSWORD =", repr(settings.DATABASE_PASSWORD))
print("DATABASE_HOST =", settings.DATABASE_HOST)
print("DATABASE_PORT =", settings.DATABASE_PORT)
print("DATABASE_NAME =", settings.DATABASE_NAME)
print("DATABASE_URL =", DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    echo=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()