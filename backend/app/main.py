from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
import os
from app.database.database import engine
from app.api.health import router as health_router
from app.api.users import router as users_router
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.scheduled_task import ScheduledTask, ScheduledTaskExecutionLog
from app.models.project import Project
from app.services.scheduler_service import init_scheduler
from app.database.database import Base, engine
from app.api.scheduled_tasks import router as scheduled_tasks_router
from app.api.projects import router as projects_router
from app.api.library import router as library_router
from app.models.attachment import Attachment
from contextlib import asynccontextmanager

print("✅ Database Connected Successfully")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_scheduler()
    yield


app = FastAPI(
    title="AI Chatbot Pro API",
    description="Backend API for AI Chatbot Pro",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Lightweight migration: add the 'username' column to existing 'users'
# tables that were created before this column existed.
with engine.connect() as _conn:
    _conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE"
    ))
    _conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"
    ))
    _conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(100)"
    ))
    _conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_instructions TEXT"
    ))
    _conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(150)"
    ))
    _conn.execute(text(
        "ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL"
    ))
    _conn.execute(text(
        "ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS ai_titled BOOLEAN NOT NULL DEFAULT FALSE"
    ))
    _conn.commit()

app.include_router(health_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(scheduled_tasks_router)
app.include_router(projects_router)
app.include_router(library_router)

# Mount static directory for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")


@app.get("/")
def root():
    return {
        "message": "Welcome to AI Chatbot Pro 🚀"
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)