# Coding Interview — Run & Test

Quick commands to run the project locally.

1) Create and activate a Python virtualenv

```bash
cd 02-end-to-end/02-coding-interview
python -m venv .venv
source .venv/bin/activate
```

2) Install backend requirements

```bash
pip install -r backend/requirements.txt
```

3) Install frontend dependencies

```bash
npm --prefix frontend install
```

4) Run backend (development)

```bash
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

5) Run frontend (development)

```bash
npm --prefix frontend run dev
```

6) Run both (single command)

Ensure your venv is activated, then:

```bash
npm run dev
```

7) Run tests

```bash
# with venv active
python -m pytest -q backend
```

8) Docker (build & run)

```bash
docker compose -f 02-end-to-end/02-coding-interview/docker-compose.yml up --build
```

If you encounter `command not found` errors when running `npm run dev`, edit the root `package.json` dev script to use `python -m uvicorn` (already applied here) or activate the venv before running `npm run dev`.
# Coding Interview (Fullstack)

This repository contains a small fullstack coding-interview app:

- `backend/` — FastAPI backend that provides a health endpoint, a room creation endpoint, and a WebSocket endpoint for real-time collaborative editing.
- `frontend/` — Vite + React frontend (Monaco editor) that connects to the backend WebSocket.

This README explains how to set up the project, run it locally, run tests, and build a Docker image.

## Prerequisites

- Python 3.11+ (3.12 recommended)
- Node.js 18+ and npm
- (Optional) Docker if you want to build the image

## Quick start (recommended)

1. Create and activate a Python virtual environment, then install backend requirements:

```bash
cd /workspaces/ai-dev-tools-zoomcamp-homework/02-coding-interview
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

2. Install frontend dependencies (in a separate terminal or after the backend install):

```bash
# from project root
npm --prefix frontend install
```

3. Start backend and frontend concurrently (root `package.json` has a `dev` script that runs both):

```bash
# from project root
npm run dev
```

Alternatively you can run backend and frontend separately:

```bash
# Backend only (uvicorn)
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only (vite) in another terminal
cd frontend
npm run dev
```

Open the frontend dev server URL shown by Vite (usually `http://localhost:5173`) — the frontend connects to the backend WebSocket at `/ws/{room_id}`.

## API endpoints

- `GET /health` — returns `{"status": "ok"}`
- `POST /create_room` — creates and returns a short `room_id` JSON: `{"room_id": "abcd1234"}`
- `WebSocket /ws/{room_id}` — real-time communication for collaborative editing (JSON messages expected by the frontend)

## Tests

The backend includes integration tests.
- `backend/tests/test_integration.py` uses FastAPI `TestClient` and runs without an external server.
- `backend/tests/test_ws.py` checks websocket behavior using a real server on `localhost:8000` and is auto-skipped unless explicitly enabled.

```bash
# ensure venv is active and deps installed
pytest -q
```

To enable the websocket test, start the backend and set an env flag:

```bash
export APP_RUNNING=1
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
# in another terminal
pytest -q
```

Notes:
- If async tests are skipped, install `pytest-asyncio` in the venv: `python -m pip install pytest-asyncio`.

## Docker

Two approaches are supported conceptually:

- Backend-only image (simple): builds a Python image and runs uvicorn to serve the API.
- Full single-image (multi-stage): build the frontend assets and copy them into the final image and run the backend serving the static files. This requires `frontend` to produce a `dist` folder (Vite build) and the backend to mount the built assets (see the Dockerfile/notes in the repo).

### Build and run (multi-stage image)

```bash
# from project root (02-coding-interview)
docker build -t coding-interview-app .
docker run -p 8000:8000 coding-interview-app
```

Open `http://localhost:8000/` — the container serves the built frontend at `/` (if built) and the API/WebSocket on the same host.

### Using docker-compose

```bash
# build and start in foreground
docker compose up --build

# or in background
docker compose up --build -d

# stop and remove
docker compose down
```

Notes:

- The multi-stage `Dockerfile` builds the frontend with Node and copies the production `dist` into the Python image. For local development with hot-reload, run `npm run dev` (frontend) and `uvicorn` (backend) separately instead of using the container.
- If you only want to run the backend container (without building/copying frontend assets), build a backend-only image or run the backend as a separate service.

### Dev workflow with docker-compose services

For hot-reload development via containers, use separate `api` and `frontend` services:

```bash
cd /workspaces/ai-dev-tools-zoomcamp-homework/02-end-to-end/02-coding-interview

# start backend API (uvicorn --reload) and frontend (Vite HMR)
docker compose up api frontend

# access API/WebSocket
open http://localhost:8000

# access frontend dev
open http://localhost:5173

# stop services
docker compose down
```

The dev services mount your local code (`./backend`, `./frontend`) into the containers and install dependencies at startup.

## Helpful commands

- Activate venv: `source .venv/bin/activate`
- Install backend deps: `python -m pip install -r backend/requirements.txt`
- Install frontend deps: `npm --prefix frontend install`
- Run backend: `python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000`
- Run frontend: `cd frontend && npm run dev`
- Run tests: `pytest -q`

## Notes / Next steps

- If you want the backend to serve the frontend at `/`, I can patch `backend/app/main.py` to mount the frontend `dist` directory as static files.
- If you want CI configuration or a Docker Compose file to run both services together, I can add that as well.
# Coding Interview (Fullstack)

This repository contains a small fullstack coding-interview app:

- `backend/` — FastAPI backend that provides a health endpoint, a room creation endpoint, and a WebSocket endpoint for real-time collaborative editing.
- `frontend/` — Vite + React frontend (Monaco editor) that connects to the backend WebSocket.

This README explains how to set up the project, run it locally, run tests, and build a Docker image.

## Prerequisites

- Python 3.11+ (3.12 recommended)
- Node.js 18+ and npm
- (Optional) Docker if you want to build the image

## Quick start (recommended)

1. Create and activate a Python virtual environment, then install backend requirements:

```bash
cd /workspaces/ai-dev-tools-zoomcamp-homework/02-coding-interview
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

2. Install frontend dependencies (in a separate terminal or after the backend install):

```bash
# from project root
npm --prefix frontend install
```

3. Start backend and frontend concurrently (root `package.json` has a `dev` script that runs both):

```bash
# from project root
npm run dev
```

Alternatively you can run backend and frontend separately:

```bash
# Backend only (uvicorn)
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend only (vite) in another terminal
cd frontend
npm run dev
```

Open the frontend dev server URL shown by Vite (usually `http://localhost:5173`) — the frontend connects to the backend WebSocket at `/ws/{room_id}`.

## API endpoints

- `GET /health` — returns `{"status": "ok"}`
- `POST /create_room` — creates and returns a short `room_id` JSON: `{"room_id": "abcd1234"}`
- `WebSocket /ws/{room_id}` — real-time communication for collaborative editing (JSON messages expected by the frontend)

## Tests

The backend includes a small integration test that uses websockets. Run tests after starting the backend or install and run them (the integration test requires backend running on `localhost:8000`):

```bash
# ensure venv is active and deps installed
pytest -q
```

Notes:
- If async tests are skipped, install `pytest-asyncio` in the venv: `python -m pip install pytest-asyncio`.

## Docker

Two approaches are supported conceptually:

- Backend-only image (simple): builds a Python image and runs uvicorn to serve the API.
- Full single-image (multi-stage): build the frontend assets and copy them into the final image and run the backend serving the static files. This requires `frontend` to produce a `dist` folder (Vite build) and the backend to mount the built assets (see the Dockerfile/notes in the repo).

### Build and run (multi-stage image)

```bash
# from project root (02-coding-interview)
docker build -t coding-interview-app .
docker run -p 8000:8000 coding-interview-app
```

Open `http://localhost:8000/` — the container serves the built frontend at `/` (if built) and the API/WebSocket on the same host.

### Using docker-compose

```bash
# build and start in foreground
docker compose up --build

# or in background
docker compose up --build -d

# stop and remove
docker compose down
```

Notes:

- The multi-stage `Dockerfile` builds the frontend with Node and copies the production `dist` into the Python image. For local development with hot-reload, run `npm run dev` (frontend) and `uvicorn` (backend) separately instead of using the container.
- If you only want to run the backend container (without building/copying frontend assets), build a backend-only image or run the backend as a separate service.

## Helpful commands

- Activate venv: `source .venv/bin/activate`
- Install backend deps: `python -m pip install -r backend/requirements.txt`
- Install frontend deps: `npm --prefix frontend install`
- Run backend: `python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000`
- Run frontend: `cd frontend && npm run dev`
- Run tests: `pytest -q`

## Notes / Next steps

- If you want the backend to serve the frontend at `/`, I can patch `backend/app/main.py` to mount the frontend `dist` directory as static files.
- If you want CI configuration or a Docker Compose file to run both services together, I can add that as well.