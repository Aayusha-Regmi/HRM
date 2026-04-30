from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud
from ..schemas.schemas import User, UserCreate
from ..core.security import get_db, require_admin
from ..core.security import get_password_hash

router = APIRouter()

@router.get("/users", response_model=list[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return crud.user.get_users(db, skip=skip, limit=limit)

@router.post("/users", response_model=User)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return crud.user.create_user(db, user)


# --- Additional CRUD endpoints ---
@router.get("/users/{user_id}", response_model=User)
def get_user(user_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    user = crud.user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    db_user = crud.user.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_role = user.role if user.role is not None else db_user.role
    updated_is_active = user.is_active if user.is_active is not None else db_user.is_active
    updated_is_admin = user.is_admin if user.is_admin is not None else db_user.is_admin

    db_user.username = user.username
    db_user.email = user.email
    db_user.role = updated_role
    db_user.is_active = updated_is_active
    db_user.is_admin = bool(updated_is_admin or updated_role == "admin")
    db_user.hashed_password = get_password_hash(user.password)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    db_user = crud.user.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}
