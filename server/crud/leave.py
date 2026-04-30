from sqlalchemy.orm import Session
from ..models import Leave
from ..schemas.schemas import LeaveCreate

def get_leave(db: Session, leave_id: int):
    return db.query(Leave).filter(Leave.id == leave_id).first()

def get_leaves(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Leave).offset(skip).limit(limit).all()

def create_leave(db: Session, leave: LeaveCreate):
    db_leave = Leave(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave
