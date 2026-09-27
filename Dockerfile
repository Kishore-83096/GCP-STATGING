# --- Backend Base ---
FROM python:3.11-slim AS backend-base
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# --- CI: Backend Checks ---
FROM backend-base AS backend-ci
RUN pip install --no-cache-dir ruff
RUN python -m pytest && ruff check . && python -m compileall -q . && touch /tmp/backend-checks-passed

# Backend runtime image; it can only build after backend checks pass.
FROM backend-base AS backend
COPY --from=backend-ci /tmp/backend-checks-passed /tmp/backend-checks-passed
EXPOSE 5000
CMD ["python", "app.py"]

# --- Frontend Base ---
FROM node:18-alpine AS frontend-base
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

# --- CI: Frontend Checks ---
FROM frontend-base AS frontend-ci
RUN npm run lint && npm test -- --runInBand && npm run build && touch /tmp/frontend-checks-passed

# Frontend runtime image; it can only build after frontend checks pass.
FROM frontend-base AS frontend
COPY --from=frontend-ci /tmp/frontend-checks-passed /tmp/frontend-checks-passed
EXPOSE 3000
CMD ["npm", "start"]
