# Product Requirements Document (PRD) — Hexa Platform

## Overview
This Product Requirements Document (PRD) defines the product specifications, feature requirements, user stories, and technical concept coverage for **Hexa** (`hardikkaurani/Hexa`), a full-stack engineering and task/project management application.

Hexa is engineered to demonstrate modern full-stack web development best practices, scalable software architecture, and core computer science concepts required for technical viva evaluation.

---

## Core Product Vision & Objectives

1. **Task & Project Management**: Provide teams with intuitive tools to create, view, edit, filter, and delete projects and tasks with real-time feedback.
2. **Robust Security & Session Management**: Lightweight authentication state handling with persistent sessions, protected route guards, and server-side secret isolation.
3. **High Performance Data Tier**: PostgreSQL database with normalized tables, enforced primary and foreign key constraints, and query-driven B-Tree indexing.
4. **Project-Native Viva Preparedness**: Every required engineering and computer science concept is implemented directly within Hexa's architecture and user workflows, supported by runnable concept demonstration tools and master evidence mapping.

---

## 100% Implemented Product Features & Architecture

### 1. User Authentication & Session Management
- **Lightweight Auth State (`AuthContext.jsx`)**: Context provider ([`client/src/context/AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx)) managing `user`, `token`, `isAuthenticated`, `login()`, and `logout()` actions.
- **Session Persistence**: Restores session token and user profile automatically from `localStorage` upon app reloads.
- **Bcrypt Password Hashing**: Hashed passwords using `bcryptjs` (`saltRounds = 10`) during registration in [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js).
- **JWT Session Tokens**: Issues JWT access tokens and manages HTTP-only authentication tokens.
- **Environment Secrets Isolation (`env.js`)**: Externalizes secrets into `.env` (gitignored), validated on server boot via [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js). In production mode, missing secrets abort server startup (`process.exit(1)`). [`.env.example`](file:///c:/Users/hardi/Hexa/.env.example) supplies safe developer templates.

### 2. Client-Side Routing & Navigation
- **SPA Routing Architecture**: Powered by React Router v6 in [`client/src/App.jsx`](file:///c:/Users/hardi/Hexa/client/src/App.jsx).
- **Route Guard Protection (`ProtectedRoute.jsx`)**: Consumes `useAuth()` dynamically to guard protected client routes like `/tasks/new` ([`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)). Unauthenticated access attempts are redirected to `/`.
- **Navigation Feedback (`Navbar.jsx`)**: Displays dynamic user login status, active route highlights, and login/logout controls ([`client/src/components/Navbar.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/Navbar.jsx)).

### 3. State Management & Form Handling (`useState`)
- **Single Object Form State (`TaskForm.jsx`)**: Controlled form inputs managed via a unified `formData` object in [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx).
- **Create vs. Edit Modes**:
  - **Create Mode**: Default empty form fields and `"Create Task"` submission label.
  - **Edit Mode**: Pre-populated task fields with `"Update Task"` label, synchronized asynchronously when task details finish loading.
- **Immutable State Updates**: Updates execute via functional state updates `setFormData(prev => ({ ...prev, [name]: value }))` to prevent stale closure values.

### 4. API Integration & Asynchronous Data Fetching
- **Decoupled API Service Layer**: Native `fetch()` wrappers in [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) and `taskApi.js` isolating HTTP requests from UI components.
- **Semantic HTTP Status Codes**: Explicit handling of `200 OK` (reads/updates), `201 Created` (resource creations), `204 No Content` (deletions), `400 Bad Request` (validations), `401 Unauthorized` (auth failures), `404 Not Found` (missing IDs), `409 Conflict` (duplicate constraints), and `500 Internal Error`.
- **Parallel Data Fetching**: [`Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx) uses `Promise.all([getTasks(), getProjects()])` for parallel data loading.

### 5. JavaScript Core Concepts & Closures
- **Closure-Based Filtering (`createTaskFilter.js`)**: Higher-order filter factory [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js) returning closure functions that capture status values, applied in [`Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx).
- **Event Loop Mechanics (`EventLoopDemo.jsx`)**: Interactive demo page illustrating callstack, microtask queue, and macrotask queue execution order (`A, D, C, B`).
- **Hoisting & Temporal Dead Zone (`HoistingDemo.jsx`)**: Demonstrates function declaration hoisting, `var` hoisting (`undefined`), and `let`/`const` TDZ (`ReferenceError`).
- **Promises vs Callbacks (`PromisesDemo.jsx`)**: Side-by-side comparison showing callbacks, Promises, and `async/await`.

### 6. Relational Schema & Performance SQL Indexing
- **Normalized PostgreSQL Schema (`schema.sql`)**: Relational tables in [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql) (`users`, `projects`, `tasks`).
- **Referential Integrity & Cascades**: Primary keys (`users.id`, `projects.id`, `tasks.id`) and foreign keys (`projects.owner_id REFERENCES users(id) ON DELETE CASCADE`, `tasks.project_id REFERENCES projects(id) ON DELETE CASCADE`).
- **Audited Constraint Fix**: `tasks.created_by` defined as nullable `INTEGER REFERENCES users(id) ON DELETE SET NULL` to ensure parent user deletion nullifies creator links without constraint errors.
- **B-Tree SQL Indexing**: Explicit indexes (`idx_users_email`, `idx_projects_owner_id`, `idx_tasks_project_id`, `idx_tasks_status`, `idx_tasks_created_by`) optimizing frequent query patterns.

### 7. Component Composition & Layouts
- **Hierarchical Layout Component (`Layout.jsx`)**: Standardized shell rendering Navbar and child routes via React Router `<Outlet />`.
- **Reusable Container (`PageContainer.jsx`)**: Enforces page headers, margins, and accessibility structure around injected `{children}`.
- **Visual Feedback UI (`EmptyState.jsx`, `LoadingState.jsx`, `ErrorState.jsx`)**: Reusable presentational components for loading spinners, error alerts, and empty states across pages.

### 8. Engineering Workflow & Evidence Systems
- **Git Feature Branching**: Disciplined Git workflow (`main` stable, feature branches like `feature/kalvium-viva-hardening-v2`).
- **Pull Request Template**: [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md) forcing structured reviews and concept verification checklists.
- **Viva Documentation Suite**: [`docs/KALVIUM-VIVA-EVIDENCE.md`](file:///c:/Users/hardi/Hexa/docs/KALVIUM-VIVA-EVIDENCE.md), [`docs/KALVIUM-CONCEPT-MATRIX.md`](file:///c:/Users/hardi/Hexa/docs/KALVIUM-CONCEPT-MATRIX.md), and dedicated concept breakdowns in `docs/concepts/`.

---

## User Stories & Acceptance Criteria

1. **User Authentication & Session State**:
   - *User Story*: As a user, I can log in or log out, and my session persists across browser reloads.
   - *Acceptance Criteria*: `AuthContext` restores token from `localStorage`; `Navbar` reflects current login state.

2. **Protected Route Navigation**:
   - *User Story*: As an unauthenticated visitor, navigating to `/tasks/new` redirects me to the home dashboard.
   - *Acceptance Criteria*: `ProtectedRoute` checks `isAuthenticated` and issues `<Navigate to="/" replace />`.

3. **Task Form Operations**:
   - *User Story*: As a user, I can create new tasks or update existing task details.
   - *Acceptance Criteria*: `TaskForm` populates fields from `initialData` in edit mode and submits parsed numeric `projectId`.

4. **Task Filtering via Closure**:
   - *User Story*: As a user, I can filter tasks by status on the Tasks page.
   - *Acceptance Criteria*: Selecting a status filter invokes `createTaskFilter(status)(tasks)` closure to update the list.

5. **Database Referential Integrity & Performance**:
   - *User Story*: As a developer, database queries for project tasks execute efficiently without integrity errors.
   - *Acceptance Criteria*: Foreign keys maintain CASCADE/SET NULL rules; B-Tree indexes speed up lookups.

---

## Viva Concept Mapping Matrix (100% Covered)

1. **State Management (`useState`)**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx)
2. **Relational Schema (PK/FK)**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql)
3. **SQL Indexing Performance**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L34-L55)
4. **Client-Side Routing & Auth**: [`client/src/context/AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx) & [`ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)
5. **Async Data Fetching**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) & [`taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js)
6. **JavaScript async/await & Promise.all**: [`client/src/pages/Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx#L24-L27)
7. **JavaScript Closures**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js)
8. **JavaScript Event Loop**: [`client/src/pages/EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx)
9. **JavaScript Hoisting & TDZ**: [`client/src/pages/HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx)
10. **Promises vs Callbacks**: [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx)
11. **Environment Variables & Secrets**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js)
12. **HTTP Status Codes**: [`server/src/routes/tasks.js`](file:///c:/Users/hardi/Hexa/server/src/routes/tasks.js)
13. **React Component Composition**: [`client/src/components/PageContainer.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/PageContainer.jsx)
14. **Git Workflow & Evidence**: [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md) & [`docs/KALVIUM-VIVA-EVIDENCE.md`](file:///c:/Users/hardi/Hexa/docs/KALVIUM-VIVA-EVIDENCE.md)