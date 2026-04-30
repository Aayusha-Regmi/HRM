from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import Department, DepartmentCreate
from ..db import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/departments", response_model=list[Department])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.department.get_departments(db, skip=skip, limit=limit)

@router.post("/departments", response_model=Department)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db)):
    return crud.department.create_department(db, department)


# --- Additional CRUD endpoints ---
@router.get("/departments/{department_id}", response_model=Department)
def get_department(department_id: int, db: Session = Depends(get_db)):
    department = crud.department.get_department(db, department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.put("/departments/{department_id}", response_model=Department)
def update_department(department_id: int, department: DepartmentCreate, db: Session = Depends(get_db)):
    db_department = crud.department.get_department(db, department_id)
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in department.dict().items():
        setattr(db_department, key, value)
    db.commit()
    db.refresh(db_department)
    return db_department

@router.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    db_department = crud.department.get_department(db, department_id)
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(db_department)
    db.commit()
    return {"detail": "Department deleted"}
