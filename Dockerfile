# --- STAGE 1: Backend Base ---
FROM python:3.11-slim AS backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 5000
CMD ["python", "app.py"]

# --- STAGE 2: Frontend Base ---
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
EXPOSE 3000
CMD ["npm", "start"]
