# HRM Project v1

This repository now has a deployment-ready v1 path for AWS.

## Recommended AWS v1 setup

- Frontend: build the Vite app and serve it from the same EC2 host through Nginx.
- Backend: run FastAPI with Uvicorn on the same EC2 host.
- Database: use Amazon RDS MySQL free tier, or keep MySQL on the same EC2 instance if you want the simplest demo.
- Real-time updates: keep the WebSocket endpoint on the same domain so cookies and auth stay simple.

## Why this version works well for a DevOps portfolio

- One-click style deployment on EC2 using a reproducible build.
- Environment-driven configuration for API, WebSocket, and CORS.
- Cookie-based auth still works behind Nginx and HTTPS.
- Easy to extend with CI/CD, monitoring, and infrastructure as code later.

## Local development

Client:

```bash
cd client
npm install
npm run dev
```

Server:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r server/requirements.txt
uvicorn server.main:app --reload
```

## AWS deployment variables

Backend:

- `ALLOWED_ORIGINS` - comma-separated frontend origins, for example `http://YOUR_EC2_PUBLIC_IP,https://your-domain.com`
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`
- `SECRET_KEY`
- `COOKIE_SECURE=true` once you serve the app over HTTPS
- `COOKIE_SAMESITE=none` if frontend and backend are on different HTTPS origins

Frontend:

- `VITE_API_URL` - optional API base URL, for example `/api` when Nginx serves both apps on the same domain
- `VITE_WS_URL` - optional WebSocket URL, for example `wss://your-domain.com/ws/events`

## Suggested EC2 free-tier flow

1. Launch an Ubuntu EC2 free-tier instance.
2. Install Python, Node.js, MySQL client, and Nginx.
3. Point the backend to RDS MySQL or a local MySQL instance.
4. Build the frontend with `npm run build`.
5. Use Nginx to serve `client/dist` and reverse proxy `/api` and `/ws` to Uvicorn.
6. Add HTTPS with an ACM-backed load balancer or, for a leaner demo, use a self-managed certificate setup.

## Good portfolio upgrades after v1

- GitHub Actions for build and deployment.
- Terraform or CloudFormation for EC2, security groups, and RDS.
- CloudWatch logs and alarms.
- S3 backup strategy for database exports.