# Trustfy Deployment Guide

This guide covers the deployment of the Trustfy P2P Escrow stack (API, Worker, Web, Database, Redis, MinIO).

## 1. Environment Preparation

### Infrastructure Requirements
-   **PostgreSQL**: v14+
-   **Redis**: v6+
-   **S3-Compatible Storage**: AWS S3 or MinIO
-   **Node.js**: v18+ (LTS)
-   **Docker** (optional, for containerized deployment)

### Environment Variables
Each service (`api`, `worker`, `web`) requires specific environment variables. See `.env.example` in each directory.

**Shared Variables:**
-   `DATABASE_URL`: Connection string for PostgreSQL.
-   `REDIS_URL`: Connection string for Redis.
-   `RPC_URL`: Blockchain RPC endpoint (BSC Testnet/Mainnet).
-   `CONTRACT_ADDRESS`: Address of the `TrustfyEscrow` contract.

## 2. Docker Deployment (Recommended)

The easiest way to deploy the full stack is using Docker Compose.

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd trustfy
    ```

2.  **Configure Environment**:
    Create a root `.env` file (or individual `.env` files if using a custom compose setup) based on `api/.env.example`.

3.  **Build and Run**:
    ```bash
    docker compose up --build -d
    ```

    This will start:
    -   API on port `4000`
    -   Worker (background process)
    -   Web Frontend on port `5173` (or configured port)
    -   Postgres, Redis, MinIO (if enabled in compose)

See [docs/docker-compose.md](docs/docker-compose.md) for more details.

## 3. Manual Deployment

### Database
1.  Set up a PostgreSQL instance.
2.  Run migrations from the `api` directory:
    ```bash
    cd api
    npm install
    npx prisma migrate deploy
    ```

### API Service
1.  Navigate to `api/`:
    ```bash
    cd api
    npm install
    npm run build
    npm run start:prod
    ```
2.  Ensure it can connect to Postgres and Redis.

### Worker Service
1.  Navigate to `worker/`:
    ```bash
    cd worker
    npm install
    npm run build
    npm run start:prod
    ```
2.  Ensure it uses the *same* database as the API.

### Web Frontend
1.  Navigate to `web/`:
    ```bash
    cd web
    npm install
    npm run build
    ```
2.  The `dist/` folder will contain the static assets.
3.  Deploy `dist/` to a static host (Vercel, Netlify, AWS S3+CloudFront, Nginx).
    -   **Note**: Ensure `VITE_API_URL` is set to your production API URL at build time.

## 4. Smart Contract Deployment

For deploying the smart contracts to a new chain or updating the contract:

1.  Refer to [docs/base44/DeploymentGuide.md](docs/base44/DeploymentGuide.md).
2.  After deployment, update the `CONTRACT_ADDRESS` in your backend and frontend environment variables.

## 5. Verification

1.  **API Health**: `GET /v1/health` should return `200 OK`.
2.  **Indexer Status**: `GET /v1/indexer/status` should show the current synced block height.
3.  **Frontend**: Log in via WalletConnect and ensure you can view the dashboard.
