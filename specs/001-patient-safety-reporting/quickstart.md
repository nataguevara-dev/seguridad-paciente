# Quickstart: Patient Safety Reporting

## Prerequisites

- Install Bun from https://bun.sh
- Install Angular CLI if needed for frontend scaffolding (`npm install -g @angular/cli`) or use the local Angular CLI from the project

## Setup

1. Open the repository root.
2. Install dependencies with Bun:

```bash
bun install
```

3. Open a terminal in the backend folder and run the backend server:

```bash
cd backend
bun run dev
```

4. Open a terminal in the frontend folder and run the Angular app:

```bash
cd frontend
bun run start
```

## Development notes

- The backend uses Better-SQLite3 in-memory persistence. Data is reset when the server restarts.
- The supervisor notification target is configured by a prototype `supervisorEmail` setting.
- The patient safety event form follows the Figma wireframe and DESIGN.md styling tokens.

## Testing

- Backend tests:

```bash
cd backend
bun test
```

- Frontend unit tests:

```bash
cd frontend
bun test
```

## Expected workflow

1. Register or sign in with email and password.
2. Open the dashboard and navigate to "Registrar evento de seguridad".
3. Complete the patient event form and submit.
4. Confirm the event is stored, a supervisor notification is triggered, and the app returns to the dashboard.
