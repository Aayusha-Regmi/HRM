from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import JobPosting, JobPostingCreate
from ..db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/job_postings", response_model=list[JobPosting])
def read_job_postings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.job_posting.get_job_postings(db, skip=skip, limit=limit)

@router.post("/job_postings", response_model=JobPosting)
def create_job_posting(job_posting: JobPostingCreate, db: Session = Depends(get_db)):
    return crud.job_posting.create_job_posting(db, job_posting)


# --- Additional CRUD endpoints ---
@router.get("/job_postings/{job_posting_id}", response_model=JobPosting)
def get_job_posting(job_posting_id: int, db: Session = Depends(get_db)):
    job_posting = crud.job_posting.get_job_posting(db, job_posting_id)
    if not job_posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job_posting

@router.put("/job_postings/{job_posting_id}", response_model=JobPosting)
def update_job_posting(job_posting_id: int, job_posting: JobPostingCreate, db: Session = Depends(get_db)):
    db_job_posting = crud.job_posting.get_job_posting(db, job_posting_id)
    if not db_job_posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    for key, value in job_posting.dict().items():
        setattr(db_job_posting, key, value)
    db.commit()
    db.refresh(db_job_posting)
    return db_job_posting

@router.delete("/job_postings/{job_posting_id}")
def delete_job_posting(job_posting_id: int, db: Session = Depends(get_db)):
    db_job_posting = crud.job_posting.get_job_posting(db, job_posting_id)
    if not db_job_posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    db.delete(db_job_posting)
    db.commit()
    return {"detail": "Job posting deleted"}
