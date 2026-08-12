#!/bin/bash
set -e 

# Run migrations globally on startup
alembic upgrade head

# Seed initial system users
python -m server.seed_users 

# If a custom command was passed to Docker (like python -m server.seed), run that instead of Uvicorn!
if [ $# -gt 0 ]; then
    exec "$@"
else
    # Default behavior: Start the web application
    exec uvicorn server.main:app --host 0.0.0.0 --port 8000
fi
