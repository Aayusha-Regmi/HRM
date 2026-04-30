from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Employee, Department
from ..schemas.schemas import EmployeeCreate


def _sync_department_employee_counts(db: Session):
    """Recalculate employee_count from actual employee rows."""
    for department in db.query(Department).all():
        count = (
            db.query(func.count(Employee.id))
            .filter(Employee.department_id == department.id)
            .scalar()
            or 0
        )
        setattr(department, "employee_count", int(count))

def get_employee(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: EmployeeCreate):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.flush()
    _sync_department_employee_counts(db)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def update_employee(db: Session, employee_id: int, employee: EmployeeCreate):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return None

    for key, value in employee.dict().items():
        setattr(db_employee, key, value)

    db.flush()
    _sync_department_employee_counts(db)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def delete_employee(db: Session, employee_id: int):
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return False

    db.delete(db_employee)
    db.flush()
    _sync_department_employee_counts(db)
    db.commit()
    return True
