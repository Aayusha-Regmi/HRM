from typing import List
from fastapi import WebSocket

connections: List[WebSocket] = []

async def connect(ws: WebSocket):
    await ws.accept()
    connections.append(ws)

async def disconnect(ws: WebSocket):
    try:
        connections.remove(ws)
    except ValueError:
        pass

async def broadcast(event: dict):
    # send JSON event to all connected clients; silently remove dead sockets
    for ws in list(connections):
        try:
            await ws.send_json(event)
        except Exception:
            await disconnect(ws)
