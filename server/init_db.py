"""
Database initialization and lightweight schema sync.

This keeps existing databases compatible with the current ORM models by
creating missing tables and adding selected missing columns non-destructively.
"""
from sqlalchemy import inspect, text

try:
    from .db import Base, engine  # When imported as a package
    from .db import SessionLocal
    from . import models  # noqa: F401 - registers models with Base metadata
    from .models.models import User
    from .core.security import get_password_hash
except ImportError:
    from db import Base, engine  # When run as a script
    from db import SessionLocal
    import models  # noqa: F401 - registers models with Base metadata
    from models import User
    from core.security import get_password_hash


def ensure_department_columns() -> None:
    """Add missing department columns to existing databases."""
    inspector = inspect(engine)
    if not inspector.has_table("departments"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("departments")}
    missing_columns = {
        "head_of_department": "`head_of_department` VARCHAR(100) NULL",
        "location": "`location` VARCHAR(100) NULL",
        "employee_count": "`employee_count` INT NOT NULL DEFAULT 0",
        "budget": "`budget` INT NOT NULL DEFAULT 0",
    }

    with engine.begin() as connection:
        for column_name, ddl in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE `departments` ADD COLUMN {ddl}"))


def ensure_employee_columns() -> None:
    """Add missing employee profile columns to existing databases."""
    inspector = inspect(engine)
    if not inspector.has_table("employees"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("employees")}
    missing_columns = {
        "address": "`address` TEXT NULL",
        "date_of_birth": "`date_of_birth` DATE NULL",
        "salary": "`salary` INT NOT NULL DEFAULT 0",
        "manager": "`manager` VARCHAR(100) NULL",
        "bank_name": "`bank_name` VARCHAR(100) NULL",
        "bank_branch_name": "`bank_branch_name` VARCHAR(100) NULL",
        "bank_account_name": "`bank_account_name` VARCHAR(120) NULL",
        "bank_account_number": "`bank_account_number` VARCHAR(50) NULL",
        "bank_swift_code": "`bank_swift_code` VARCHAR(50) NULL",
        "emergency_contact_name": "`emergency_contact_name` VARCHAR(100) NULL",
        "emergency_contact_relationship": "`emergency_contact_relationship` VARCHAR(100) NULL",
        "emergency_contact_phone": "`emergency_contact_phone` VARCHAR(20) NULL",
        "skills": "`skills` TEXT NULL",
        "status": "`status` VARCHAR(20) NOT NULL DEFAULT 'active'",
    }

    with engine.begin() as connection:
        for column_name, ddl in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE `employees` ADD COLUMN {ddl}"))


def ensure_user_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    missing_columns = {
        "role": "`role` VARCHAR(30) NOT NULL DEFAULT 'employee'",
        "is_active": "`is_active` TINYINT(1) NOT NULL DEFAULT 1",
    }

    with engine.begin() as connection:
        for column_name, ddl in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE `users` ADD COLUMN {ddl}"))


def ensure_job_application_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("job_applications"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("job_applications")}
    missing_columns = {
        "applicant_phone": "`applicant_phone` VARCHAR(20) NULL",
        "linkedin_profile_url": "`linkedin_profile_url` VARCHAR(255) NULL",
        "cv_file_name": "`cv_file_name` VARCHAR(255) NULL",
    }

    with engine.begin() as connection:
        for column_name, ddl in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE `job_applications` ADD COLUMN {ddl}"))


def ensure_attendance_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("attendances"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("attendances")}
    missing_columns = {
        "clock_in": "`clock_in` VARCHAR(5) NULL",
        "clock_out": "`clock_out` VARCHAR(5) NULL",
        "overtime_hours": "`overtime_hours` FLOAT NOT NULL DEFAULT 0",
    }

    with engine.begin() as connection:
        for column_name, ddl in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE `attendances` ADD COLUMN {ddl}"))


def ensure_leave_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("leaves"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("leaves")}
    missing_columns = {
        "leave_type": "`leave_type` VARCHAR(30) NOT NULL DEFAULT 'vacation'",
    }

    with engine.begin() as connection:
        for column_name, ddl in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE `leaves` ADD COLUMN {ddl}"))


def ensure_default_admin_user() -> None:
    db = SessionLocal()
    try:
        seeds = [
            {
                "username": "admin",
                "email": "admin@hrmapp.com",
                "password": "Admin@2026!HRM",
                "role": "admin",
                "is_admin": True,
            },
            {
                "username": "hr",
                "email": "hr@hrmapp.com",
                "password": "Hr@2026!HRM",
                "role": "hr_manager",
                "is_admin": False,
            },
        ]

        for seed in seeds:
            existing_user = db.query(User).filter(User.username == seed["username"]).first()
            if not existing_user:
                db.add(
                    User(
                        username=seed["username"],
                        email=seed["email"],
                        hashed_password=get_password_hash(seed["password"]),
                        role=seed["role"],
                        is_admin=seed["is_admin"],
                        is_active=True,
                    )
                )
        db.commit()
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_department_columns()
    ensure_employee_columns()
    ensure_user_columns()
    ensure_job_application_columns()
    ensure_attendance_columns()
    ensure_leave_columns()
    ensure_default_admin_user()
    print("Database schema check complete.")


if __name__ == "__main__":
    init_db()