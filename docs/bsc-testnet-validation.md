# BSC Testnet Validation Runbook

Use this checklist once you point the stack at `BSC testnet` RPCs and the deployed `TrustfyEscrowV4_2` contract. The goal is to prove every on-chain transition (create → take → fund → confirm → release, plus disputes + admin withdrawals) replays through the indexer, API, and UI without ever signing transactions from the backend.

## 1. Pre-flight
1. Copy the server example env and fill in the real RPC + contract values:
   ```sh
   cp env/ENV_SERVER.example .env.server
   ```
2. Set `RPC_URLS_BSC_TESTNET` to the provided testnet endpoints, `CONTRACT_ESCROW_BSC_TESTNET` to the deployed escrow, and the admin/arbitrator wallet lists (`ADMIN_WALLETS`, `ARBITRATOR_WALLETS`) to addresses you control for the walkthrough.
3. Verify MinIO / Redis / Postgres credentials align with your Compose or cloud env (`docker.env.example` or `api/.env.example`).

## 2. Starting the stack
1. Install deps and generate Prisma client:
   ```sh
   npm install
   cd api && npx prisma generate
   ```
2. Launch the stack (Compose or local):
   ```sh
   docker compose up -d postgres redis minio
   npm run --workspace @trustfy/api start &
   npm run --workspace @trustfy/worker start &
   npm run web:dev
   ```
3. Confirm health:
   - `GET http://localhost:4000/v1/health` → `{ status: "ok" }`
   - `GET http://localhost:4000/v1/indexer/status` → see `chainId`, `contractAddress`, `lastSyncedBlock`, `lagBlocks`
   - Swagger UI: `http://localhost:4000/v1/docs`

## 3. Primary escrow flow (seller → buyer)
1. Create an escrow from the UI (`/app/create`). Fill canonical fields (`TokenKey`, `Amount`, `SellerBond`, `BuyerBond`, `PaymentWindow`, `ReleaseWindow`) matching your testnet token metadata.
2. Watch the timeline and indexer banner:
   - `GET /v1/escrows/:escrowId` shows `state: CREATED`, `seller`, optional `buyer`.
   - `GET /v1/indexer/status` lag should drop as the worker ingests `EscrowCreated`.
3. Buyer takes the escrow using WalletConnect; UI should open the `Take Escrow` TxFlow modal and the timeline should append `EscrowTaken`.
4. Seller funds the escrow; timeline adds `EscrowFunded`, `Escrow.state` flips to `FUNDED`.
5. Buyer confirms payment; timeline adds `PaymentConfirmed` and UI enables `Release Escrow`.
6. Seller releases escrow; timeline ends with `EscrowResolved` and state `RESOLVED`. Verify `DisputeOutcome` mirrors `EscrowResolved` event (should be `NONE`).
7. Inspect Postgres tables: `escrow`, `escrow_timeline`, `dispute` to ensure on-chain data matches events (tools: `psql`, `pgcli`).

## 4. Dispute workflow (arbitrator)
1. From a funded escrow, trigger `Open Dispute` (buyer/seller button). The backend writes a `dispute` row and keeps `Escrow.state = DISPUTED`.
2. Use an arbitrator wallet (listed in `ARBITRATOR_WALLETS`) and open the Arbitrator Queue (`/arbitrator/disputes`). The detail page shows timeline, evidence list, and dispute summary.
3. Record a recommendation (optional) and then resolve via `resolveDispute` on-chain (wallet modal). Choose `BUYER_WINS` or `SELLER_WINS` and include a `ref` if desired.
4. After `EscrowResolved` event appears on-chain, verify:
   - Timeline contains `EscrowResolved`.
   - `escrow.state` is `RESOLVED`.
   - `dispute.outcome` matches enum (`BUYER_WINS` / `SELLER_WINS`).
   - Notifications queue logs the `dispute/resolved` event (check Redis `trustfy-notifications` queue if monitoring jobs are enabled).

## 5. Admin flows
1. Visit `/admin/pools` to read aggregated `feeAmount`, `sellerBond`, and `buyerBond` totals (derived from resolved escrows). Use `GET /v1/admin/pools` for API confirmation.
2. Submit an admin withdrawal form; the backend logs `admin:withdraw` without touching real funds (the wallet must still sign `withdrawPlatform` on-chain).
3. Manage role allowlists (`/admin/roles`) and token metadata (`/admin/tokens`). Each action writes audit logs (`audit_logs` table) and hits `/v1/admin/*` routes.

## 6. Observability & verification
- Tail the API logs for errors (`Auth`, `Indexer`, `Coordination`, `Dispute`). Each privileged endpoint increases `audit_logs`.
- Verify Redis queue activity for notifications via `bullmq` CLI or `redis-cli`.
- If notifications are enabled, ensure your webhook receives payloads (e.g., `escrow/message`, `dispute/open`, `dispute/resolved`).
- Confirm the worker honors reorg safety (logs `syncChain` with `reorgSafetyBlocks`) and re-scans if `lagBlocks` grows.

## 7. Post-validation checklist
1. Export key artifacts:
   - `GET /v1/escrows/:escrowId/timeline`
   - `GET /v1/disputes/:escrowId`
   - Run `npm run web:build` and capture screenshots of dashboards.
2. Reset any test data if needed (e.g., remove fake roles via `/v1/admin/roles` or drop testing rows before production migration).
3. Update `env/ENV_SERVER.example` (if necessary) with confirmed values for your deployment pipeline.
