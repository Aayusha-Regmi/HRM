# HRM System

A modern Human Resource Management (HRM) System built with **React** for the frontend and **FastAPI** for the backend. The application provides employee management, authentication, and other HR-related functionalities through a RESTful API.

---

## Tech Stack

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

### Backend
- FastAPI
- Uvicorn
- SQLAlchemy
- MySQL
- Alembic
- JWT Authentication

---

## Project Structure

```
hrm-system/
│
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # FastAPI backend
│   ├── app/
│   ├── alembic/
│   ├── requirements.txt
│   ├── .env
│   └── main.py
│
└── README.md
```

---

# Features

- Employee Management
- User Authentication
- JWT Authorization
- Password Encryption (bcrypt)
- REST API
- Database Migrations with Alembic
- MySQL Database Integration
- Environment Variable Configuration

---

# Backend Installation

## 1. Navigate to server

```bash
cd server
```

## 2. Create virtual environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

requirements.txt

```
fastapi
uvicorn
sqlalchemy
pymysql
python-dotenv
passlib[bcrypt]
python-jose
alembic
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
DATABASE_URL=mysql+pymysql://username:password@localhost/hrm_db

SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 5. Run Database Migrations

```bash
alembic upgrade head
```

---

## 6. Start the FastAPI Server

```bash
uvicorn main:app --reload
```

Server runs at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```
http://127.0.0.1:8000/redoc
```

---

# Frontend Installation

Navigate to client

```bash
cd client
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

or if using Create React App

```bash
npm start
```

Frontend runs at

```
http://localhost:3000
```

or

```
http://localhost:5173
```

depending on your React setup.

---

# Database

Supported database:

- MySQL

ORM:

- SQLAlchemy

Migration Tool:

- Alembic

---

# Authentication

The application uses:

- JWT (JSON Web Token)
- Password hashing using bcrypt
- Secure authentication with python-jose

---

# API Documentation

FastAPI automatically generates API documentation.

Swagger UI

```
http://localhost:8000/docs
```

ReDoc

```
http://localhost:8000/redoc
```

---

# Backend Dependencies

| Package | Purpose |
|----------|---------|
| FastAPI | API Framework |
| Uvicorn | ASGI Server |
| SQLAlchemy | ORM |
| PyMySQL | MySQL Driver |
| python-dotenv | Environment Variables |
| passlib[bcrypt] | Password Hashing |
| python-jose | JWT Authentication |
| Alembic | Database Migrations |

---

# Development Workflow

1. Clone the repository
2. Set up the backend
3. Configure the `.env` file
4. Run database migrations
5. Start the FastAPI server
6. Set up the React frontend
7. Start the React development server

---

# Future Improvements

- Leave Management
- Payroll Management
- Attendance Tracking
- Performance Evaluation
- Email Notifications
- Role-Based Access Control (RBAC)
- Dashboard Analytics
- Docker Support
- CI/CD Pipeline
- Kubernetes Deployment

---

# License

This project is licensed under the MIT License.