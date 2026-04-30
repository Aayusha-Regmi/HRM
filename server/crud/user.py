from sqlalchemy.orm import Session
from ..models import User
from ..schemas.schemas import UserCreate
from ..core.security import get_password_hash


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_active=user.is_active,
        is_admin=user.is_admin or user.role == "admin",
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
