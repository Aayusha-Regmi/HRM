from sqlalchemy.orm import Session
from ..models import Attendance
from ..schemas.schemas import AttendanceCreate

def get_attendance(db: Session, attendance_id: int):
    return db.query(Attendance).filter(Attendance.id == attendance_id).first()

def get_attendances(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Attendance).offset(skip).limit(limit).all()

def create_attendance(db: Session, attendance: AttendanceCreate):
    db_attendance = Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance
