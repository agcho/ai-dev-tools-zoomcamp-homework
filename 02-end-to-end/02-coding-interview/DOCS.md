# Coding Interview — Project Documentation

This document describes the `02-coding-interview` project: architecture, APIs, WebSocket protocol, development and production instructions, testing, Docker, and troubleshooting.

---

## Project Overview

- Purpose: a small fullstack app for live collaborative coding interviews. The frontend is a Vite + React app using the Monaco editor. The backend is a FastAPI app that manages rooms and relays WebSocket messages between clients in the same room.
- Location: all sources are under `02-coding-interview/`.

High-level components:
- `frontend/` — React UI, connects to backend WebSocket at `/ws/{room_id}` and uses REST `POST /create_room`.
- `backend/` — FastAPI app with HTTP endpoints and WebSocket support.

---

## File structure (important files)

```
02-coding-interview/
├─ backend/
│  ├─ app/
│  │  ├─ main.py          # FastAPI app + WebSocket endpoint
│  │  └─ rooms.py         # RoomManager: connect/disconnect/broadcast
│  └─ requirements.txt
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     └─ Editor.jsx       # Monaco editor + WebSocket client
├─ package.json           # root: concurrently script to run frontend + backend
├─ Dockerfile             # optional (empty originally)
├─ README.md              # quick start
└─ DOCS.md                # this file
```

---

## Architecture & flow

1. A user opens the frontend. They either create a room (POST `/create_room`) or join with an existing `room_id`.
2. The frontend opens a WebSocket to `/ws/{room_id}`.
3. The backend `RoomManager` keeps an in-memory list of WebSocket connections per room and relays messages between clients (broadcast to others in same room).
4. Messages are JSON strings carrying a `type` field (example: `{ "type": "edit", "content": "...", "sender": "uuid" }`).

Notes:
- The backend does not persist messages or state; rooms are transient in memory.
- The backend currently accepts any JSON and broadcasts it to other clients in the room.

---

## API

### GET /health

Returns 200 with JSON:

```json
{ "status": "ok" }
```

### POST /create_room

Creates a new short room ID and returns:

```json
{ "room_id": "abcd1234" }
```

### WebSocket /ws/{room_id}

Used for real-time collaboration. Frontend sends JSON messages; server broadcasts to all other clients connected to the same room ID.

Typical message format (frontend convention):

```json
{ "type": "edit", "content": "<text>", "sender": "<client-uuid>" }
```

Server behavior:
- On connect: `RoomManager.connect(room_id, websocket)` accepts the connection and registers it.
- On message: server reads text and calls `RoomManager.broadcast` which relays to other connections in same room.
- On disconnect or error: server removes the websocket from room and cleans up empty rooms.

Security: no authentication is implemented. In production, add authentication, authorization for room access, rate limiting and origin checks.

---

## Development setup

Prereqs: Python 3.11+ (3.12 used in dev container), Node.js 18+, npm.

1. Clone and enter project

```bash
cd /workspaces/ai-dev-tools-zoomcamp-homework/02-coding-interview
```

2. Create virtualenv and install backend deps

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

3. Install frontend deps

```bash
npm --prefix frontend install
```

4. Run backend only

```bash
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Run frontend only (in a separate terminal)

```bash
cd frontend
npm run dev
```

6. Run both together (root script)

```bash
npm run dev
```

Open the Vite dev server URL (usually `http://localhost:5173`) to use the UI.

---

## Testing

Unit/integration tests are located in `backend/tests/`.

The integration test uses `websockets` and `pytest-asyncio`. To run tests:

```bash
source .venv/bin/activate
pytest -q
```

If async tests are skipped, ensure `pytest-asyncio` is installed in the venv:

```bash
python -m pip install pytest-asyncio
```

Test notes:
- The integration test expects the backend to be running on `localhost:8000`.
- The test opens two WebSocket clients and verifies one message sent by ws1 is received by ws2.

---

## Docker

Two recommended Docker approaches are in the README and below.

### Option 1 — Backend-only (simple)

Dockerfile (example):

```Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
COPY backend/app ./backend/app
RUN python -m pip install --upgrade pip && python -m pip install -r backend/requirements.txt
EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build & run:

```bash
docker build -t coding-interview-backend -f Dockerfile .
docker run -p 8000:8000 coding-interview-backend
```

### Option 2 — Multi-stage: build frontend and serve static files via backend

This bundles frontend `dist` into the final image and requires the backend to mount and serve static files (see README). I can add a working multi-stage `Dockerfile` and patch `main.py` to mount the `dist` folder on request.

---

## Troubleshooting

- 404 at `/`: FastAPI only exposes API endpoints by default; the frontend dev server serves the UI. Either run Vite or mount the built frontend in the backend.
- Port already in use: use `lsof -i :8000` or `ss -ltnp | grep :8000` to find the process and `kill` it.
- WebSocket connection refused: ensure backend is running and that the frontend connects to the right origin `ws://<host>/ws/<room>`.
- Tests skipped due to async: install `pytest-asyncio`.

---

## WebSocket message contract (frontend ↔ backend)

Frontend sends JSON text messages. The server does not parse beyond reading and rebroadcasting, but the frontend expects JSON with structure like:

```json
{
  "type": "edit",
  "content": "<editor content>",
  "sender": "<client-uuid>"
}
```

Recommended enhancements:
- Add message validation on the server (e.g., require `type` and `sender`).
- Add presence events (`join`, `leave`) and optional server-side authoritative state.

---

## Next steps / Enhancements

- Persist room state and history to a database for reconnection and replay.
- Add authentication/authorization for rooms.
- Add TLS / deploy behind reverse proxy (NGINX) in production.
- Improve frontend: show participant list, cursor positions, and conflict resolution techniques (CRDTs or OT).
- Add CI pipeline and Docker Compose for local development.

---

If you'd like, I can:
- Patch backend to serve the frontend at `/`.
- Create a multi-stage Dockerfile and build image.
- Add Docker Compose and GitHub Actions CI.

Tell me what you'd like next and I'll implement it.
