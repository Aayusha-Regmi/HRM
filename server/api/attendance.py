from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import Attendance, AttendanceCreate
from ..db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/attendances", response_model=list[Attendance])
def read_attendances(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.attendance.get_attendances(db, skip=skip, limit=limit)

@router.post("/attendances", response_model=Attendance)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    return crud.attendance.create_attendance(db, attendance)


# --- Additional CRUD endpoints ---
@router.get("/attendances/{attendance_id}", response_model=Attendance)
def get_attendance(attendance_id: int, db: Session = Depends(get_db)):
    attendance = crud.attendance.get_attendance(db, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return attendance

@router.put("/attendances/{attendance_id}", response_model=Attendance)
def update_attendance(attendance_id: int, attendance: AttendanceCreate, db: Session = Depends(get_db)):
    db_attendance = crud.attendance.get_attendance(db, attendance_id)
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    for key, value in attendance.dict().items():
        setattr(db_attendance, key, value)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.delete("/attendances/{attendance_id}")
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    db_attendance = crud.attendance.get_attendance(db, attendance_id)
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    db.delete(db_attendance)
    db.commit()
    return {"detail": "Attendance deleted"}
