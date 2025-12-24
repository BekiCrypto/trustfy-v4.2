# Trustfy System Architecture

## High-Level Overview

Trustfy is a Peer-to-Peer (P2P) escrow platform designed to facilitate secure transactions using cryptocurrency. It employs a hybrid architecture combining a centralized backend for coordination and a decentralized blockchain layer for value transfer and settlement.

## Core Components

### 1. Web Frontend (`web`)
-   **Framework**: React + Vite
-   **State Management**: React Query (TanStack Query)
-   **Web3 Integration**: Wagmi + Viem + WalletConnect v2 + Web3Modal
-   **Role**: Provides the user interface for Traders, Arbitrators, and Admins. Handles wallet connections, transaction signing, and interacts with the API for off-chain data.

### 2. Backend API (`api`)
-   **Framework**: NestJS
-   **Database**: PostgreSQL (via Prisma ORM)
-   **Role**:
    -   Manages off-chain data: User profiles, trade metadata, chat messages, dispute evidence.
    -   Handles Authentication (Hybrid Web2/Web3).
    -   Implements Role-Based Access Control (RBAC).
    -   Provides APIs for the frontend.
    -   **Important**: Does NOT hold private keys. It coordinates but does not sign transactions.

### 3. Indexer Worker (`worker`)
-   **Technology**: Viem-based listener
-   **Role**:
    -   Listens to events from the `TrustfyEscrow` smart contract on the blockchain.
    -   Updates the local database to reflect on-chain state (e.g., Escrow Created, Funded, Released).
    -   Ensures the UI and API have an up-to-date view of the blockchain state without querying the chain for every request.

### 4. Smart Contracts (`shared` / Blockchain)
-   **Language**: Solidity
-   **Role**:
    -   Holds funds in escrow.
    -   Enforces logic for release, refund, and dispute resolution.
    -   The "Source of Truth" for asset ownership and transfer.

## Data Flow & Synchronization

1.  **User Action**: A user interacts with the UI (e.g., "Create Trade").
2.  **API Interaction**: The UI sends metadata to the API.
3.  **Blockchain Transaction**: If funds are involved, the UI prompts the user to sign a transaction via their wallet.
4.  **On-Chain Event**: The smart contract executes the transaction and emits an event.
5.  **Indexing**: The `worker` detects the event.
6.  **State Update**: The `worker` updates the PostgreSQL database.
7.  **UI Refresh**: The UI (via polling or sockets) reflects the new state based on API data.

## Authentication Model

Trustfy uses a **Hybrid Authentication Model**:
-   **Web2**: Users can login via Google, Facebook, or Email for read-only access or initial setup.
-   **Web3**: A Web3 Wallet (e.g., MetaMask) is **required** for any transaction involving funds.
-   **Linkage**: Web2 accounts can be linked to Web3 wallets, allowing a unified identity.

See [docs/base44/AuthenticationModel.md](docs/base44/AuthenticationModel.md) for details.

## Threat Model

-   **Non-Custodial**: The platform never holds user funds or private keys.
-   **Client-Side Signing**: All value transfers are signed by the user's wallet in the browser.
-   **Verification**: The backend verifies signatures and metadata but relies on the blockchain for settlement status.
