I will verify and start all necessary services to ensure the full application stack is running.

### Plan: Start Full Stack Services

1.  **Web Server (Already Running)**
    *   Verify the existing `npm run preview` process in Terminal 5.
    *   URL: `http://localhost:4173/`

2.  **Start Backend API**
    *   Command: `npm run dev -w @trustfy/api` (or `npm start` if `dev` isn't the production command, but `dev` is usually safer for local testing. I will check the API package.json to be sure).
    *   Action: Launch in a new terminal.

3.  **Start Worker**
    *   Command: `npm run dev -w @trustfy/worker` (or `npm start`).
    *   Action: Launch in a new terminal.

4.  **Verification**
    *   Ensure all three terminals are running without errors.
    *   Confirm the Web App can connect to the API (implied by loading the dashboard or checking network requests).
