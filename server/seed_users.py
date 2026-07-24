"""Idempotent user seeding utility.

Run this after database migrations have been applied. It is designed for
one-off execution in local development, CI/CD jobs, or init containers.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.dialects.mysql import insert as mysql_insert

try:
    from .db import SessionLocal
    from .core.security import get_password_hash
    from .models.models import User
except ImportError:
    from db import SessionLocal
    from core.security import get_password_hash
    from models.models import User


@dataclass(frozen=True)
class SeedUser:
    username: str
    email: str
    password: str
    role: str
    is_admin: bool
    is_active: bool = True


def _env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    return value.strip()


def _build_seed_users() -> list[SeedUser]:
    admin_password = _env("DEFAULT_ADMIN_PASSWORD")
    hr_password = _env("DEFAULT_HR_PASSWORD")

    seeds: list[SeedUser] = []

    if admin_password:
        seeds.append(
            SeedUser(
                username=_env("DEFAULT_ADMIN_USER", "admin") or "admin",
                email=_env("DEFAULT_ADMIN_EMAIL", "admin@hrmapp.com") or "admin@hrmapp.com",
                password=admin_password,
                role=_env("DEFAULT_ADMIN_ROLE", "admin") or "admin",
                is_admin=True,
            )
        )

    if hr_password:
        seeds.append(
            SeedUser(
                username=_env("DEFAULT_HR_USER", "hr") or "hr",
                email=_env("DEFAULT_HR_EMAIL", "hr@hrmapp.com") or "hr@hrmapp.com",
                password=hr_password,
                role=_env("DEFAULT_HR_ROLE", "hr_manager") or "hr_manager",
                is_admin=False,
            )
        )

    return seeds


def upsert_user(session, seed: SeedUser) -> None:
    hashed_password = get_password_hash(seed.password)
    statement = mysql_insert(User.__table__).values(
        username=seed.username,
        email=seed.email,
        hashed_password=hashed_password,
        role=seed.role,
        is_admin=seed.is_admin,
        is_active=seed.is_active,
    )
    statement = statement.on_duplicate_key_update(
        email=statement.inserted.email,
        hashed_password=statement.inserted.hashed_password,
        role=statement.inserted.role,
        is_admin=statement.inserted.is_admin,
        is_active=statement.inserted.is_active,
    )
    session.execute(statement)


def seed_users() -> int:
    seeds = _build_seed_users()
    if not seeds:
        print("No seed credentials provided. Skipping user seeding.")
        return 0

    session = SessionLocal()
    try:
        for seed in seeds:
            upsert_user(session, seed)
        session.commit()
        return len(seeds)
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def main() -> None:
    seeded_count = seed_users()
    print(f"Seeded or updated {seeded_count} user record(s).")


if __name__ == "__main__":
    main()
