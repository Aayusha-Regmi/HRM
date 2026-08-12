#Stage1: Build the backend app
FROM python:3.11-slim AS builder
#Create directory to add build files
WORKDIR /app
#Copy requirements file to build directory
COPY server/requirements.txt .

#Create virtual environment to isolate dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
#Install packages
RUN pip install --no-cache-dir -r requirements.txt



#Stage2: RUN IMAGE

FROM python:3.11-slim
#Create directory
WORKDIR /app
#COPY the files
COPY --from=builder /opt/venv /opt/venv
#Set up virtual environment for runner
ENV PATH="/opt/venv/bin:$PATH"
#Copy alembic init files and other files
COPY ./alembic.ini ./alembic.ini
COPY ./server ./server
COPY ./migrations ./migrations
COPY ./server/entrypoint.sh ./server/entrypoint.sh
COPY ./server/.env ./server/.env

RUN chmod +x ./server/entrypoint.sh
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*


ENTRYPOINT ["./server/entrypoint.sh"]





