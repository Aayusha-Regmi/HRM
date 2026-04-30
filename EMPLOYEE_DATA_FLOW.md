# Employee Data Management - Complete Guide

## Overview
This document covers the complete flow of employee data from frontend form submission through database storage and retrieval.

## Data Flow Architecture

### 1. Frontend → API
**File**: `client/src/pages/Employee/AddEmployee.jsx`

- Form collects employee data
- `buildEmployeePayload()` converts camelCase to snake_case
- Submits to `/api/employees` (POST) or `/api/employees/{id}` (PUT)

### 2. API → Database
**File**: `server/api/employee.py`

- Validates payload using Pydantic schema: `EmployeeCreate`
- Calls CRUD function to persist data
- Returns Employee object with all fields

### 3. Database Schema
**File**: `server/models/models.py`

Employee table columns:
- ✓ id, first_name, last_name, email, phone
- ✓ address, hire_date, date_of_birth
- ✓ department_id (Foreign Key → departments)
- ✓ position, salary, manager, status
- ✓ Bank details: bank_name, bank_branch_name, bank_account_name, bank_account_number, bank_swift_code
- ✓ Emergency contact: emergency_contact_name, emergency_contact_relationship, emergency_contact_phone
- ✓ skills (Text field, comma-separated), is_active

### 4. Database → Frontend
**File**: `client/src/context/HRDataContext.jsx`

- Fetches departments first (establishes lookup mapping)
- Fetches employees
- Maps snake_case API fields to camelCase + resolves department names

## Key Implementation Details

### Employee Mapping Function
```javascript
const mapEmployeeFromApi = (employee, departments = []) => {
  const dept = departments.find((d) => d.id === employee.department_id);
  return {
    ...employee,
    firstName: employee.first_name,
    lastName: employee.last_name,
    department: dept?.name || '', // Critical for filtering!
    // ... other field mappings
  };
};
```

### Payload Builder
```javascript
export const buildEmployeePayload = (formData, departments) => ({
  first_name: formData.firstName.trim(),
  last_name: formData.lastName.trim(),
  department_id: departments.find((dep) => dep.name === formData.department)?.id || null,
  skills: formData.skills.length ? formData.skills.join(', ') : null,
  // ... other fields
});
```

## Verification Checklist

### ✓ Database Setup
- [ ] Run `python server/verify_db.py` to verify schema
- [ ] Check that all required columns exist
- [ ] Verify default admin user exists

### ✓ Add Employee Flow
1. Navigate to `/employees/add`
2. Fill all required fields (*marked with asterisk)
3. Submit form
4. **Verification**: Check employee appears in `/employees` list

### ✓ Edit Employee Flow
1. Navigate to employee details page
2. Click "Edit Employee"
3. Form should pre-populate all fields correctly
4. Make changes and submit
5. **Verification**: Changes persist when viewing employee again

### ✓ Delete Employee Flow
1. In employees list, click delete icon
2. Confirm deletion
3. **Verification**: Employee disappears from list

### ✓ Department Filtering
1. In employees list, select different departments
2. **Verification**: List updates to show only employees from selected department

## Common Issues & Fixes

### Issue: Department doesn't populate in employee list
**Cause**: HRDataContext not mapping department names
**Fix**: Ensure departments are fetched BEFORE employees in useEffect

### Issue: Form fields empty when editing
**Cause**: mapEmployeeFromApi not handling all fields
**Fix**: Ensure all camelCase mappings are defined in mapEmployeeFromApi

### Issue: Employee data not saving
**Cause**: Payload fields have wrong names
**Fix**: Verify buildEmployeePayload matches API schema field names

### Issue: Cannot select department in form
**Cause**: Departments array not loaded
**Fix**: Ensure departments load before rendering the form

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Create new employee |
| GET | `/api/employees/{id}` | Get employee details |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/departments` | List departments |

## Database Initialization

The system uses automatic schema creation on startup via:
1. `Base.metadata.create_all(bind=engine)` - Creates all tables
2. `ensure_employee_columns()` - Adds missing columns to existing databases
3. `ensure_default_admin_user()` - Seeds initial users

**Startup flow** (in `server/main.py`):
```python
@app.on_event("startup")
def startup_db_sync():
    init_db()
```

## Testing Commands

### Test Employee Creation
```bash
curl -X POST http://localhost:8000/api/employees \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "hire_date": "2024-01-15",
    "department_id": 1,
    "position": "Developer",
    "salary": 50000
  }'
```

### Test Employee Retrieval
```bash
curl -X GET http://localhost:8000/api/employees \
  -H "Authorization: Bearer <token>"
```

## Data Validation Rules

### Required Fields
- first_name, last_name, email, phone (Basic)
- hire_date, date_of_birth (Dates)
- department_id (Employment)
- position, salary (Job)

### Format Rules
- **Email**: Valid RFC 5322 format (enforced by Pydantic EmailStr)
- **Phone**: 10-16 digits with optional symbols (validation in frontend)
- **Salary**: Minimum 12,000
- **Age**: Must be ≥18 years old
- **Join Date**: Cannot be in future

## Context Data Structure

After successful initialization, HRDataContext provides:
```javascript
{
  employees: [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      department: "Engineering", // Resolved from department_id
      position: "Software Engineer",
      salary: 50000,
      joinDate: "2024-01-15",
      status: "active",
      skills: ["JavaScript", "React", "Python"], // Split from CSV
      // ... all other fields
    }
  ],
  departments: [{ id: 1, name: "Engineering" }, ...],
  addEmployee: async (payload) => {},
  updateEmployee: async (id, payload) => {},
  deleteEmployee: async (id) => {},
  // ... other context methods
}
```

## File Locations Reference

| Layer | File Path |
|-------|-----------|
| Frontend Component | `client/src/pages/Employee/AddEmployee.jsx` |
| API Routes | `server/api/employee.py` |
| CRUD Logic | `server/crud/employee.py` |
| Data Models | `server/models/models.py` |
| Schemas | `server/schemas/schemas.py` |
| Context | `client/src/context/HRDataContext.jsx` |
| Payloads | `client/src/common/payloads/employeePayloads.js` |
| Validation | `client/src/common/validations/employeeValidation.js` |

