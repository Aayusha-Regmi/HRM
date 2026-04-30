from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import (
    create_access_token,
    create_refresh_token,
    authenticate_user,
    get_db,
    get_current_user,
)
from ..models.models import User
from ..schemas.schemas import Token, User as UserSchema, UserCreate, UserLogin
from ..crud import user as user_crud

router = APIRouter()


def _cookie_params():
    return {
        "httponly": True,
        "secure": settings.COOKIE_SECURE,
        "samesite": settings.COOKIE_SAMESITE,
        "path": "/",
    }


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **_cookie_params(),
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **_cookie_params(),
    )


def _clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


@router.post("/auth/login", response_model=UserSchema)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token_data = {
        "sub": user.username,
        "role": user.role,
        "is_admin": user.is_admin,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    _set_auth_cookies(response, access_token, refresh_token)
    return user


@router.get("/auth/me", response_model=UserSchema)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/auth/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    from jose import JWTError, jwt

    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        token_type = payload.get("type")
        if not username or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    token_data = {"sub": user.username, "role": user.role, "is_admin": user.is_admin}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    _set_auth_cookies(response, access_token, refresh_token)
    return {"detail": "refreshed"}


@router.post("/auth/logout")
def logout(response: Response):
    _clear_auth_cookies(response)
    return {"detail": "logged out"}


@router.post("/auth/register", response_model=UserSchema)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing_username = user_crud.get_user_by_username(db, payload.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = user_crud.get_user_by_email(db, payload.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Allow open self-registration only for non-admin roles.
    if payload.role == "admin" or payload.is_admin:
        raise HTTPException(status_code=403, detail="Admin registration is restricted")

    return user_crud.create_user(db, payload)
