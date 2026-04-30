from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None
    head_of_department: Optional[str] = None
    location: Optional[str] = None
    employee_count: Optional[int] = 0
    budget: Optional[int] = 0


class DepartmentCreate(DepartmentBase):
    pass


class Department(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    hire_date: Optional[date] = None
    date_of_birth: Optional[date] = None
    department_id: Optional[int] = None
    position: Optional[str] = None
    salary: Optional[int] = 0
    manager: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch_name: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_swift_code: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    skills: Optional[str] = None
    status: Optional[str] = "active"
    is_active: Optional[bool] = True

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

class JobPostingBase(BaseModel):
    title: str
    description: Optional[str] = None
    department_id: Optional[int] = None
    posted_date: Optional[datetime] = None
    is_active: Optional[bool] = True

class JobPostingCreate(JobPostingBase):
    pass

class JobPosting(JobPostingBase):
    id: int
    class Config:
        from_attributes = True

class JobApplicationBase(BaseModel):
    job_posting_id: int
    applicant_name: str
    applicant_email: EmailStr
    applicant_phone: Optional[str] = None
    linkedin_profile_url: Optional[str] = None
    resume_url: Optional[str] = None
    cv_file_name: Optional[str] = None
    status: Optional[str] = "pending"
    applied_date: Optional[datetime] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplication(JobApplicationBase):
    id: int
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    employee_id: Optional[int] = None
    date: date
    clock_in: Optional[str] = None
    clock_out: Optional[str] = None
    overtime_hours: Optional[float] = 0
    status: str

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int
    class Config:
        from_attributes = True

class LeaveBase(BaseModel):
    employee_id: int
    leave_type: Optional[str] = "vacation"
    start_date: date
    end_date: date
    reason: Optional[str] = None
    status: Optional[str] = "pending"

class LeaveCreate(LeaveBase):
    pass

class Leave(LeaveBase):
    id: int
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    message: str
    created_at: Optional[datetime] = None
    is_read: Optional[bool] = False
    user_id: Optional[int] = None

class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Optional[str] = "employee"
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CompanySettingsBase(BaseModel):
    company_name: str
    company_email: EmailStr
    company_phone: Optional[str] = None
    company_address: Optional[str] = None
    working_hours_start: Optional[str] = "09:00"
    working_hours_end: Optional[str] = "17:00"
    working_days: Optional[str] = "monday,tuesday,wednesday,thursday,friday"
    payroll_frequency: Optional[str] = "monthly"
    currency: Optional[str] = "USD"


class CompanySettingsCreate(CompanySettingsBase):
    pass


class CompanySettings(CompanySettingsBase):
    id: int

    class Config:
        from_attributes = True
