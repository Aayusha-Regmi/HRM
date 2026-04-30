from sqlalchemy.orm import Session
from ..models import Notification
from ..schemas.schemas import NotificationCreate

def get_notification(db: Session, notification_id: int):
    return db.query(Notification).filter(Notification.id == notification_id).first()

def get_notifications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Notification).offset(skip).limit(limit).all()

def create_notification(db: Session, notification: NotificationCreate):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification
