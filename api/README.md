# Trustfy API

The backend API for the Trustfy P2P Escrow platform. Built with [NestJS](https://nestjs.com/), it handles off-chain coordination, authentication, and serves read-models derived from blockchain data.

## Features

-   **Hybrid Authentication**: Supports both OAuth2 (Google, Facebook) and Web3 (WalletConnect) login flows.
-   **Role-Based Access Control (RBAC)**: Fine-grained permissions for Users, Arbitrators, and Admins.
-   **Off-Chain Coordination**: Handles chat messages, encrypted payment instructions, and evidence uploads.
-   **Read Models**: Serves fast, queryable data (Escrows, Ads, Disputes) indexed from the blockchain by the `worker`.
-   **Storage**: Integrates with MinIO/S3 for evidence storage.

## Architecture

-   **Framework**: NestJS (TypeScript)
-   **Database**: PostgreSQL (accessed via Prisma ORM)
-   **API Style**: RESTful
-   **Documentation**: OpenAPI (Swagger)

## Modules

-   `auth`: Hybrid authentication logic (JWT, Web3 signatures).
-   `admin`: Admin dashboards and configuration.
-   `coordination`: Chat and payment instruction exchange.
-   `dispute`: Dispute management and evidence submission.
-   `escrow-read`: Read-only endpoints for escrow state.
-   `evidence`: Presigned URLs for file uploads.
-   `indexer`: Status endpoints for the indexer worker.
-   `notifications`: Email/Webhook notification preferences.
-   `rbac`: Guards and decorators for permission checking.

## Getting Started

### Prerequisites

-   Node.js (LTS)
-   PostgreSQL
-   Redis (for queues/caching)
-   MinIO/S3 (for file storage)

### Installation

```bash
npm install
```

### Configuration

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Update the `.env` file with your database credentials, RPC URLs, and API keys.

### Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

### Running the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### API Documentation

Once the server is running (default port 4000), access the Swagger UI at:

```
http://localhost:4000/v1/docs
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
