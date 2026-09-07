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
*   `terraform/`: Infrastructure as Code (IaC) configuration scripts provisioning the VPC and AWS EKS resources.
*   `k8s/`: Kubernetes deployment assets, including the Helm chart package and local Kind-based manifests.

---

## Project Structure

```text
HRM/
├── .github/
│   └── local-dev/
│       └── kind-config.yml
├── client/
│   ├── Dockerfile
│   ├── nginx/
│   │   └── default.conf
│   ├── public/
│   └── src/
├── docs/
│   └── images/
├── k8s/
│   ├── helm-charts/
│   │   ├── templates/
│   │   └── values.yaml
│   │   └── Chart.yaml
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
├── docker-compose.yml
└── README.md
```

When migrating this application from a local testing layout to a cloud-native production framework on Amazon EKS, several critical architectural decisions were made to prioritize production safety, engineering optimization, and extreme client credit/budget efficiency:

### Strategic Deviations & Skipped Elements
*   **AWS Load Balancer Controller (ALB) - SKIPPED:** Implementing the AWS Native ALB controller adds massive configuration overhead (dozens of custom IAM/IRSA policies) and provisions independent Application Load Balancers for every individual ingress resource. Instead, we deployed the NGINX Ingress Controller via Helm. This routes traffic using a single, unified internet-facing AWS Load Balancer acting as a reverse proxy, keeping routing logic centralized, portable, and drastically reducing multi-ALB line-item cloud costs.
*   **Amazon EBS Persistent Volumes - SKIPPED:** Dynamic AWS EBS volume provisioning (gp3/gp2 storage classes) charges a fixed monthly rate per gigabyte regardless of actual consumption. To preserve remaining client credits during development testing, we bypassed EBS entirely and leveraged Kubernetes emptyDir ephemeral volumes, writing storage data directly to the host EC2 instance's existing root hard drive for a 100% zero-added-cost storage architecture.

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
*   **Docker Desktop** (macOS / Windows) or **Docker Engine** (Linux) v20.10.0 or newer
*   **Docker Compose v2**
*   **Git**

For the Kubernetes paths (Kind or EKS):
*   **Docker Desktop** or **Docker Engine**
*   **kubectl**
*   **Helm v3**
*   **AWS CLI** (For EKS Deployment)
*   **Terraform** (For EKS Deployment)

You do not need to install Python, Node.js, or MySQL on your host machine for any of the paths.

---

## Path 1: Local Deployment via Docker Compose

Use this path when you want the application to run as a simple, containerized local stack.

### 1. Environment Configuration
Copy the example configuration file to create your runtime `.env` file in the repository root:
```bash
cp .env.example .env
```
Open the newly created `.env` file and adjust the database credentials, application secrets, and configurations to match your local parameters.

### 2. Run the Setup Script
Make the setup script executable:
```bash
chmod +x ./scripts/setup.sh
```
Then run it:
```bash
./scripts/setup.sh
```

### 3. Start the Stack
Ensure your Docker Engine daemon is active, then start the services:
```bash
docker compose up --build -d
```

### 4. Verify the Deployment
```bash
docker compose ps
```

### 5. Exposed Local Endpoints
*   **Frontend Web Interface**: `http://localhost:80`
*   **Swagger Documentation**: `http://localhost:8000/docs`
*   **MySQL**: `localhost:3306`

### 6. Common Operational Commands
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

## Path 2: Local Kubernetes Deployment via Kind

Use this path if a team member wants to simulate and test a multi-node Kubernetes container lifecycle locally on their machine for free without incurring cloud infrastructure costs.

### 1. Provision the Cluster Topology
Deploy the local cluster nodes using the dedicated Kind configuration blueprint stored in your development folder:
```bash
kind create cluster --config .github/local-dev/kind-config.yml --name hrm-local
```

### 2. Build and Side-Load Container Images
Build your local Docker images using the main project root as the build context, and sideload them directly into your local Kind node registry so Kubernetes can locate them without an online registry:
```bash
# Build Server Image
docker build -f server/Dockerfile -t hrm-server:latest .

# Build Client Image
docker build -f client/Dockerfile -t hrm-client:latest .

# Load into Kind node memory
kind load docker-image hrm-server:latest --name hrm-local
kind load docker-image hrm-client:latest --name hrm-local
```

### 3. Deploy via Helm
```bash
helm upgrade --install hrm ./k8s/helm-charts \
  -n hrm-namespace \
  --create-namespace \
  --set image.server.repository=hrm-server \
  --set image.server.tag=latest \
  --set image.client.repository=hrm-client \
  --set image.client.tag=latest
```

### 4. Verification and Access
```bash
# Watch deployment pods cycle into a Running state
kubectl get pods -n hrm-namespace -w

# Bridge your local network to your cluster client service host
kubectl port-forward service/client-service 32080:80 -n hrm-namespace
```
Open your browser and navigate to `http://localhost:32080`.

---

## Path 3: Production Cloud Deployment via Amazon EKS

Use this path to spin up the actual production environment on AWS using Terraform and connect it to a public-facing domain registry.

### 1. Build and Authenticate ECR Container Registries
Authenticate your local Docker client securely with AWS ECR (tokens are valid for 12 hours) and push your compiled production images to the cloud:
```bash
# Log in to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ://amazonaws.com

# Build from root context, Tag, and Push
docker build -f server/Dockerfile -t hrm-server:latest .
docker tag hrm-server:latest ://amazonaws.com/hrm-infra-app:latest
docker push ://amazonaws.com/hrm-infra-app:latest
```

### 2. Initialize and Deploy AWS Infrastructure via Terraform
Navigate to the Terraform directory to spin up the VPC, networking layers, subnets, and the managed EKS Control Plane alongside the EC2 compute worker nodes:
```bash
cd terraform
terraform init
terraform apply --auto-approve
```

### 3. Connect kubectl to the EKS Cluster API
Refresh your local shell configuration context to point to the active live AWS EKS endpoint instead of any cached local endpoints:
```bash
aws eks update-kubeconfig --region us-east-1 --name hrm-infra-eks-cluster
```

### 4. Install the NGINX Ingress Controller
Add the community chart repository and install the NGINX controller. This command automatically calls the AWS API to provision a physical, high-availability AWS Load Balancer as your master gateway:
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

### 5. Deploy the Application Helm Chart
Deploy the application manifests. Ensure `k8s/helm-charts/templates/ingress.yml` defines the expected custom domain under the `host` attribute.

```bash
helm upgrade --install hrm ./k8s/helm-charts \
  --namespace hrm-namespace \
  --create-namespace

kubectl get ingress -n hrm-namespace
```

### 6. Map the Domain to the Load Balancer
Get the public AWS Load Balancer endpoint:

```bash
kubectl get svc -n ingress-nginx
```

Copy the `EXTERNAL-IP` value, then create a CNAME record with your DNS provider. Point the desired subdomain, such as `app`, to the AWS Load Balancer hostname. Do not include `http://` or a trailing slash in the DNS target.

### 7. Common Helm Operations
```bash
# View release history and deployment status
helm history hrm --namespace hrm-namespace

# Roll back to a previous release
helm rollback hrm 1 --namespace hrm-namespace

# Remove the application release
helm uninstall hrm --namespace hrm-namespace
```

## Cost-Saving Teardown

When testing or demoing is complete, destroy the AWS infrastructure to stop charges for the EKS cluster, EC2 workers, and Load Balancer:

```bash
cd terraform
terraform destroy --auto-approve
```

The Terraform configuration remains in the repository and can be recreated later with `terraform apply`.

