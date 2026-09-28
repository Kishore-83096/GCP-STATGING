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
