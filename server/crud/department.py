from sqlalchemy.orm import Session
from ..models import Department
from ..schemas.schemas import DepartmentCreate

def get_department(db: Session, department_id: int):
    return db.query(Department).filter(Department.id == department_id).first()

def get_departments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Department).offset(skip).limit(limit).all()

def create_department(db: Session, department: DepartmentCreate):
    db_department = Department(**department.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

# Similar CRUD functions for Employee, JobPosting, JobApplication, Attendance, Leave, Notification, User will be implemented here.
