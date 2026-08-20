# Hexa Master Technical Viva Guide & Evidence Reference

Welcome to the Master Technical Viva Reference for **Hexa** (`hardikkaurani/Hexa`). This document provides comprehensive evidence, code locations, design trade-offs, and runtime behavior across all mandatory engineering concepts.

---

## Real Hexa Git Workflow Example

```text
Issue Task
  └─► Feature Branch: feature/viva-hardening
       ├─► Atomic Commit 1: fix(api): correct status code 4.04 typo to 404 in projectApi.js
       ├─► Atomic Commit 2: feat(auth): implement bcryptjs password hashing in authController
       ├─► Atomic Commit 3: feat(routing): add ProtectedRoute component for client-side route guarding
       ├─► Atomic Commit 4: feat(routing): integrate ProtectedRoute into App router
       ├─► Atomic Commit 5..16: Concept documentation & PR template setup
       └─► Pull Request → Review → Merge into main
```

---

## SQL Indexing — Hexa Evidence

### Index 1: `idx_tasks_project_id`
- **File**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L53)
- **Target Query**: `SELECT * FROM tasks WHERE project_id = $1;` ([`server/src/repositories/taskRepository.js`](file:///c:/Users/hardi/Hexa/server/src/repositories/taskRepository.js#L78))
- **Why**: Replaces $O(N)$ full table scan with $O(\log N)$ B-Tree index scan.
- **Trade-off**: Additional storage and write maintenance cost on `INSERT`/`UPDATE`/`DELETE`.

### Index 2: `idx_users_email`
- **File**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L19)
- **Target Query**: `SELECT id, name, email FROM users WHERE email = $1;` ([`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js#L29))
- **Why**: Speeds up authentication user lookup by email. Unique high-selectivity column.

---

## Master Concept Evidence Matrix

| # | Mandatory Concept | Implementation File | Key Code Symbol / Reference |
|---|-------------------|---------------------|-----------------------------|
| 1 | Environment Variables & Secrets | [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js) | `process.env.DATABASE_URL` |
| 2 | Git Workflow & PRs | [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md) | `feature/viva-hardening` branch |
| 3 | Client-Side Routing & Guard | [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx) | `<ProtectedRoute>` |
| 4 | JavaScript async/await | [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) | `async getProject(id)` |
| 5 | JavaScript Closures | [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js) | `createTaskFilter(status)` |
| 6 | JavaScript Hoisting & TDZ | [`client/src/pages/HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx) | `HoistingDemo` component |
| 7 | Promises vs Callbacks | [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx) | `PromisesDemo` component |
| 8 | State Management with useState | [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx) | `const [formData, setFormData]` |
| 9 | Relational Schema (PK/FK) | [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql) | `projects.owner_id REFERENCES users(id)` |
| 10 | SQL Indexing Performance | [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql) | `CREATE INDEX idx_tasks_project_id` |
| 11 | Semantic HTTP Status Codes | [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js) | `res.status(201).json(...)` |
| 12 | Async Data Fetching | [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) | `fetch('/api/projects/:id')` |
| 13 | React Component Composition | [`client/src/components/EmptyState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/EmptyState.jsx) | `<EmptyState message="..." icon="..." />` |
| 14 | JavaScript Event Loop | [`client/src/pages/EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx) | `EventLoopDemo` call stack trace |