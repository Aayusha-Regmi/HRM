# HRM System

A highly resilient Human Resource Management (HRM) application engineered with a high-performance **FastAPI backend** and a modular **React (Vite) frontend**. The system handles core enterprise operational workflows including authentication, granular employee and department management, automated attendance tracking, leave requests, dynamic job boards, real-time WebSocket notifications, and enterprise system configuration.

---

## System Architecture & Interface Overview

![Dashboard](docs/images/department_page.png)

```text
+--------------------------------------------------------------------------+
|  [React + Vite Frontend]  =======>  [Nginx Edge Proxy] =======> [FastAPI] |
|        (Port 80)                       (Port 80)              (Port 8000)|
+--------------------------------------------------------------------------+
```

The workspace is organized into distinct layer responsibilities:
*   `client/`: React production single-page application built on Vite and styled via Tailwind CSS.
*   `server/`: FastAPI service driving core CRUD logic, SQLAlchemy models, and API routers.
*   `migrations/` and `alembic.ini`: Alembic schema migrations for database versioning.
*   `docker-compose.yml`: Local Docker Compose stack for the application and database.
*   `k8s/`: Kubernetes manifests for local Kind-based deployment.

---

## Project Structure

```text
HRM/
├── client/
│   ├── Dockerfile
│   ├── nginx/
│   │   └── default.conf
│   ├── public/
│   └── src/
├── docs/
│   └── images/
├── k8s/
│   ├── base/
│   │   ├── client/
│   │   ├── mysql/
│   │   └── server/
│   └── kind-config.yml
├── migrations/
├── scripts/
│   └── setup.sh
├── server/
│   ├── api/
│   ├── core/
│   ├── crud/
│   ├── models/
│   ├── schemas/
│   └── Dockerfile
├── .env.example
├── alembic.ini
├── docker-compose.yml
└── README.md
```

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

Choose the deployment path you want to use, then install the matching tools.

For the Docker Compose path:
*   **Docker Desktop** (macOS / Windows) or **Docker Engine** (Linux) v20.10.0 or newer.
*   **Docker Compose v2**.
*   **Git**.

For the Kubernetes path:
*   **Docker Desktop** or **Docker Engine**.
*   **kubectl**.
*   **kind**.

You do not need to install Python, Node.js, or MySQL on your host machine for either path.

---

## Choose a Deployment Path

This repository supports two local run modes:

1. **Docker Compose** for the simplest local stack.
2. **Kubernetes** with Kind and NGINX Ingress for a cluster-based deployment.

Pick the section below that matches your workflow.

---

## Docker Compose Deployment

Use this path when you want the application to run as a local container stack.

### 1. Clone and Enter Repository Workspace
```bash
git clone <your-repository-url>
cd HRM
```

### 2. Environment Configuration
Copy the example configuration file to create your runtime `.env` file in the repository root:
```bash
cp .env.example .env
```
Open the newly created `.env` file and adjust the database credentials, application secrets, and configurations to match your local parameters.

### 3. Run the setup script
Make the setup script executable:
```bash
chmod +x ./scripts/setup.sh
```
Then run it:
```bash
./scripts/setup.sh
```

### 4. Start the stack
Ensure your Docker Engine daemon is active, then start the services:
```bash
docker compose up --build -d
```

### 5. Verify the deployment
```bash
docker compose ps
```

### 6. Exposed local endpoints
*   **Frontend Web Interface**: `http://localhost:80`
*   **Swagger Documentation**: `http://localhost:8000/docs`
*   **MySQL**: `localhost:3306`

### 7. Common operational commands
```bash
# View active real-time consolidated logs across all running containers
docker compose logs -f

# View logs exclusively for the backend FastAPI application
docker compose logs -f server

# Access the shell of the running backend container for administrative debugging
docker compose exec server bash

# Tear down container infrastructure and remove persistent volumes
docker compose down -v
```

---

## Kubernetes Deployment

Use this path when you want to run the HRM system on a local Kubernetes cluster with Kind and NGINX Ingress.

### 1. What We Are Using
* **Kubernetes** manifests in `k8s/base/` for `client`, `server`, and `mysql`.
* **Kind** (Kubernetes in Docker) using `k8s/kind-config.yml` for local cluster creation.
* **NGINX Ingress Controller** for HTTP routing into the cluster.
* **Horizontal Pod Autoscaler (HPA)** for backend scaling (`k8s/base/server/hpa.yml`).
* **ConfigMap and Secret resources** for server configuration and sensitive environment values.

### 2. Kubernetes Prerequisites
Install these tools on your machine before deploying with Kubernetes:
* **Docker Engine/Desktop** (required by Kind)
* **kubectl**
* **kind**

### 3. Setup Steps

#### Step 1: Create a local Kind cluster
```bash
kind create cluster --config k8s/kind-config.yml
```

#### Step 2: Install NGINX Ingress Controller
Use the official install manifest for Kind:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.3/deploy/static/provider/kind/deploy.yaml
```

#### Step 3: Wait for ingress controller to be ready
```bash
kubectl wait --namespace ingress-nginx \
	--for=condition=ready pod \
	--selector=app.kubernetes.io/component=controller \
	--timeout=180s
```

#### Step 4: Deploy HRM resources
```bash
kubectl apply -f k8s/base/namespace.yml
kubectl apply -f k8s/base/mysql/secret.yml
kubectl apply -f k8s/base/mysql/mysql.yml
kubectl apply -f k8s/base/server/secret.yml
kubectl apply -f k8s/base/server/configmap.yml
kubectl apply -f k8s/base/server/deployment.yml
kubectl apply -f k8s/base/server/service.yml
kubectl apply -f k8s/base/server/hpa.yml
kubectl apply -f k8s/base/client/deployment.yml
kubectl apply -f k8s/base/client/service.yml
kubectl apply -f k8s/base/ingress.yml
```

### 4. Use and Verification
```bash
# Check pods and services
kubectl get pods -n hrm
kubectl get svc -n hrm

# Check ingress
kubectl get ingress -n hrm

# Port-forward ingress controller to access cluster ingress on localhost:8080
kubectl port-forward --address 0.0.0.0 service/ingress-nginx-controller 8080:80 -n ingress-nginx &

# Watch backend scaling status
kubectl get hpa -n hrm -w
```

If your ingress host is mapped locally, open the configured frontend host/path from `k8s/base/ingress.yml` in your browser.

### 5. Useful K8s Operations
```bash
# View all resources
kubectl get all -n hrm

# Follow backend logs
kubectl logs -n hrm deployment/server --follow

# Remove all HRM resources
kubectl delete -f k8s/base/ingress.yml
kubectl delete -f k8s/base/client/service.yml
kubectl delete -f k8s/base/client/deployment.yml
kubectl delete -f k8s/base/server/hpa.yml
kubectl delete -f k8s/base/server/service.yml
kubectl delete -f k8s/base/server/deployment.yml
kubectl delete -f k8s/base/server/configmap.yml
kubectl delete -f k8s/base/server/secret.yml
kubectl delete -f k8s/base/mysql/mysql.yml
kubectl delete -f k8s/base/mysql/secret.yml
kubectl delete -f k8s/base/namespace.yml
```
