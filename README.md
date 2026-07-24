# HRM System

A Human Resource Management application with a React frontend and a FastAPI backend. It supports authentication, employee and department management, attendance, leave management, job postings, job applications, notifications, and company settings.

## Overview

The repository is split into two runnable applications:

- `client/` contains the React + Vite frontend.
- `server/` contains the FastAPI backend, database models, CRUD logic, and API routes.
- `migrations/` and `alembic.ini` provide database migration support from the repository root.

The frontend talks to the backend through a cookie-based auth flow and REST endpoints. The dashboard also listens to a backend websocket for realtime events.

Database schema is managed through Alembic migrations. User seeding is a separate one-off script and does not run during backend startup.

## Features

- Authentication with access and refresh cookies
- Role-aware route protection
- Employee, department, attendance, leave, job posting, and job application management
- Notification and company settings endpoints
- Realtime dashboard event updates over WebSocket
- MySQL persistence with SQLAlchemy and Alembic

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- PyMySQL
- python-jose
- Passlib

## Prerequisites

Install the following before setting up the project:

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- MySQL 8 or compatible

You also need a local MySQL database and permission to create tables in it.

## Project Structure

```text
HRM/
├── client/                 # React frontend
├── migrations/             # Alembic migration environment
├── server/                 # FastAPI backend
├── alembic.ini             # Alembic config used from the repository root
└── README.md
```

## Backend Setup

### 1. Create and activate a virtual environment

From the repository root:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
source .venv/bin/activate
```

### 2. Install backend dependencies

```bash
pip install -r server/requirements.txt
```

### 3. Configure the backend environment

Create a file at `server/.env` and set your database and auth values.

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=hrm_db

SECRET_KEY=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
SQL_ECHO=false

# Optional: credentials used by the one-time seed script
DEFAULT_ADMIN_USER=admin
DEFAULT_ADMIN_EMAIL=admin@hrmapp.com
DEFAULT_ADMIN_PASSWORD=change-me-in-secrets-manager
DEFAULT_HR_USER=hr
DEFAULT_HR_EMAIL=hr@hrmapp.com
DEFAULT_HR_PASSWORD=change-me-in-secrets-manager

# Optional: allow additional frontend origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Notes:

- `MYSQL_*` values are used to build the SQLAlchemy connection string.
- `SECRET_KEY` should be changed before using the app outside local development.
- `ALLOWED_ORIGINS` controls which browser origins can call the backend.

### 4. Create the database

Create the MySQL database referenced by `MYSQL_DB` before starting the app.

### 5. Run migrations

Run Alembic from the repository root so it can use the top-level `alembic.ini` and create the schema:

```bash
alembic upgrade head
```

### 6. Start the backend

From the repository root:

```bash
uvicorn server.main:app --reload
```

Backend URLs:

- API root: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- WebSocket events: `ws://localhost:8000/ws/events`

## Frontend Setup

### 1. Install frontend dependencies

```bash
cd client
npm install
```

### 2. Configure optional frontend environment variables

Create `client/.env.local` only if you want to override the defaults.

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/events
```

If these are not set, the frontend uses:

- `http://localhost:8000/api` in development
- `/api` in production
- `ws://localhost:8000/ws/events` in development for dashboard realtime updates

### 3. Start the frontend

```bash
npm run dev
```

The Vite dev server usually runs at `http://localhost:5173`.

## Default Local Accounts

The backend initialization script seeds two users when the database is initialized:

- Admin user: `admin` / `Admin@2026!HRM`
- HR manager user: `hr` / `Hr@2026!HRM`

These defaults should come from environment variables or a secret store in production. Do not commit real passwords to the repository.

## Common Commands

Backend:

```bash
alembic upgrade head
python -m server.seed_users
uvicorn server.main:app --reload
```

Frontend:

```bash
cd client
npm run dev
npm run build
npm run lint
```

## How It Works

- The frontend sends requests through a shared Axios client in `client/src/api/hrmApi.js`.
- Authentication is handled with HTTP-only access and refresh cookies.
- Protected backend routes depend on the current user and role checks.
- The startup routine in `server/main.py` only boots the API; seeding is handled by `server/seed_users.py`.
- `server/seed_users.py` uses MySQL upsert semantics so it can be run repeatedly without duplicate-user failures.
- Alembic is the source of truth for table creation and schema changes.

## Troubleshooting

- If login fails, confirm the MySQL database exists and the backend can connect using the values in `server/.env`.
- If the frontend cannot reach the backend, check `VITE_API_URL` and `ALLOWED_ORIGINS`.
- If websocket updates do not appear, verify that the backend is running and that `VITE_WS_URL` matches the backend host and port.
- If Alembic cannot find the config, make sure you run `alembic upgrade head` from the repository root.

## API Documentation

FastAPI generates interactive API docs automatically:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`