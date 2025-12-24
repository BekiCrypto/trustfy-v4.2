# Trustfy Web Frontend

The user interface for the Trustfy P2P Escrow platform. Built with React, Vite, and Wagmi, it provides a seamless experience for traders, arbitrators, and administrators.

## Features

-   **Wallet Connection**: Integration with WalletConnect v2 via Web3Modal.
-   **Smart Contract Interaction**: Direct signing of transactions using Viem/Wagmi.
-   **Real-time Updates**: React Query for efficient data fetching from the API.
-   **Role-Based UI**:
    -   **Traders**: Marketplace, My Trades, Profile.
    -   **Arbitrators**: Dispute Resolution Dashboard.
    -   **Admins**: Platform Configuration, User Management.

## Tech Stack

-   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Language**: TypeScript
-   **Web3**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/), [Web3Modal](https://web3modal.com/)
-   **State Management**: [TanStack Query](https://tanstack.com/query/latest)
-   **Styling**: CSS Modules / Tailwind (depending on components)

## Getting Started

### Prerequisites

-   Node.js (LTS)
-   API running locally (usually port 4000)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_URL="http://localhost:4000/v1"
VITE_WALLETCONNECT_PROJECT_ID="your_project_id"
VITE_RPC_URL="https://..."
```

### Running the App

```bash
# Development Server
npm run dev

# Build for Production
npm run build
```

## Project Structure

-   `src/components`: Reusable UI components.
    -   `web3`: Wallet connection and contract interaction logic.
    -   `trade`: Trade flow and escrow management.
    -   `admin`: Admin dashboards.
-   `src/pages`: Route components.
-   `src/hooks`: Custom React hooks (auth, contract interactions).
-   `src/api`: Axios client for backend API communication.

## Documentation

-   **Authentication**: See `docs/base44/AuthenticationModel.md` for details on the hybrid auth flow.
-   **Wiring**: See `Wiring/UI_Wiring_Instruction.md` for architectural details.
