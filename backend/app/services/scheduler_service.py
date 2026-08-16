from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging
import traceback
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.scheduled_task import ScheduledTask, ScheduledTaskExecutionLog
from app.services.providers.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def execute_scheduled_task(task_id: str):
    logger.info(f"Executing scheduled task {task_id}")
    db: Session = SessionLocal()
    try:
        task = db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
        if not task or not task.is_active:
            logger.info(f"Task {task_id} not found or inactive. Skipping.")
            return

        provider = OllamaProvider()
        try:
            response = provider.generate_response(task.prompt)
            log = ScheduledTaskExecutionLog(
                task_id=task.id,
                status="success",
                response_content=response
            )
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {str(e)}")
            log = ScheduledTaskExecutionLog(
                task_id=task.id,
                status="failed",
                error_message=str(e) + "\n" + traceback.format_exc()
            )
        
        db.add(log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to process scheduled task {task_id}: {e}")
    finally:
        db.close()


def add_task_to_scheduler(task: ScheduledTask):
    try:
        scheduler.add_job(
            execute_scheduled_task,
            CronTrigger.from_crontab(task.cron_expression, timezone=task.timezone),
            id=task.id,
            args=[task.id],
            replace_existing=True
        )
        logger.info(f"Added task {task.id} to scheduler with cron {task.cron_expression}")
    except Exception as e:
        logger.error(f"Failed to add task {task.id} to scheduler: {e}")

def remove_task_from_scheduler(task_id: str):
    try:
        if scheduler.get_job(task_id):
            scheduler.remove_job(task_id)
            logger.info(f"Removed task {task_id} from scheduler")
    except Exception as e:
        logger.error(f"Failed to remove task {task_id} from scheduler: {e}")

def init_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started.")
        
        # Load all active tasks on startup
        db: Session = SessionLocal()
        try:
            active_tasks = db.query(ScheduledTask).filter(ScheduledTask.is_active == True).all()
            for task in active_tasks:
                add_task_to_scheduler(task)
        except Exception as e:
            logger.error(f"Failed to load initial tasks: {e}")
        finally:
            db.close()
