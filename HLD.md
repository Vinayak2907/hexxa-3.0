# High-Level Design (HLD) — Hexa Architecture

## System Architecture Overview
**Hexa** is designed around a modern, decoupled **Three-Tier Architecture**:

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 Presentation Tier: React 18 SPA                        │
  │  - React Router v6 Client-Side Routing                                 │
  │  - AuthProvider Context (user, token, isAuthenticated)                 │
  │  - ProtectedRoute Guard & Dynamic Navbar Feedback                      │
  │  - Controlled Form State (TaskForm useState)                           │
  │  - Reusable Component Hierarchy (Layout, PageContainer, EmptyState)    │
  │  - Executable CS Demos (EventLoopDemo, HoistingDemo, PromisesDemo)     │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ HTTP REST / JSON (Async Fetch Layer)
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 Application Tier: Express REST API Backend             │
  │  - REST Controllers & Repositories (auth, project, task)               │
  │  - Bcrypt Password Hashing & JWT Token Issuance                        │
  │  - Semantic HTTP Status Mapping (200, 201, 204, 400, 401, 404, 500)    │
  │  - Fail-Fast Environment Validation (env.js)                           │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ SQL via Pg Connection Pool
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 Data Tier: PostgreSQL Relational Database              │
  │  - Normalized Entity Schema (users, projects, tasks)                  │
  │  - Primary Keys & Foreign Keys (CASCADE / SET NULL Delete Behavior)    │
  │  - Performance B-Tree Indexing Strategy (idx_tasks_project_id, etc.)   │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture & System Layers

### 1. Presentation Tier (Frontend - React SPA)
- **Routing & Route Guards**: [`client/src/App.jsx`](file:///c:/Users/hardi/Hexa/client/src/App.jsx) establishes client-side SPA routes. [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx) guards protected routes (`/tasks/new`) using `useAuth()`.
- **Authentication State Context**: [`client/src/context/AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx) manages global authentication state, token persistence in `localStorage`, login/logout handling, and user profiles.
- **Component Composition Hierarchy**: Layout composition (`App` → `AuthProvider` → `Layout` → `PageContainer` → `TaskList` → `TaskCard`). Presentation components like [`client/src/components/EmptyState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/EmptyState.jsx) accept customizable props.
- **Form State Management (`useState`)**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx) manages controlled inputs using a single `formData` object. Supports Create mode and Edit mode with immutable functional updates (`setFormData(prev => ({ ...prev, [name]: value }))`).
- **Async API Fetching Layer**: Service layer ([`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) & `taskApi.js`) wraps `fetch()` in `async/await`, checking `response.ok` and error statuses.
- **Closure-Based Filtering**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js) encapsulates filter logic via higher-order functions used in [`Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx).
- **Interactive CS Demos**: Runnable pages for Event Loop ([`EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx)), Hoisting ([`HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx)), and Promises vs Callbacks ([`PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx)).

### 2. Application Tier (Backend - Express API)
- **Authentication & Security**: [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js) hashes passwords using `bcryptjs` (`saltRounds = 10`) and verifies credentials on login, issuing JWT access tokens.
- **Environment & Secrets Validation**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js) validates mandatory environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`). In production mode, missing secrets force process exit (`process.exit(1)`).
- **Semantic HTTP Response Mapping**: Controllers map outcomes to standard status codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict`, `500 Server Error`.

### 3. Data Tier (PostgreSQL Relational Database)
- **Normalized Schema**: Tables defined in [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql) (`users`, `projects`, `tasks`).
- **Referential Integrity**:
  - Primary keys: `users.id`, `projects.id`, `tasks.id`.
  - Foreign keys: `projects.owner_id REFERENCES users(id) ON DELETE CASCADE`, `tasks.project_id REFERENCES projects(id) ON DELETE CASCADE`.
  - Audited Nullable FK: `tasks.created_by INTEGER REFERENCES users(id) ON DELETE SET NULL` allowing creator deletion without failing constraints.
- **B-Tree SQL Indexing Strategy**:
  - `idx_users_email`: Speeds up authentication email lookups.
  - `idx_projects_owner_id`: Speeds up owner project queries.
  - `idx_tasks_project_id`: Converts project task retrieval to $O(\log N)$ B-Tree index scans.
  - `idx_tasks_status`: Optimizes task status filtering.

### 4. Development Workflow & Evidence Framework
- **Feature Branch Git Workflow**: Isolates changes on feature branches (e.g., `feature/kalvium-viva-hardening-v2`) before merging to `main`.
- **Pull Request Template**: Enforces metadata via [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md).
- **Automated Testing Suite**: [`server/test/api.test.js`](file:///c:/Users/hardi/Hexa/server/test/api.test.js) verifies JWT generation/verification and environment loading.

### Real-Time Communication — WebSocket

In addition to the REST API, Hexa contains a WebSocket communication channel for real-time server-to-client communication.

```text
React Client
     │
     ├──────── HTTP/REST ────────► Express API
     │
     └────── WebSocket Connection ──────► WebSocket Server
                                             │
                                             └── Real-time Events

                                             The REST API remains responsible for normal request/response operations, while WebSockets are used when the server needs to communicate with connected clients in real time.

Implementation: server/src/websocket.js

Payment Gateway Integration

Payment processing is isolated behind a dedicated backend service.

React Client
     │
     │ HTTP request
     ▼
Express Backend
     │
     ▼
Payment Service
     │
     ▼
External Payment Gateway

The frontend does not directly manage payment-provider credentials. The backend payment service acts as the integration boundary between Hexa and the external payment system.

Implementation: server/src/services/paymentService.js


---

## Concept Mapping Architecture

| Concept | Architectural Tier | Primary Source File | Integration Point |
|---|---|---|---|
| **useState** | Presentation Tier | [`TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx) | Controlled form inputs, Create vs Edit mode |
| **PK/FK Schema** | Data Tier | [`schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql) | Users -> Projects -> Tasks 1:N relations |
| **SQL Indexing** | Data Tier | [`schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L34-L55) | B-Tree indexes on FKs & status columns |
| **Client Routing & Auth**| Presentation Tier | [`AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx) & [`ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx) | Global auth provider & guarded routes |
| **Async Data Fetching** | API Layer | [`projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) & [`taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js) | Native `fetch()` service abstraction |
| **async/await** | Presentation / API | [`Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx#L24-L27) | Concurrent `Promise.all` data fetching |
| **Closures** | Frontend Logic | [`createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js) | Higher-order task status filtering |
| **Event Loop** | Frontend Demo | [`EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx) | Callstack, Microtask, Macrotask trace |
| **Hoisting & TDZ** | Frontend Demo | [`HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx) | Var vs Let/Const TDZ execution |
| **Promises vs Callbacks**| Frontend Demo | [`PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx) | Asynchronous execution comparison |
| **Environment Secrets**| Application Tier | [`env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js) | Fail-fast config validation |
| **HTTP Status Codes** | Application Tier | [`tasks.js`](file:///c:/Users/hardi/Hexa/server/src/routes/tasks.js) | Express REST status returns |
| **Component Composition**| Presentation Tier | [`PageContainer.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/PageContainer.jsx) | Reusable layout shell & props injection |
| **Git Workflow** | Engineering | [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md) | Pull Request review template |