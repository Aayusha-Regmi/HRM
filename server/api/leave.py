from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import Leave, LeaveCreate
from ..db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/leaves", response_model=list[Leave])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.leave.get_leaves(db, skip=skip, limit=limit)

@router.post("/leaves", response_model=Leave)
def create_leave(leave: LeaveCreate, db: Session = Depends(get_db)):
    return crud.leave.create_leave(db, leave)


# --- Additional CRUD endpoints ---
@router.get("/leaves/{leave_id}", response_model=Leave)
def get_leave(leave_id: int, db: Session = Depends(get_db)):
    leave = crud.leave.get_leave(db, leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    return leave

@router.put("/leaves/{leave_id}", response_model=Leave)
def update_leave(leave_id: int, leave: LeaveCreate, db: Session = Depends(get_db)):
    db_leave = crud.leave.get_leave(db, leave_id)
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    for key, value in leave.dict().items():
        setattr(db_leave, key, value)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.delete("/leaves/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    db_leave = crud.leave.get_leave(db, leave_id)
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    db.delete(db_leave)
    db.commit()
    return {"detail": "Leave deleted"}
