from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.user import User
from app.models.project import Project
from app.api.deps import get_current_user, get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(desc(Project.created_at)).all()
    return projects

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_project = Project(
        user_id=current_user.id,
        name=project_in.name,
        description=project_in.description
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    db.delete(project)
    db.commit()
    return None

@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    request: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if request.name is not None:
        project.name = request.name
    if request.description is not None:
        project.description = request.description
    db.commit()
    db.refresh(project)
    return project
