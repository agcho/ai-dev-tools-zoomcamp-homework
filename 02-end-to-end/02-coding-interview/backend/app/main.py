# backend/app/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from .rooms import room_manager
import uuid
import pathlib


app = FastAPI()

# If a frontend build exists at ../frontend/dist, serve its assets under /static
project_root = pathlib.Path(__file__).resolve().parents[2]
frontend_dist = project_root / 'frontend' / 'dist'
if frontend_dist.exists():
    # serve static assets at /static/*
    app.mount('/static', StaticFiles(directory=str(frontend_dist), html=False), name='frontend_static')

    # serve index.html at root so the SPA can be loaded
    @app.get('/')
    async def serve_index():
        index_file = frontend_dist / 'index.html'
        if index_file.exists():
            return FileResponse(str(index_file), media_type='text/html')
        return JSONResponse({'detail': 'Not Found'}, status_code=404)


@app.get('/health')
async def health():
    return JSONResponse({'status': 'ok'})


@app.post('/create_room')
async def create_room():
    room_id = uuid.uuid4().hex[:8]
    return {'room_id': room_id}


@app.websocket('/ws/{room_id}')
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await room_manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # data is expected to be a JSON string client-side; the server just broadcasts
            await room_manager.broadcast(room_id, data, sender=websocket)
    except WebSocketDisconnect:
        await room_manager.disconnect(room_id, websocket)
    except Exception:
        await room_manager.disconnect(room_id, websocket)