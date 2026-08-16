from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.scheduled_task import ScheduledTask, ScheduledTaskExecutionLog
from app.schemas.scheduled_task import ScheduledTaskCreate, ScheduledTaskUpdate, ScheduledTaskResponse, ScheduledTaskExecutionLogResponse
from app.services.scheduler_service import add_task_to_scheduler, remove_task_from_scheduler

router = APIRouter(prefix="/scheduled-tasks", tags=["Scheduled Tasks"])

@router.get("", response_model=List[ScheduledTaskResponse])
def get_scheduled_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(ScheduledTask).filter(ScheduledTask.user_id == current_user.id).all()
    return tasks

@router.post("", response_model=ScheduledTaskResponse)
def create_scheduled_task(
    task_in: ScheduledTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = ScheduledTask(
        user_id=current_user.id,
        title=task_in.title,
        prompt=task_in.prompt,
        cron_expression=task_in.cron_expression,
        timezone=task_in.timezone,
        is_active=task_in.is_active
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    if task.is_active:
        add_task_to_scheduler(task)

    return task

@router.patch("/{task_id}", response_model=ScheduledTaskResponse)
def update_scheduled_task(
    task_id: str,
    task_in: ScheduledTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(ScheduledTask).filter(ScheduledTask.id == task_id, ScheduledTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Scheduled task not found")

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    # Manage scheduler based on active state
    if task.is_active:
        add_task_to_scheduler(task)
    else:
        remove_task_from_scheduler(task.id)

    return task

@router.delete("/{task_id}")
def delete_scheduled_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(ScheduledTask).filter(ScheduledTask.id == task_id, ScheduledTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Scheduled task not found")

    remove_task_from_scheduler(task.id)
    db.delete(task)
    db.commit()

    return {"detail": "Scheduled task deleted"}

@router.get("/{task_id}/logs", response_model=List[ScheduledTaskExecutionLogResponse])
def get_scheduled_task_logs(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(ScheduledTask).filter(ScheduledTask.id == task_id, ScheduledTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Scheduled task not found")

    logs = db.query(ScheduledTaskExecutionLog).filter(ScheduledTaskExecutionLog.task_id == task_id).order_by(ScheduledTaskExecutionLog.executed_at.desc()).limit(50).all()
    return logs
