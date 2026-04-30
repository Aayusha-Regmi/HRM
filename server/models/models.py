from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean, DateTime, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
try:
    from ..db import Base  # When imported as a package
except ImportError:
    from db import Base  # When run as a script

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    head_of_department = Column(String(100))
    location = Column(String(100))
    employee_count = Column(Integer, default=0)
    budget = Column(Integer, default=0)
    employees = relationship("Employee", back_populates="department")

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    hire_date = Column(Date)
    date_of_birth = Column(Date)
    department_id = Column(Integer, ForeignKey("departments.id"))
    position = Column(String(100))
    salary = Column(Integer, default=0)
    manager = Column(String(100))
    bank_name = Column(String(100))
    bank_branch_name = Column(String(100))
    bank_account_name = Column(String(120))
    bank_account_number = Column(String(50))
    bank_swift_code = Column(String(50))
    emergency_contact_name = Column(String(100))
    emergency_contact_relationship = Column(String(100))
    emergency_contact_phone = Column(String(20))
    skills = Column(Text)
    status = Column(String(20), default="active")
    is_active = Column(Boolean, default=True)
    department = relationship("Department", back_populates="employees")
    attendances = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")

class JobPosting(Base):
    __tablename__ = "job_postings"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    department_id = Column(Integer, ForeignKey("departments.id"))
    posted_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    department = relationship("Department")
    applications = relationship("JobApplication", back_populates="job_posting")

class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"))
    applicant_name = Column(String(100), nullable=False)
    applicant_email = Column(String(120), nullable=False)
    applicant_phone = Column(String(20))
    linkedin_profile_url = Column(String(255))
    resume_url = Column(String(255))
    cv_file_name = Column(String(255))
    status = Column(String(50), default="pending")
    applied_date = Column(DateTime)
    job_posting = relationship("JobPosting", back_populates="applications")

class Attendance(Base):
    __tablename__ = "attendances"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    clock_in = Column(String(5))
    clock_out = Column(String(5))
    overtime_hours = Column(Float, default=0)
    status = Column(String(20), nullable=False)  # present, absent, leave
    employee = relationship("Employee", back_populates="attendances")

class Leave(Base):
    __tablename__ = "leaves"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    leave_type = Column(String(30), default="vacation")
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    employee = relationship("Employee", back_populates="leaves")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime)
    is_read = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("employees.id"), nullable=True)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="employee")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)


class CompanySetting(Base):
    __tablename__ = "company_settings"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, default="My Company")
    company_email = Column(String(120), nullable=False, default="hr@example.com")
    company_phone = Column(String(20))
    company_address = Column(Text)
    working_hours_start = Column(String(5), default="09:00")
    working_hours_end = Column(String(5), default="17:00")
    working_days = Column(String(100), default="monday,tuesday,wednesday,thursday,friday")
    payroll_frequency = Column(String(20), default="monthly")
    currency = Column(String(10), default="USD")
