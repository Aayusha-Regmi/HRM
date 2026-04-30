from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..core.security import get_db, get_current_user, require_admin
from ..crud import settings as settings_crud
from ..models.models import User
from ..schemas.schemas import CompanySettings, CompanySettingsCreate

router = APIRouter()


@router.get("/settings", response_model=CompanySettings)
def get_settings(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return settings_crud.get_or_create_settings(db)


@router.put("/settings", response_model=CompanySettings)
def save_settings(
    payload: CompanySettingsCreate,
    db: Session = Depends(get_db),
    _admin_user: User = Depends(require_admin),
):
    return settings_crud.update_settings(db, payload)
