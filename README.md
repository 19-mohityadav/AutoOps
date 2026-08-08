# AutoOps — Autonomous Civic Issue Intake & Assignment System

AutoOps is a demo autonomous decision system that ingests civic issue reports (potholes, water leaks, broken street lights, garbage overflow, public-safety threats), classifies them with AI and heuristics, routes them to the appropriate municipal department, and automatically assigns qualified field employees while exposing an admin React UI and decision explainability logs.

## What problem this solves
City operations receive high volumes of unstructured public reports. Manual triage and assignment is slow, inconsistent, and leads to uneven workloads and delayed response. AutoOps automates classification, routing and assignment so incidents are handled faster and more predictably, and operators can review and override decisions.

## Highlights / Features
- REST API for issue intake, admin actions and dashboards
- AI-assisted classification and priority scoring (aiClassifier + decisionEngine)
- Automatic employee selection considering skills, availability and workload
- Decision logs for explainability and auditability
- Local JSON persistence (data/store.json) with safe atomic writes for demo use
- React + Vite single-page UI for citizens, employees and admins
- Demo scenarios, seeding and simple token-based auth for role-based access

## Stack
- Language: TypeScript (server and client)
- Server: Node + Express
- Frontend: React + Vite
- Persistence: Local JSON file (data/store.json) via src/server/database.ts
- Notable libs: vite, react, express, esbuild, tsx

## Repository layout
```
.env.example                # example env variables
index.html                  # production app shell
package.json                # scripts + dependencies
server.ts                   # main Express server (routes, middleware)
vite.config.ts              # Vite configuration
data/                       # runtime data directory (store.json created here)
src/
  App.tsx                   # React app root
  main.tsx                  # React entry
  components/               # UI components
  types.ts                  # shared types used by server & client
  server/
    auth.ts                 # token helpers
    aiClassifier.ts         # AI classification helpers
    decisionEngine.ts       # routing & assignment decision logic
    database.ts             # JSON-backed persistent DB and seeding
tests/                      # minimal test script(s)
```

## How it fits together
The React SPA calls the Express REST API. server.ts orchestrates requests and delegates classification and assignment to decisionEngine.ts which uses aiClassifier.ts and updates the persistent JSON store via database.ts. Decision steps are recorded to decision logs for explainability. In development, Vite runs as middleware; in production the server serves the built static files.

## Quick start (local development)
Prerequisites: Node 18+ and npm

Install dependencies:

```bash
npm install
```

Run in development (Vite middleware + server via tsx):

```bash
npm run dev
# open http://localhost:3000
```

Build and run for production:

```bash
npm run build
npm start
```

Environment variables (see .env.example):
- AUTOOPS_AUTH_SECRET — token signing secret (required for secure production usage)
- NODE_ENV — development or production

Note: If AUTOOPS_AUTH_SECRET is not set the server will generate an ephemeral signing key and log a warning. That is insecure for production.

## API overview (selected endpoints)
Authentication
- POST /api/auth/login — Body: { email, password } → { token, user }
- POST /api/auth/register — register demo user
- GET /api/auth/me — validate token

Issues & Tasks
- POST /api/issues — create an issue (triggers classification & automated assignment)
  - Body: { title, description, location, contact_info?, image_url? }
- GET /api/issues — list (supports filters: category, priority, department, status, search, assignee)
- GET /api/issues/:id — returns { issue, task, decision_logs }
- POST /api/issues/:id/reassign — Admin-only manual reassignment
- PATCH /api/issues/:id/status — update status (EMPLOYEE/ADMIN guards)

Admin & Demo
- POST /api/seed — reseed demo state (ADMIN-only)
- POST /api/reset — reseed demo state (ADMIN-only)
- POST /api/scenarios/run — run preconfigured demo scenario (1-4)

Dashboard
- GET /api/stats or /api/dashboard/stats

Decision logs
- GET /api/logs

Rate limiting: several endpoints use a simple in-memory rate limiter (per-IP) implemented in server.ts. Example limits: login/register (10/min), create issue (20/min).

## Data model (summary)
- Department: { id, name, category, description }
- Employee: { id, user_id, name, email, department_id, department_name, skills[], availability, active_task_count, max_capacity }
- Issue: { id, title, description, location, contact_info, category, subcategory, priority, status, department_id, assigned_employee_id, created_at, updated_at, ai_used, classification_reason, assignment_reason }
- Task: { id, issue_id, assigned_employee_id, assigned_employee_name, assigned_at, status }
- DecisionLog: { id, issue_id, timestamp, step_name, decision_type, decision, reason }

The demo database is created by src/server/database.ts and persisted to data/store.json. The seeding includes departments, employees, sample issues/tasks and decision logs.

## Example usage
Create an issue (anonymous):

```bash
curl -X POST http://localhost:3000/api/issues \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Pothole near school",
    "description":"Large pothole causing issues near school gate",
    "location":"St. Jude School Gate 1",
    "contact_info":"parent@example.com"
  }'
```

Login as admin (demo mapping: email with 'admin'):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@civicops.gov","password":"demo"}'
```

Reseed DB (use ADMIN token from login response):

```bash
curl -X POST http://localhost:3000/api/reset \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Testing
A sample test script exists at tests/auditTests.ts. The npm `test` script runs `tsx tests/auditTests.ts`.

## Production considerations & suggested improvements
- Replace the JSON file store with a proper database (Postgres/SQLite) for concurrency and persistence.
- Use a robust auth system (password hashing, refresh tokens, proper user management) and rotate secrets securely.
- Replace in-memory rate limiter with a distributed store (Redis) for multi-instance deployments.
- Add request validation (zod/Joi), unit tests, integration tests, and E2E tests for UI.
- Add observability: structured logging, request traces, metrics and health checks (liveness & readiness).
- Harden security headers and CORS, enable TLS termination, and ensure secrets are stored securely.

## Contributing
- Fork the repo, make changes in a feature branch, and open a PR.
- Add tests for server-side logic (decisionEngine and aiClassifier) and UI flows.

