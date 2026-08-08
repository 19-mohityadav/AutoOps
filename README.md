# Autonomous Task Assignment & Decision System

An intelligent, autonomous operational decision engine that receives civic and business issue reports, understands and classifies them with AI (Gemini 3.6 Flash + fallback classifier), evaluates urgency and constraints, and automatically assigns work to the optimal department employee without requiring human intervention.

---

## 🌟 Key Features

1. **Autonomous End-to-End Workflow**
   - **User Submits Issue** → **AI Understanding** → **Deterministic Decision Engine** → **Automatic Employee Assignment** → **Employee Task Queue**.
   - Eliminates manual administrative triage and dispatch bottlenecks.

2. **Intelligent AI Issue Understanding & Fallback Protection**
   - Powered by **Gemini 3.6 Flash** server-side via `@google/genai`.
   - Extracts category (`Road`, `Electricity`, `Water`, `Garbage`, `Public Safety`, `Maintenance`, `IT`), priority (`Critical`, `High`, `Medium`, `Low`), department, required skill, short summary, and step-by-step reasoning.
   - Built-in **deterministic keyword fallback engine** ensures system operation even if AI API keys are offline or timing out.

3. **Deterministic Decision Engine & Workload Balancing**
   - Evaluates urgency triggers (e.g., public safety hazards, school/hospital proximity, traffic blockages).
   - Filters eligible department personnel by skill and availability (`AVAILABLE`).
   - Automatically selects the employee with the lowest active task workload (e.g. preferring an employee with 1 task over one with 4 tasks).
   - Handles constraint edge-cases (marks task `UNASSIGNED` with clear explanation if no eligible staff are available).

4. **Explainable Decision Panel & Microstep Timeline**
   - Step-by-step millisecond timeline showing exact system execution sequence.
   - "Why was this assigned?" panel detailing AI classification scores, priority signals, and employee comparison matrix.

5. **Human Override Exception Handler**
   - Allows administrators to override assignments, reassign personnel, or modify priorities when operational exceptions arise.

6. **Role-Based Workflow Support**
   - **Citizen / Public User**: Submit issue form with 1-click test scenario presets.
   - **Employee**: Dedicated "My Tasks" queue to accept tasks, track progress, and submit site resolution notes.
   - **Admin / Operator**: Comprehensive Operations Dashboard, live decision activity stream, and staff availability manager.

---

## 🚀 Pre-Configured Demo Test Scenarios

The system includes 1-click scenario triggers at the top of the app:

* **Scenario 1 (Road Pothole)**:
  * *Input*: "There is a huge pothole near the school entrance and vehicles are having difficulty passing."
  * *Autonomous Result*: Category = `Road`, Priority = `High`, Department = `Road Maintenance`, Assigned To = `Aman Verma` (selected over Rahul Kumar who has 4 active tasks).
* **Scenario 2 (Street Light Outage)**:
  * *Input*: "The street light outside Building A has stopped working for three days."
  * *Autonomous Result*: Category = `Electricity`, Priority = `Medium`, Department = `Electrical`, Assigned To = `Priya Patel`.
* **Scenario 3 (Garbage Overflow)**:
  * *Input*: "Garbage has not been collected for four days."
  * *Autonomous Result*: Category = `Garbage`, Priority = `Medium`, Department = `Sanitation`, Assigned To = `Deepak Gupta`.
* **Scenario 4 (Overloaded / Unavailable Team)**:
  * *Input*: "Urgent public security threat at North Gate."
  * *Autonomous Result*: Status = `UNASSIGNED`. Reason: "No available employee with the required skill in Public Safety department." Demonstrates real constraint evaluation!

---

## 📁 Project Architecture

```text
/
├── server.ts                  # Express backend entry point & Vite middleware integration
├── src/
│   ├── types.ts               # Core TypeScript interfaces & Enums
│   ├── server/
│   │   ├── aiClassifier.ts     # Gemini 3.6 Flash AI + Fallback Rule Engine
│   │   ├── database.ts         # In-memory store & seed generator
│   │   └── decisionEngine.ts   # Decision Engine, Assignment Logic & Timeline Generator
│   ├── components/
│   │   ├── Header.tsx           # Navigation & Role Switcher
│   │   ├── ScenarioSelector.tsx # 1-click Demo Scenario execution bar
│   │   ├── DashboardView.tsx    # Operational Control Dashboard & KPIs
│   │   ├── IssueForm.tsx        # Request Intake Form
│   │   ├── IssuesListView.tsx   # Filterable Issue & Task Registry
│   │   ├── IssueDetailModal.tsx # Explainable Decision Panel & Timeline
│   │   ├── MyTasksView.tsx      # Assigned Employee Queue
│   │   └── TeamWorkloadView.tsx # Staff Availability & Workload Gauges
│   ├── App.tsx                # Main Application Container
│   ├── main.tsx               # Client React Mounting Point
│   └── index.css              # Global Tailwind CSS Styles
├── package.json               # Dependencies & Build Scripts
└── metadata.json              # App Metadata & Capabilities
```

---

## 🛠️ API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and server status |
| `/api/seed` | `POST` | Reset database to initial seed state |
| `/api/dashboard/stats` | `GET` | Summary KPI metrics & department workloads |
| `/api/issues` | `POST` | Intake issue & trigger autonomous assignment pipeline |
| `/api/issues` | `GET` | Filter issues by category, priority, department, status, search |
| `/api/issues/:id` | `GET` | Retrieve issue details, task, and decision timeline logs |
| `/api/issues/:id/reassign` | `POST` | Admin manual override reassignment |
| `/api/issues/:id/status` | `PATCH` | Update task status (e.g. IN_PROGRESS, RESOLVED) |
| `/api/employees` | `GET` | List employees and active task counts |
| `/api/employees/:id` | `PATCH` | Toggle employee availability (`AVAILABLE` / `UNAVAILABLE`) |
| `/api/test-scenarios/:id` | `POST` | Execute pre-configured demo test scenarios (1, 2, 3, 4) |

---

## 🔐 Environment Variables

```env
AUTOOPS_AUTH_SECRET="replace-with-a-long-random-secret"
GEMINI_API_KEY="replace-with-your-gemini-api-key"
APP_URL="https://example.com"
```

---

## 📜 License

Apache 2.0
