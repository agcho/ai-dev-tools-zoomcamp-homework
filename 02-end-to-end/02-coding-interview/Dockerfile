# Multi-stage Dockerfile: build frontend and bundle into Python image

# Stage 1: build frontend assets
FROM node:20-bullseye-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend/ ./
RUN npm ci --silent && npm run build

# Stage 2: runtime image with Python and uvicorn
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install minimal build deps (if needed by some wheels)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python requirements
COPY backend/requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip && python -m pip install -r requirements.txt

# Copy backend code
COPY backend/app ./backend/app

# Copy built frontend from previous stage into /app/frontend/dist
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]