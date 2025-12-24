# Trustfy Indexer Worker

A dedicated background worker service that listens to `TrustfyEscrow` smart contract events and indexes them into the PostgreSQL database. This ensures the API and UI have access to the latest on-chain state without querying the blockchain for every request.

## Architecture

-   **Technology**: Node.js + Viem (TypeScript)
-   **Source of Truth**: The Blockchain (Smart Contract Events).
-   **Destination**: PostgreSQL Database (same DB as the API).
-   **Resilience**: Handles chain reorgs (up to configured depth) and restarts.

## Indexed Events

The worker listens for and indexes the following events:

-   **Ads**: `AdCreated`, `AdEdited`, `AdCancelled`, `AdTaken`, `AdCompleted`
-   **Escrows**: `EscrowTaken`, `EscrowFunded`, `PaymentConfirmed`, `EscrowReleased`, `EscrowCancelled`
-   **Disputes**: `DisputeOpened`, `DisputeResolved`
-   **Credits**: `CreditAdded`, `CreditWithdrawn`

## Derived State

The worker populates several read-model tables in the database:
-   `Ads`: Current state of all advertisements.
-   `Escrows`: Current status and timeline of all trades.
-   `Disputes`: Active and resolved disputes.
-   `CreditLedger`: User bond credit history.

## Getting Started

### Prerequisites

-   Node.js (LTS)
-   PostgreSQL (Schema managed by the `api` package via Prisma)
-   RPC Endpoint (BSC Testnet/Mainnet)

### Installation

```bash
npm install
```

### Configuration

The worker shares the `.env` configuration with the API, or uses its own. Ensure `DATABASE_URL` and `RPC_URL` are set.

```bash
# Example .env variables required
DATABASE_URL="postgresql://..."
RPC_URL="https://bsc-dataseed..."
CONTRACT_ADDRESS="0x..."
START_BLOCK="0"
```

### Running the Worker

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Reorg Handling

The indexer stores the `blockNumber` and `blockHash` of processed blocks. On every new block, it checks if the parent hash matches the local history. If a mismatch is detected (reorg), it rewinds the database state to the common ancestor block and re-indexes.
