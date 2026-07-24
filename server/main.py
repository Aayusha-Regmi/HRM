
import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from server.api import department, employee, job_posting, job_application, attendance, leave, notification, user, auth, settings
from server.core.config import settings as core_settings
from server.core.security import get_current_user
from server.realtime import connect, disconnect


app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:5174",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(department.router, prefix="/api", tags=["departments"], dependencies=[Depends(get_current_user)])
app.include_router(employee.router, prefix="/api", tags=["employees"], dependencies=[Depends(get_current_user)])
app.include_router(job_posting.router, prefix="/api", tags=["job_postings"], dependencies=[Depends(get_current_user)])
app.include_router(job_application.router, prefix="/api", tags=["job_applications"], dependencies=[Depends(get_current_user)])
app.include_router(attendance.router, prefix="/api", tags=["attendances"], dependencies=[Depends(get_current_user)])
app.include_router(leave.router, prefix="/api", tags=["leaves"], dependencies=[Depends(get_current_user)])
app.include_router(notification.router, prefix="/api", tags=["notifications"], dependencies=[Depends(get_current_user)])
app.include_router(user.router, prefix="/api", tags=["users"], dependencies=[Depends(get_current_user)])
app.include_router(settings.router, prefix="/api", tags=["settings"])


@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    # cookie-based auth; browser sends the httpOnly access cookie automatically
    token = websocket.cookies.get("access_token")
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(token, core_settings.SECRET_KEY, algorithms=[core_settings.ALGORITHM])
        if payload.get("type") != "access" or not payload.get("sub"):
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    await connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await disconnect(websocket)
    except Exception:
        await disconnect(websocket)


@app.get("/")
def read_root():
    return {"message": "HRM Backend is running"}
