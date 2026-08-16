from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import hash_password


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Retrieve a user from the database by their email address.
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user with a securely hashed password.
    """
    hashed_password = hash_password(user.password)
    
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
