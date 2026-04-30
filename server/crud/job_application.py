from sqlalchemy.orm import Session
from ..models import JobApplication
from ..schemas.schemas import JobApplicationCreate

def get_job_application(db: Session, job_application_id: int):
    return db.query(JobApplication).filter(JobApplication.id == job_application_id).first()

def get_job_applications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(JobApplication).offset(skip).limit(limit).all()

def create_job_application(db: Session, job_application: JobApplicationCreate):
    db_job_application = JobApplication(**job_application.dict())
    db.add(db_job_application)
    db.commit()
    db.refresh(db_job_application)
    return db_job_application
