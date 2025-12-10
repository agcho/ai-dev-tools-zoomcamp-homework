## Question 1

Initial Prompt:
"Implement a complete, runnable full-stack 'coding interview' web app (frontend + backend) and return all source files and run instructions in a single response. Backend: FastAPI (+ WebSocket / rooms, health, create_room, serve built frontend). Frontend: React + Vite + @monaco-editor/react (room create/join, WebSocket edits). Code execution: JS via sandboxed iframe, Python via Pyodide. Add tests, Docker (multi-stage bundling frontend + backend), and a README with setup/run/test commands."

## Question 2

Tests Command:
python -m pytest -q backend

## Question 3

Dev Script (run both with concurrently):
"dev": "concurrently \"npm --prefix frontend run dev\" \"python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000\""

## Question 4

Syntax Highlighting Library:
@monaco-editor/react (Monaco Editor)

## Question 5

Python-to-WASM Library:
Pyodide (runs Python safely in the browser)

## Question 6

Dockerfile Base Image:
Runtime: python:3.12-slim
Frontend build stage: node:20-alpine (multi-stage)

## Question 7

Deployment Service:
Prepared for container-based deploy; suggested host: Render (Docker) or Fly.io. If you need a specific answer: Render.
