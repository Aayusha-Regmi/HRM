from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models
from ..schemas.schemas import Employee, EmployeeCreate
from ..db import SessionLocal
from datetime import datetime, timezone
from ..realtime import broadcast

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/employees", response_model=list[Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.employee.get_employees(db, skip=skip, limit=limit)

@router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = crud.employee.create_employee(db, employee)
    # emit hire event
    try:
        await broadcast({
            "type": "hire",
            "employee_id": db_employee.id,
            "first_name": db_employee.first_name,
            "last_name": db_employee.last_name,
            "department_id": db_employee.department_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass
    return db_employee


# --- Additional CRUD endpoints ---
@router.get("/employees/{employee_id}", response_model=Employee)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = crud.employee.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: int, employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = crud.employee.update_employee(db, employee_id, employee)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    # emit update status event when status changed to 'exited' or similar
    try:
        if getattr(db_employee, 'status', None) and db_employee.status.lower() in ('exited', 'terminated', 'resigned'):
            await broadcast({
                "type": "exit",
                "employee_id": db_employee.id,
                "first_name": db_employee.first_name,
                "last_name": db_employee.last_name,
                "department_id": db_employee.department_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
    except Exception:
        pass
    return db_employee

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    # fetch before delete to emit info
    emp = crud.employee.get_employee(db, employee_id)
    deleted = crud.employee.delete_employee(db, employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    try:
        await broadcast({
            "type": "exit",
            "employee_id": emp.id if emp else employee_id,
            "first_name": emp.first_name if emp else None,
            "last_name": emp.last_name if emp else None,
            "department_id": emp.department_id if emp else None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
    except Exception:
        pass
    return {"detail": "Employee deleted"}
