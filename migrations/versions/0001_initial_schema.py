"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-24
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("head_of_department", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("employee_count", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("budget", sa.Integer(), nullable=True, server_default=sa.text("0")),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False, unique=True),
        sa.Column("email", sa.String(length=120), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=30), nullable=False, server_default=sa.text("'employee'")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("0")),
    )

    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=120), nullable=False, unique=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("hire_date", sa.Date(), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("department_id", sa.Integer(), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("position", sa.String(length=100), nullable=True),
        sa.Column("salary", sa.Integer(), nullable=True, server_default=sa.text("0")),
        sa.Column("manager", sa.String(length=100), nullable=True),
        sa.Column("bank_name", sa.String(length=100), nullable=True),
        sa.Column("bank_branch_name", sa.String(length=100), nullable=True),
        sa.Column("bank_account_name", sa.String(length=120), nullable=True),
        sa.Column("bank_account_number", sa.String(length=50), nullable=True),
        sa.Column("bank_swift_code", sa.String(length=50), nullable=True),
        sa.Column("emergency_contact_name", sa.String(length=100), nullable=True),
        sa.Column("emergency_contact_relationship", sa.String(length=100), nullable=True),
        sa.Column("emergency_contact_phone", sa.String(length=20), nullable=True),
        sa.Column("skills", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True, server_default=sa.text("'active'")),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("1")),
    )

    op.create_table(
        "job_postings",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("department_id", sa.Integer(), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("posted_date", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.text("1")),
    )

    op.create_table(
        "job_applications",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("job_posting_id", sa.Integer(), sa.ForeignKey("job_postings.id"), nullable=True),
        sa.Column("applicant_name", sa.String(length=100), nullable=False),
        sa.Column("applicant_email", sa.String(length=120), nullable=False),
        sa.Column("applicant_phone", sa.String(length=20), nullable=True),
        sa.Column("linkedin_profile_url", sa.String(length=255), nullable=True),
        sa.Column("resume_url", sa.String(length=255), nullable=True),
        sa.Column("cv_file_name", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True, server_default=sa.text("'pending'")),
        sa.Column("applied_date", sa.DateTime(), nullable=True),
    )

    op.create_table(
        "attendances",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("employee_id", sa.Integer(), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("clock_in", sa.String(length=5), nullable=True),
        sa.Column("clock_out", sa.String(length=5), nullable=True),
        sa.Column("overtime_hours", sa.Float(), nullable=True, server_default=sa.text("0")),
        sa.Column("status", sa.String(length=20), nullable=False),
    )

    op.create_table(
        "leaves",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("employee_id", sa.Integer(), sa.ForeignKey("employees.id"), nullable=True),
        sa.Column("leave_type", sa.String(length=30), nullable=True, server_default=sa.text("'vacation'")),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True, server_default=sa.text("'pending'")),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=True, server_default=sa.text("0")),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("employees.id"), nullable=True),
    )

    op.create_table(
        "company_settings",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False, server_default=sa.text("'My Company'")),
        sa.Column("company_email", sa.String(length=120), nullable=False, server_default=sa.text("'hr@example.com'")),
        sa.Column("company_phone", sa.String(length=20), nullable=True),
        sa.Column("company_address", sa.Text(), nullable=True),
        sa.Column("working_hours_start", sa.String(length=5), nullable=True, server_default=sa.text("'09:00'")),
        sa.Column("working_hours_end", sa.String(length=5), nullable=True, server_default=sa.text("'17:00'")),
        sa.Column("working_days", sa.String(length=100), nullable=True, server_default=sa.text("'monday,tuesday,wednesday,thursday,friday'")),
        sa.Column("payroll_frequency", sa.String(length=20), nullable=True, server_default=sa.text("'monthly'")),
        sa.Column("currency", sa.String(length=10), nullable=True, server_default=sa.text("'USD'")),
    )


def downgrade() -> None:
    op.drop_table("company_settings")
    op.drop_table("notifications")
    op.drop_table("leaves")
    op.drop_table("attendances")
    op.drop_table("job_applications")
    op.drop_table("job_postings")
    op.drop_table("employees")
    op.drop_table("users")
    op.drop_table("departments")
