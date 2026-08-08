# AutoOps — Autonomous Operational Task Assignment System

An autonomous decision engine that turns incoming civic or business issue reports into assigned operational tasks using AI-assisted classification plus a deterministic decision engine.

---

## 1. Project Title

**AutoOps — Autonomous Operational Task Assignment System**

One-line: Convert an incoming issue report into a routed, assigned task with explainable decision logs and a deterministic assignment engine.

---

## 2. Problem Statement

Municipal and operational teams receive large volumes of unstructured reports (citizen complaints, facility faults, safety hazards). Traditional workflows require humans to:

- read and understand free-text issue reports,
- classify the issue category and subcategory,
- determine priority level,
- map to the responsible department,
- identify the required skill set,
- find eligible employees,
- check availability and active workload,
- pick the appropriate assignee,
- create or update a task and track resolution.

Consequences of manual triage include slower response times, inconsistent routing, overloading specific staff, and operational bottlenecks. AutoOps aims to reduce those manual steps and provide explainable, auditable decision records.

---

## 3. Solution

AutoOps automates the operational decision and assignment pipeline by combining:

- an AI classification stage (Gemini via @google/genai when configured),
- a deterministic decision engine that maps departments, evaluates employee availability and capacity, and selects the least-loaded eligible employee,
- an atomic persistent JSON data store for demo/MVP state,
- role-based APIs for admins, employees, and public users.

High-level transformation:

Incoming Issue
  ↓
Understanding (AI / fallback)
  ↓
Decision (department, required skill, priority)
  ↓
Assignment (availability + workload)
  ↓
Execution (employee task lifecycle)
  ↓
Resolution (status change + workload update + decision log)

---

## 4. Why AutoOps Is Autonomous

AutoOps automates the following decisions (as implemented in the code):

Issue
 ↓
Classification (AI classifier or rule-based fallback)
 ↓
Department mapping (from classification)
 ↓
Availability & capacity filtering (employees in department)
 ↓
Workload comparison (choose least-active tasks)
 ↓
Employee selection (first eligible least-loaded employee)
 ↓
Task creation and assignment

What is automated in code:
- Parsing of incoming title/description/location into structured classification (AI or fallback).
- Mapping classification → department.
- Filtering employees by department, availability state (`AVAILABLE`), and capacity (active tasks < max_capacity).
- Selecting the least-busy eligible employee and creating a Task record automatically.
- Recording decision logs at each major step.

What still requires human intervention:
- Administrators can manually reassign an issue (admin override).
- Employees or admins update task status (IN_PROGRESS, RESOLVED, CLOSED).
- Citizens are unauthenticated by default and cannot modify task states.

---

## 5. Key Features (Verified in code)

- Autonomous issue intake and assignment pipeline (`/api/issues`).
- AI-driven classification using Gemini 3.6 Flash via `@google/genai` (when `GEMINI_API_KEY` is configured).
- Deterministic rule-based fallback classifier (keyword-based) when AI is unavailable.
- Department mapping and evaluated assignment matrix (department employees evaluated and returned).
- Availability checks and capacity enforcement (employee availability and `max_capacity`).
- Workload balancing by selecting the least-active eligible employee.
- Decision logging (detailed step logs persisted per issue).
- Admin manual override endpoint to reassign issues and tasks.
- Role-aware APIs (ADMIN, EMPLOYEE, CITIZEN) enforced in route handlers.
- In-memory rate limiter per-client IP for API endpoints.
- Simple persistent storage using a JSON file (`data/store.json`) with atomic writes (temp file + rename).
- Lightweight token-based authentication (HMAC-SHA256 signed token) with timing-safe verification.
- Dev-friendly frontend scaffold: React + Vite + Tailwind (components included).

(Each item above is implemented in `server.ts`, `src/server/*`, and `src/components/*`.)

---

## 6. Complete System Workflow

A concise flow (matches the actual implementation):

```mermaid
flowchart TD
  A[User Reports Issue] --> B[AI Classification (Gemini) / Fallback]
  B --> C[Department Mapping]
  C --> D[Evaluate Dept Employees]
  D --> E[Filter by Availability & Capacity]
  E --> F[Sort by Active Task Count (least busy)]
  F --> G[Select Best Employee]
  G --> H[Create Task & Increment Workload]
  H --> I[Employee Executes Task (status updates)]
  I --> J[Resolve / Close → Decrement Workload]
  H --> K[Decision Logs Persisted]
```

Notes:
- If Gemini is not configured or fails, the deterministic rule-based classifier runs (same flow downstream).
- If no eligible employees exist, the issue is left `UNASSIGNED` and a decision log is recorded.

---

## 7. AI + Deterministic Decision Engine

Separation of concerns implemented in the repository:

AI (`src/server/aiClassifier.ts`)
- Attempts to call Gemini 3.6 Flash via `@google/genai` when `GEMINI_API_KEY` is present.
- Request asks for a JSON-structured response including: category, subcategory, priority, department, required_skill, summary, reasoning, confidence.
- The AI result is validated and normalized before use.

Deterministic Engine (`src/server/decisionEngine.ts`)
- Receives the structured classification from AI (or fallback).
- Maps classification → department using seeded departments or fallback mapping.
- Evaluates department employees (skills are recorded in the evaluation output).
- Filters by availability (`AVAILABLE`) and capacity (active_task_count < max_capacity).
- Sorts eligible candidates by active_task_count ascending and selects the first (least busy).
- Creates a Task, increments employee workload, and writes decision logs.

Why this architecture:
- Predictability: Decisions after classification are deterministic and testable.
- Explainability: Decision logs and an assignment matrix are persisted so operators can review "why" a selection happened.
- Reliability: If the remote AI is unavailable, a local rule-based fallback keeps the pipeline operational.

Caveat (accurate to implementation):
- Although employee skill lists are included in the evaluation matrix, the selection logic implemented in `decisionEngine` filters by availability and capacity; it does not strictly enforce a skill match filter. The system records skills for transparency and explainability — this is visible in the assignment matrix returned from processing.

---

## 8. AI Fallback System

Implemented flow (`src/server/aiClassifier.ts`):

- If `GEMINI_API_KEY` is configured and the Gemini call succeeds, the structured JSON output is parsed and used.
- If the Gemini call fails (network, quota 429, exceptions) or `GEMINI_API_KEY` is not configured, the code falls back to `runFallbackRuleClassifier(...)` — a deterministic keyword-based classifier that returns category, subcategory, priority, required_skill, summary, reasoning, and confidence with `used_fallback=true`.

Failure scenarios handled in code:
- Missing/invalid `GEMINI_API_KEY`.
- Exceptions during Gemini API call.
- Quota (429) and other API errors as detected by thrown error handling.

---

## 9. Employee Assignment Algorithm (exact implementation)

Implemented steps (`src/server/decisionEngine.ts`):

1. Map AI department → seeded Department record (fallback to category mapping).
2. Gather department employees: `db.getEmployees()` filtered by `department_id`.
3. For each employee:
   - Mark as ineligible if `availability !== 'AVAILABLE'`.
   - Mark as ineligible if `active_task_count >= max_capacity`.
   - Record skills, availability, active task count and rejection reason in `evaluated_employees` matrix.
4. Build `eligibleCandidates` array for employees who passed availability & capacity tests.
5. Sort `eligibleCandidates` by `active_task_count` ascending (least active first).
6. Select first candidate as `selectedEmployee`.
7. If `selectedEmployee` exists:
   - Increment employee workload (`db.updateEmployeeWorkload(..., +1)`).
   - Create `Task` with status `ASSIGNED` and persist it.
   - Record an assignment decision log.
8. If no eligible candidate:
   - Issue is recorded with status `UNASSIGNED`.
   - Decision log notes assignment pending for department.

Example (reflects code behavior):
- Employee A (AVAILABLE, 2 tasks), Employee B (AVAILABLE, 5 tasks, max_capacity 5), Employee C (UNAVAILABLE)
- Eligible: A only (B at capacity, C unavailable) → Result: Employee A selected.

Tie-breaking:
- The implementation uses stable sort by `active_task_count` and picks the first — thus ties resolve by whichever employee appears first after sort (no additional deterministic randomization beyond sort position).

If nobody qualifies:
- Issue is left `UNASSIGNED`.
- Decision log entry added and `assignment_reason` set accordingly.

Admin override:
- Admin endpoint (`/api/issues/:id/reassign`) calls `adminReassignIssue` which decrements old employee workload (if any), increments new employee workload, updates/creates task, updates issue assignment fields, and logs an `ADMIN_OVERRIDE` decision.

---

## 10. Decision Logging

Decision logs are implemented and persisted (`src/server/database.ts` & `decisionEngine.ts`):

- Each major step (Issue Created, AI Analyzed, Department Resolution, Employee Selection, Task Assigned, Assignment Pending, Human Override, Status Updated) creates a `DecisionLog` object with:
  - `id`, `issue_id`, `timestamp`, `step_name`, `decision_type`, `decision`, `reason`, and optional `metadata`.
- Decision logs are written to the persistent store and are retrievable via `/api/logs` and included in the single-issue GET (`/api/issues/:id` → `decision_logs`).

Why it matters:
- Transparency and auditability of automated decisions.
- Easier debugging and operator review for overrides or policy changes.

---

## 11. Authentication & Security (accurate to implementation)

Auth implementation (`src/server/auth.ts` and `server.ts`):

- Token format: custom JWT-like token encoded as `base64url(header).base64url(payload).signature`
  - Header uses `alg: 'HS256'` and `typ: 'JWT'` when generated; signature is HMAC-SHA256 over the header.payload string using server secret.
  - The verify routine supports two signature conventions: either HMAC over `base64Payload` alone when a special header string `autoops_v1` is present, or HMAC over `header.payload` as generated.
- Secret management:
  - Uses environment variable `AUTOOPS_AUTH_SECRET` when provided.
  - If not provided, a runtime ephemeral 256-bit secret is generated for the process (crypto.randomBytes) — this means tokens will not survive process restart if no secret configured.
- Verification:
  - Uses `crypto.timingSafeEqual` for signature comparison (mitigates basic timing attacks).
  - Enforces `iat` (issued at) and `exp` (expiration) checks; tokens expire by default after 24 hours in `generateToken` (`expiresInSeconds` default = 86400).
- Role enforcement:
  - Routes check roles server-side (`ADMIN`, `EMPLOYEE`, `CITIZEN`) using `getAuthUser` which calls `verifyToken`.
  - Examples: reset/seed endpoints require `ADMIN`; employees may only modify their own availability or task status.
- Security headers:
  - `server.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` for responses.
- Rate limiting:
  - A simple in-memory per-IP rate limiter is implemented (`rateLimitMap`) for key endpoints.

Notes / Limitations:
- Tokens are HMAC-based and accepted as `Authorization` header or `x-auth-token`.
- If `AUTOOPS_AUTH_SECRET` is not set, tokens are ephemeral to the running process — suitable for demo but not for persistent authentication in a multi-process deployment.

---

## 12. User Roles (as implemented)

The code recognizes three roles (`src/types.ts` and `server.ts`):

- ADMIN
  - Can reseed/reset the database (`/api/seed`, `/api/reset`).
  - Can manually reassign issues (`/api/issues/:id/reassign`).
  - Can access all admin endpoints (server enforces role checks).
- EMPLOYEE
  - Can sign in and is associated with an employee record.
  - Can update their own task status (`/api/issues/:id/status`) only if assigned to them.
  - Can update their own availability (`/api/employees/:id`).
- CITIZEN
  - Public by default (no token required).
  - Can submit issues (`POST /api/issues`).
  - Can query public endpoints; when authenticated as a citizen, endpoint `/api/issues/:id` enforces viewing restrictions if `contact_info` is set to an email (prevents viewing other users' private issues).

All role checks are enforced server-side.

---

## 13. Persistence

Persistent store (`src/server/database.ts`):

- Data directory: `data/`
- Single JSON store file: `data/store.json`
- Seed data for departments, users, employees, issues, tasks and decision logs is created if no `store.json` exists or if `store.json` is empty.
- Atomic persistence:
  - Writes to a temp file `store.json.tmp` synchronously, then `renameSync` to `store.json`.
  - If rename fails (cross-device fallback), copy the temp file and unlink it.
- Data stored:
  - `departments`, `employees`, `issues`, `tasks`, `decisionLogs`, `users`, `updated_at`
- API operations call `db.*` methods which mutate in-memory arrays and call `persist()` to write to disk.

Notes:
- This storage model is suitable for single-node demo/MVP usage and preserves state across restarts (so long as the runtime has write access to `data/`).
- For horizontal scaling or multi-instance production, a shared persistent DB would be required.

---

## 14. Accessibility (what is present in UI code)

Frontend components include accessibility-minded attributes (checked in `Header.tsx` and other components):

- `aria-label` usage on interactive buttons (menu toggle, sign-out).
- Semantic elements (header).
- Focus and keyboard affordances implied by standard `button` elements (mobile drawer toggling uses proper buttons).
- Visible label text and small-screen alternatives are provided.

Caveat:
- There is no automated WCAG claim in the repository; the code includes several accessibility-friendly practices but a full accessibility audit is not present.

---

## 15. Testing

What the repo exposes (verified in `package.json`):

- `package.json` contains:
  - `"test": "tsx tests/auditTests.ts"`

Notes:
- The repository defines a test script to run `tests/auditTests.ts`, but the executed test files and total test count were not enumerated during verification. Run `npm test` locally to execute the test script and inspect `tests/` for exact test coverage and counts.

---

## 16. Technology Stack (from repository files)

Frontend
- React (`react`, `react-dom`)
- Vite (`vite` + `@vitejs/plugin-react`)
- Tailwind CSS (`tailwindcss`, `@tailwindcss/vite`)
- lucide-react (icons)

Backend
- Node.js + Express (`express`)
- TypeScript (`typescript`)
- tsx for dev runner (`tsx`)
- esbuild for server bundle (`esbuild`)
- `@google/genai` for Gemini integration (optional runtime dependency)

AI
- Primary: Gemini 3.6 Flash via `@google/genai` (when `GEMINI_API_KEY` configured)
- Fallback: built-in deterministic rule-based classifier

Authentication / Security
- HMAC-SHA256 token signing (`crypto`)
- Timing-safe signature comparison (`crypto.timingSafeEqual`)
- Security headers set in server responses
- In-memory rate limiter for APIs

Storage
- Local JSON persistence (`data/store.json`) with atomic write pattern

Testing / Dev
- test script runs `tsx tests/auditTests.ts` (see `package.json`)
- dev: `tsx server.ts` to run the app in development
- build: Vite build + esbuild bundling of `server.ts` to `dist/server.cjs`

---

## 17. Architecture

High-level architecture (matches code):

```
                ┌─────────────────┐
                │      User       │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐  (React + Vite frontend)
                │    Frontend     │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐  (Express API - server.ts)
                │   API / Server  │
                └────────┬────────┘
                         ↓
             ┌───────────────────────┐
             │   AI Classification   │ (Gemini or fallback)
             └───────────┬───────────┘
                         ↓
             ┌───────────────────────┐
             │   Deterministic Engine│ (skill/availability/capacity/workload)
             └───────────┬───────────┘
                         ↓
                ┌────────────────────┐
                │  Persistent Store  │ (data/store.json)
                └──────────┬─────────┘
                         ↓
               Employees / Tasks / Logs / Dashboard
```

---

## 18. Project Structure (verified files & folders)

Top-level (key files):

- server.ts                          — Express server, route handlers, rate limiter, security headers
- package.json                       — scripts and dependencies
- data/                              — runtime store directory (created at runtime)
- src/
  - components/                       — React UI components (Header.tsx, ScenarioSelector.tsx, DashboardView.tsx, IssueForm.tsx, etc.)
  - server/
    - aiClassifier.ts                 — Gemini integration + fallback rule classifier
    - database.ts                     — Persistent JSON store and seed data
    - decisionEngine.ts               — Core assignment logic and admin override
    - auth.ts                         — token generation/verification
  - types.ts                          — shared TypeScript types / interfaces
- tests/                              — (test script referenced; inspect repository for tests/auditTests.ts)
- dist/                               — build output produced by build script

Brief explanations:
- aiClassifier.ts — attempts Gemini classification and falls back to keyword rules.
- decisionEngine.ts — orchestrates classification → department → candidate evaluation → assignment → logging.
- database.ts — durable JSON-backed store with seed data and atomic writes.
- auth.ts — custom signed token generator & verifier with expiration & timing-safe comparison.

---

## 19. Installation

Clone and install:

```bash
git clone https://github.com/19-mohityadav/AutoOps.git
cd AutoOps
npm install
```

(Repository uses npm and package.json scripts shown below.)

---

## 20. Environment Variables

The code reads the following environment variables (must be set for production-like behavior):

- `AUTOOPS_AUTH_SECRET` — server HMAC secret used to sign tokens. If not set, the app generates an ephemeral in-memory 256-bit secret (suitable only for ephemeral/dev runs).
- `GEMINI_API_KEY` — API key for Google Gemini (`@google/genai`). If absent or invalid, the built-in fallback classifier is used.

Optional/Helpful (not strictly required by code but useful in .env for local runs)
- `NODE_ENV` — controls Vite middleware vs static serve behavior.

Sample .env (recommended for local development):

```env
AUTOOPS_AUTH_SECRET=replace-with-a-strong-secret
GEMINI_API_KEY=replace-with-your-gemini-api-key
NODE_ENV=development
```

Note: The server does not call dotenv explicitly in server.ts; environment variables are read via process.env. You may add dotenv usage in your environment or set variables externally.

---

## 21. Running the Project

Development

```bash
# start dev server (uses tsx to run server.ts with Vite middleware)
npm run dev
# server listens on port 3000 (http://0.0.0.0:3000)
```

Build & run production bundle

```bash
npm run build
npm run start
```

Other useful scripts from package.json:

- `npm run lint`  (runs TypeScript compiler with --noEmit)
- `npm run preview` (Vite preview)
- `npm test` (runs tsx tests/auditTests.ts — inspect tests/ to see what runs)

---

## 22. Demo Accounts (configured behavior in server.ts & seed)

The code seeds demo users/employees and also contains deterministic login mapping for common demo emails. Verified demo credentials/emails (no passwords required — login endpoint accepts any password and maps by email):

- Admin: `admin@civicops.gov` (role ADMIN)
- Employees:
  - `aman.v@civicops.gov` → Aman Verma (emp-aman)
  - `priya.p@civicops.gov` → Priya Patel (emp-priya)
  - `deepak.g@civicops.gov` → Deepak Gupta (emp-deepak)
  - `rahul.k@civicops.gov` → Rahul Kumar (emp-rahul)
- Citizen: `john@example.com` (seeded user)

Note: Login implementation in server.ts accepts an email and returns a signed token; password is validated only for length on register, not used to check existing demo mapping. Treat these as demo/test accounts only.

---

## 23. Example Use Case (end-to-end, matches implemented flows)

1. Citizen submits:
   - Title: "There is a huge pothole near the school entrance and vehicles are having difficulty passing."
   - Description & Location

2. Server (`/api/issues`) triggers `processAndAssignIssue`:
   - `classifyIssue(...)` calls Gemini (if `GEMINI_API_KEY` present) or `runFallbackRuleClassifier(...)`.
   - Decision engine maps department to "Road Maintenance".
   - Evaluates employees in Road Maintenance: filters `AVAILABLE` & capacity; sorts by `active_task_count`.
   - Picks Aman Verma (`emp-aman`) if he is the least-busy AVAILABLE employee.
   - Creates Task (status `ASSIGNED`), increments Aman’s `active_task_count`, persists Issue/Task.
   - Writes decision logs (Issue Created, AI Analyzed, Department Resolution, Employee Selection, Task Assigned).

3. Employee receives task in UI, updates status to `IN_PROGRESS` → `RESOLVED`, which triggers workload decrement and additional decision logs.

---

## 24. Design Decisions (as seen in code)

- AI + deterministic logic: AI provides natural-language understanding; deterministic rules control operational routing and selection for predictability and safety.
- Fallback classifier: ensures the pipeline continues when external AI is unavailable (quota, network, misconfiguration).
- Server-side authorization: tokens and role checks are enforced server-side for endpoints modifying state.
- Persistent JSON for MVP: quick, file-backed persistence with atomic writes makes local demos reliable without a DB dependency.
- Workload-based assignment: choosing the least-busy eligible employee is a simple, transparent heuristic that reduces overload.

All above are supported in code and clearly visible in the implementation.

---

## 25. Security Considerations (verified)

- HMAC-SHA256 token signing and verification with timing-safe signature comparison.
- Token expiration checks (iat/exp).
- Role-based route checks (ADMIN-only endpoints enforced).
- Input validation and sanitization for issue submission (title, description, location length limits).
- Security response headers set in server responses.
- In-memory rate limiting per IP for endpoints to mitigate abusive request patterns.
- If no `AUTOOPS_AUTH_SECRET` is configured, the server generates an ephemeral secret for runtime only (developer note: set `AUTOOPS_AUTH_SECRET` for multi-process persistence).

---

## 26. Limitations (honest and accurate)

- Persistence is single-node JSON file (`data/store.json`) — not suitable for multi-instance horizontal scaling without moving to a shared DB.
- AI dependency on Gemini: classification quality and availability depend on the external API and quota; fallback is keyword-based and less semantically rich.
- Skill matching is captured in the evaluation matrix but the current assignment code does not strictly enforce required_skill matching (selection is based on availability and workload).
- Rate limiting is a simple in-memory map — for production use a distributed rate limiter is required.
- No centralized secret management (`AUTOOPS_AUTH_SECRET` must be set in environment or ephemeral secret used).
- No built-in notification system (e-mail / SMS / push) in the current code.

---

## 27. Future Improvements (recommended, not implemented)

- Move to PostgreSQL/Cloud SQL or another shared DB for multi-instance deployments.
- Enforce skill matching as a hard constraint when selecting candidates, or provide configurable routing policies.
- Add notification/alerting for assigned employees.
- Integrate a job queue for long-running tasks or external system integrations.
- Use centralized secrets manager and rotate `AUTOOPS_AUTH_SECRET` for production.
- Integrate observability (metrics, traces) and a robust rate-limiting gateway.
- Add end-to-end tests and CI/CD pipeline for integration testing.

---

## 28. What Makes AutoOps Different

AutoOps is not a chatbot front-end — it is an operational automation engine that pairs AI-based natural-language understanding with deterministic, explainable decision logic to automatically route and assign tasks. Its key differentiator is the blend of AI for understanding and a traceable deterministic engine for safe, auditable assignments.

---

## 29. Project Impact

AutoOps (as implemented) offers:
- Reduced manual triage by automating classification and assignment steps.
- More consistent routing and auditable assignment decisions via decision logs.
- Continued operation without AI API access thanks to the deterministic fallback.
- A transparent assignment matrix and simple workload balancing heuristic to prevent overloading staff.

---

## 30. Final Summary

AutoOps transforms operational requests into actionable tasks by combining AI-based issue understanding (Gemini when available) with a deterministic decision engine that enforces availability and capacity, creates tasks, and persists explainable decision logs. The repository contains a working demo-level server, a React frontend scaffold, local persistent storage, role-aware APIs, and an admin override path — all designed to demonstrate how autonomous operational assignment can be built in a predictable and auditable way.

---

Appendix — Quick API Reference (most relevant endpoints implemented in server.ts)

- GET /api/health
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me
- POST /api/auth/logout
- POST /api/seed
- POST /api/reset
- GET /api/stats
- GET /api/dashboard/stats
- GET /api/tasks
- GET /api/logs
- POST /api/issues
- POST /api/test-scenarios/:scenarioId
- POST /api/scenarios/run
- GET /api/issues
- GET /api/issues/:id
- POST /api/issues/:id/reassign
- PATCH /api/issues/:id/status
- GET /api/employees
- PATCH /api/employees/:id
- PATCH /api/employees/:id/availability
- GET /api/departments

(See server.ts for request/response details and role protections.)

---

If you want, I can:
- produce a compact README file ready to paste into the repository root (formatted and tuned),
- or generate example curl commands for the primary flows (issue creation, admin reassign, status update, run demo scenario).
