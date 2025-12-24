# Trustfy V4.2

Monorepo powering the Trustfy P2P escrow experience (NestJS API, Prisma read models, Wagmi + React UI, and a dedicated indexer worker that mirrors on-chain events).

## Workspace layout

- `api` &mdash; NestJS backend hosting auth, RBAC, escrow/read APIs, evidence, disputes, admin tooling, and OpenAPI docs.
- `worker` &mdash; Viem-based indexer that streams `TrustfyEscrowV4_2` events to Postgres and keeps checkpoints in Redis/Bull.
- `web` &mdash; Vite + React + Wagmi frontend with role-aware pages (landing, dashboard, arbitrator queue, admin panels).
- `shared` &mdash; Shared types/enums (Escrow states, dispute outcomes, indexer status).

## Getting started

1. Copy the API example env: `cp api/.env.example .env`. Adjust RPC URLs, contract addresses, MinIO credentials, and notification webhook info.
2. Install dependencies: `npm install`.
3. Compile Prisma client: `cd api && npx prisma generate`.
4. Run services:
   - API: `npm run --workspace @trustfy/api start`
   - Worker: `npm run --workspace @trustfy/worker start`
   - Web: `npm run web:dev`

The UI connects to `http://localhost:4000` by default and the indexer worker streams events so `/v1/escrows` reflects on-chain state.

## Docker Compose

Use the provided `docker-compose.yml` to orchestrate the API, worker, web, Postgres, Redis, and MinIO. See [docs/docker-compose.md](docs/docker-compose.md) for details.

## Project Specifications & Documentation

Key documentation is organized into specific directories:

- **Product & User Guides**: [Amendments/](Amendments/) contains the PRD, User Guide, and UI/BE specifications.
- **System Wiring**: [Wiring/](Wiring/) contains instructions for backend indexer, UI wiring, and migration guides.
- **Web3 & Authentication**: [docs/base44/](docs/base44/) contains guides on the Hybrid Authentication Model, WalletConnect, and Smart Contract deployment.

## Technical Docs & Governance

- Canonical terms: [docs/canonical-language-map.md](docs/canonical-language-map.md)
- RBAC rules: [docs/rbac-matrix.md](docs/rbac-matrix.md)
- OpenAPI: [docs/openapi.md](docs/openapi.md) (Swagger UI served at `/v1/docs`)
- Prisma migrations: [docs/prisma-migrations.md](docs/prisma-migrations.md)
- BSC testnet validation runbook: [docs/bsc-testnet-validation.md](docs/bsc-testnet-validation.md)

## CI / conventions

The root GitHub workflow (`.github/workflows/ci.yml`) runs lint/build for the API, worker, and web packages so every change verifies the end-to-end stack and documentation surfaces remain in sync.

## Threat model

- **On-chain truth** – The indexer worker is the only source of escrow state; every transition is replayed from numbered events and stored in `escrow_timeline`. UI flows and APIs simply surface this derivation, so backend logic never “forces” a state change.
- **Non-custodial guarantees** – Users and arbitrators sign every transaction client-side (`useTxFlow` wrapper). The API only coordinates metadata, evidence, disputes, and notifications; no private keys or signing operations live on the server.
- **RBAC + auditability** – `RolesGuard`, allowlists, and `audit_logs` trace every privileged action (`admin:*`, `dispute:*`). Admin dashboards double-check job status and pool data before triggering on-chain writes.
- **Data integrity** – Evidence uploads rely on MinIO presigned URLs and sha256 checks; the backend verifies metadata and queues background jobs for optional validation. Payment instructions, messages, and fiat status records are rate-limited and length-limited via DTO validation.
- **Observability** – Helmet, rate limiting, and strict CORS plus `GET /v1/health` + `/v1/indexer/status` reveal the stack’s posture. Notifications jobs (webhooks/queues) flag delivery issues for manual review.
