from sqlalchemy.orm import Session
from ..models import JobPosting
from ..schemas.schemas import JobPostingCreate

def get_job_posting(db: Session, job_posting_id: int):
    return db.query(JobPosting).filter(JobPosting.id == job_posting_id).first()

def get_job_postings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(JobPosting).offset(skip).limit(limit).all()

def create_job_posting(db: Session, job_posting: JobPostingCreate):
    db_job_posting = JobPosting(**job_posting.dict())
    db.add(db_job_posting)
    db.commit()
    db.refresh(db_job_posting)
    return db_job_posting
