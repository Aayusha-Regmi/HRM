from sqlalchemy.orm import Session

from ..models.models import CompanySetting
from ..schemas.schemas import CompanySettingsCreate


def _default_settings() -> CompanySetting:
    return CompanySetting(
        company_name="TechCorp Inc.",
        company_email="hr@techcorp.com",
        company_phone="+1 (555) 123-4567",
        company_address="123 Tech Street, Silicon Valley, CA 94000",
        working_hours_start="09:00",
        working_hours_end="17:00",
        working_days="monday,tuesday,wednesday,thursday,friday",
        payroll_frequency="monthly",
        currency="USD",
    )


def get_or_create_settings(db: Session):
    settings = db.query(CompanySetting).order_by(CompanySetting.id.asc()).first()
    if settings:
        return settings

    settings = _default_settings()
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_settings(db: Session, payload: CompanySettingsCreate):
    settings = get_or_create_settings(db)
    for key, value in payload.dict().items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
