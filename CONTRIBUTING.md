# Contributing to Trustfy

Thank you for your interest in contributing to Trustfy! This document provides guidelines and instructions for contributing to the project.

## Codebase Overview

Trustfy is a monorepo managed with npm workspaces, containing the following main packages:

-   **api**: NestJS backend application.
-   **web**: Vite + React frontend application.
-   **worker**: Background worker for blockchain indexing.
-   **shared**: Shared types and utilities.

## Getting Started

1.  **Prerequisites**: Ensure you have Node.js (LTS version recommended) and npm installed.
2.  **Setup**: Follow the "Getting started" instructions in the root [README.md](README.md).
3.  **Environment Variables**:
    -   Copy `.env.example` to `.env` in the root and/or specific package directories (`api`, `web`) as needed.
    -   Configure the necessary environment variables for your local setup.

## Development Workflow

1.  **Branching**: Create a new branch for your feature or bugfix. Use descriptive names (e.g., `feature/add-new-auth-provider`, `fix/escrow-calculation`).
2.  **Commits**: Use clear and concise commit messages. We encourage semantic commit messages (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
3.  **Linting & Formatting**:
    -   Ensure your code adheres to the project's linting rules.
    -   Run `npm run lint` (if available in the package) to check for issues.
4.  **Testing**:
    -   Write unit tests for new logic.
    -   Run existing tests to ensure no regressions.
    -   `npm test` usually runs tests in the respective packages.
5.  **Language**:
    -   **English Only**: The entire codebase, including comments, documentation, and UI text, must be in English.
    -   Do not introduce any internationalization (i18n) libraries or translation layers.
    -   All variable names and commit messages should be in English.

## Directory Structure & Documentation

-   **Amendments/**: Contains Product Requirement Documents (PRD) and User Guides. Consult these for feature specifications.
-   **Wiring/**: Contains technical instructions for backend and UI integration.
-   **docs/**: Contains technical documentation, including API specs, RBAC rules, and deployment guides.

## Pull Requests

1.  Push your branch to the repository.
2.  Open a Pull Request (PR) against the `main` (or `master`) branch.
3.  Provide a clear description of your changes, referencing any related issues.
4.  Wait for code review and address any feedback.

## Reporting Issues

If you encounter any bugs or have feature requests, please open an issue in the issue tracker with detailed steps to reproduce or a clear description of the feature.

Thank you for helping improve Trustfy!
