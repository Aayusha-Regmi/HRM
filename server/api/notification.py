from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import Notification, NotificationCreate
from ..db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/notifications", response_model=list[Notification])
def read_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.notification.get_notifications(db, skip=skip, limit=limit)

@router.post("/notifications", response_model=Notification)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    return crud.notification.create_notification(db, notification)


# --- Additional CRUD endpoints ---
@router.get("/notifications/{notification_id}", response_model=Notification)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    notification = crud.notification.get_notification(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.put("/notifications/{notification_id}", response_model=Notification)
def update_notification(notification_id: int, notification: NotificationCreate, db: Session = Depends(get_db)):
    db_notification = crud.notification.get_notification(db, notification_id)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    for key, value in notification.dict().items():
        setattr(db_notification, key, value)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    db_notification = crud.notification.get_notification(db, notification_id)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(db_notification)
    db.commit()
    return {"detail": "Notification deleted"}
