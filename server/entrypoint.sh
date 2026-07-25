#!/bin/bash
set -e #exits fast if migrations fail

#Run migrations
alembic upgrade head

#Seed users
python -m server.seed_users #-m flag :This allows awareness of folders outside scripts

# Start the application
exec uvicorn server.main:app --host 0.0.0.0 --port 8000

#Further: this migration will be done using init comtainer while using K8s orchestration.