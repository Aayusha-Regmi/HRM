# HRM System

A highly resilient Human Resource Management (HRM) application engineered with a high-performance **FastAPI backend** and a modular **React (Vite) frontend**. The system handles core enterprise operational workflows including authentication, granular employee and department management, automated attendance tracking, leave requests, dynamic job boards, real-time WebSockets notifications, and enterprise system configurations.

---

## System Architecture & Interface Overview

<p align="center">
  <img src="docs/images/department_page.png" alt="System Dashboard - Department Layout" width="100%">
</p>

```text
+--------------------------------------------------------------------------+
|  [React + Vite Frontend]  =======>  [Nginx Edge Proxy] =======> [FastAPI] |
|        (Port 80)                       (Port 80)              (Port 8000)|
+--------------------------------------------------------------------------+
```

The workspace is organized into distinct layer responsibilities:
*   `client/`: React production single-page application built on Vite and styled via Tailwind CSS.
*   `server/`: FastAPI microservice driving core CRUD logic, SQLAlchemy models, and high-performance routers.
*   `migrations/` & `alembic.ini`: Complete Alembic schema state machine mapping changes cleanly into the persistence tier.

---

## Default Administrative Credentials

The application populates your database automatically with two seeded testing accounts upon service initialization. 

| Assigned System Role | Default Username | Default Password | Access Control Permissions |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `Admin@2026!HRM` | Global read/write, configuration access |
| **HR Manager** | `hr` | `Hr@2026!HRM` | Departmental tracking, employee lifecycle controls |

*Production Note: Do not commit real passwords to your repository. Modify these parameters within your runtime environmental secrets manager before migrating live.*

---

## System Prerequisites

To run this application seamlessly within an isolated container network, install the following core tools on your host machine:

*   **Docker Desktop** (macOS / Windows) or **Docker Engine** (Linux) v20.10.0 or newer.
*   **Docker Compose v2** (Integrated into modern Docker installations).
*   **Git** (For cloning and version tracking).

*Note: You do not need to install Python, Node.js, or MySQL on your host system. All environments, dependencies, and engines are self-contained within the Docker images.*

---

## Docker & Containerized Orchestration

The application is fully containerized for local development and production simulation using multi-stage Docker configurations and orchestrated via Docker Compose.

### 1. Updated Project Topology
```text
HRM/
├── client/
│   ├── Dockerfile          # Multi-stage production build (Node + Nginx Alpine)
│   └── nginx/
│       └── default.conf    # Nginx reverse-proxy and client router routing rule
├── server/
│   ├── Dockerfile          # Fast-API backend build (Python 3.10-slim)
│   └── entrypoint.sh       # Database migration automation lifecycle script
├── docker-compose.yml      # Multi-container service topology orchestrator
└── .dockerignore           # Global build context exclusions
```

### 2. Nginx Reverse Proxy Architecture
The client container uses an **Nginx Alpine** server acting simultaneously as a static asset server and an edge reverse proxy. It routes traffic through a unified port (`80`), eliminating Cross-Origin Resource Sharing (CORS) complications in production:

*   **Static Assets (`/`)**: Serves the compiled production React single-page application (SPA). Fallbacks are configured to handle client-side paths via React Router cleanly (`try_files $uri $uri/ /index.html`).
*   **API Proxying (`/api`)**: Automatically proxies upstream network payloads directly to the FastAPI server at `http://server:8000/api`.
*   **WebSocket Gateway (`/ws`)**: Upgrades network connections dynamically to handle low-latency real-time dashboard events.

### 3. Step-by-Step Deployment Guide

#### Step 1: Clone and Enter Repository Workspace
```bash
git clone <your-repository-url>
cd HRM
```

#### Step 2: Environment Configuration
Before spinning up the containers, initialize your environment variables. Copy the example configuration file to create your runtime `.env` file in the repository root directory:
```bash
cp .env.example .env
```
*Open the newly created `.env` file and adjust the database credentials, application secrets, and configurations to match your local parameters.*

#### Step 3: Initialize the Container Stack
Ensure your Docker Engine daemon is active, then trigger the automated build infrastructure:
```bash
docker compose up --build -d
```
*   `--build`: Invalidates cached contexts and completely recompiles local system code variations.
*   `-d`: Runs the service dependencies decoupled in the background, freeing your terminal interface.

#### Step 4: Validate Deployment Lifecycles
Verify that all services are online and reporting healthy:
```bash
docker compose ps
```
The ecosystem utilizes a cascading dependent initialization chain:
1.  **`mysql_cont`** initializes and triggers a strict `mysqladmin ping` internal health check.
2.  **`server_cont`** blocks execution until MySQL reports healthy, executes automatic database migrations via `alembic upgrade head` inside `entrypoint.sh`, and validates its own health via a customized FastAPI endpoint.
3.  **`client_cont`** blocks execution until the FastAPI gateway returns a clean upstream health status.

### 4. Exposed Local Endpoints
*   **Production Frontend Web Interface**: `http://localhost:80`
*   **Direct Core REST Engine (Swagger Documentation)**: `http://localhost:8000/docs`
*   **Exposed Multi-Instance Local MySQL Port**: Accessible at `localhost:3306`

### 5. Common Operational Commands
```bash
# View active real-time consolidated logs across all running containers
docker compose logs -f

# View logs exclusively for the backend FastAPI application
docker compose logs -f server

# Access the shell of the running backend container for administrative debugging
docker compose exec server bash

# Tear down container infrastructure and cleanly erase persistent virtual network paths
docker compose down -v
```
