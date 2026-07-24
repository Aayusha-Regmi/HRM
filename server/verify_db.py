#!/usr/bin/env python3
"""Verify database setup and run schema initialization."""
import sys
import os
from sqlalchemy import inspect

try:
    # Add project root so the server package can be imported correctly.
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

    from server.db import engine, SessionLocal
    from server.models.models import User
    
    print("✓ Database imports successful")

    # Verify tables exist
    inspector = inspect(engine)
    required_tables = {'departments', 'employees', 'users', 'attendances', 'leaves'}
    existing_tables = set(inspector.get_table_names())
    
    print(f"\n Found tables: {', '.join(sorted(existing_tables))}")
    
    missing = required_tables - existing_tables
    if missing:
        print(f" Missing tables: {', '.join(sorted(missing))}")
        sys.exit(1)
    
    # Verify employees table has required columns
    emp_columns = {col['name'] for col in inspector.get_columns('employees')}
    required_emp_cols = {
        'id', 'first_name', 'last_name', 'email', 'phone', 'department_id',
        'position', 'salary', 'hire_date', 'date_of_birth', 'status', 'skills'
    }
    
    missing_cols = required_emp_cols - emp_columns
    if missing_cols:
        print(f" Missing employee columns: {', '.join(sorted(missing_cols))}")
        sys.exit(1)
    
    print(" All required employee columns present")
    
    # Test database connection
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        print(f" Database connection working ({user_count} users)")
    finally:
        db.close()
    
    print("\n Database verification complete!")
    
except Exception as e:
    print(f"\n Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
