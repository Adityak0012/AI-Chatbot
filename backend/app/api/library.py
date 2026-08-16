import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User
from app.models.attachment import Attachment
from app.api.deps import get_current_user, get_db
from app.schemas.attachment import AttachmentResponse
from app.utils.file_utils import get_file_category, is_allowed_file

router = APIRouter(
    prefix="/library",
    tags=["Library"]
)


@router.get("", response_model=List[AttachmentResponse])
def get_library_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    files = db.query(Attachment).filter(
        Attachment.user_id == current_user.id
    ).order_by(desc(Attachment.created_at)).all()
    return files


@router.post("/upload", response_model=List[AttachmentResponse], status_code=status.HTTP_201_CREATED)
def upload_library_files(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    created = []
    for file in files:
        if not file.filename:
            continue
        if not is_allowed_file(file.filename, file.content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not supported: {file.filename}"
            )

        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(upload_dir, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        attachment = Attachment(
            user_id=current_user.id,
            session_id=None,
            filename=file.filename,
            file_path=f"/static/uploads/{unique_filename}",
            file_type=get_file_category(file.filename, file.content_type),
            mime_type=file.content_type,
            size=os.path.getsize(file_path)
        )
        db.add(attachment)
        created.append(attachment)

    db.commit()
    for a in created:
        db.refresh(a)
    return created


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_library_file(
    attachment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attachment = db.query(Attachment).filter(
        Attachment.id == attachment_id,
        Attachment.user_id == current_user.id
    ).first()
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    full_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), attachment.file_path.lstrip("/"))
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        pass

    db.delete(attachment)
    db.commit()
    return None
