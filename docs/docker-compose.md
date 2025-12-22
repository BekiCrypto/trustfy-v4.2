# Docker Compose / Local Stack

The repository provides `docker-compose.yml` at the root that wires the full stack (API, worker, web, PostgreSQL, Redis, MinIO). Key services:

- **postgres**: Trustfy schema storage (`trustfy` database). Environment is pulled from `.env`.
- **redis**: BullMQ queueing and rate limiting backing store.
- **minio**: Object store for evidence uploads mirroring the S3-compatible API used in production.
- **api**: NestJS backend (builds from `api/Dockerfile`), exposing `/v1/*`, `/v1/docs`, and `/v1/indexer/status`.
- **worker**: Indexer service that hydrates `Escrow` read models by tailing `TrustfyEscrowV4_2` events.
- **web**: Vite frontend served on port `5173` for local UX.

Run the stack with:

```
npm install
cp api/.env.example .env
docker compose up --build
```

Use the copy of `.env` to configure RPC URLs, contract addresses, MinIO credentials, and notification webhooks before starting the stack. The Compose file also ensures the worker and API share the same environment variables.
