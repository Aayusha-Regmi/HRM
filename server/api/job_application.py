from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import JobApplication, JobApplicationCreate
from ..db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/job_applications", response_model=list[JobApplication])
def read_job_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.job_application.get_job_applications(db, skip=skip, limit=limit)

@router.post("/job_applications", response_model=JobApplication)
def create_job_application(job_application: JobApplicationCreate, db: Session = Depends(get_db)):
    return crud.job_application.create_job_application(db, job_application)


# --- Additional CRUD endpoints ---
@router.get("/job_applications/{job_application_id}", response_model=JobApplication)
def get_job_application(job_application_id: int, db: Session = Depends(get_db)):
    job_application = crud.job_application.get_job_application(db, job_application_id)
    if not job_application:
        raise HTTPException(status_code=404, detail="Job application not found")
    return job_application

@router.put("/job_applications/{job_application_id}", response_model=JobApplication)
def update_job_application(job_application_id: int, job_application: JobApplicationCreate, db: Session = Depends(get_db)):
    db_job_application = crud.job_application.get_job_application(db, job_application_id)
    if not db_job_application:
        raise HTTPException(status_code=404, detail="Job application not found")
    for key, value in job_application.dict().items():
        setattr(db_job_application, key, value)
    db.commit()
    db.refresh(db_job_application)
    return db_job_application

@router.delete("/job_applications/{job_application_id}")
def delete_job_application(job_application_id: int, db: Session = Depends(get_db)):
    db_job_application = crud.job_application.get_job_application(db, job_application_id)
    if not db_job_application:
        raise HTTPException(status_code=404, detail="Job application not found")
    db.delete(db_job_application)
    db.commit()
    return {"detail": "Job application deleted"}
