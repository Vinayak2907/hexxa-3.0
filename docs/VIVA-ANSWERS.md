# Hexa Repository-Specific Viva Q&A Guide

This document provides exhaustive, repository-specific answers for examiners covering all 14 mandatory concepts in **Hexa**.

---

## 1. State Management (`useState` in `TaskForm.jsx`)

1. **What is it?**: A React Hook that manages local state inside functional components and triggers re-renders on update.
2. **Where is it in Hexa?**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx#L9-L14).
3. **Show me the code**:
```javascript
const [formData, setFormData] = useState({
  title: initialData.title || '',
  description: initialData.description || '',
  status: initialData.status || 'todo',
  projectId: initialData.project_id || ''
});
```
4. **Why designed this way?**: Consolidates related form inputs into a single object matching the backend API payload structure.
5. **Trade-offs**: Requires immutable spreading (`...prev`). Direct object mutation (`formData.title = 'x'`) will fail to trigger re-renders.
6. **Runtime behavior**: Every keystroke invokes `setFormData`, triggering a controlled component re-render.
7. **What could break?**: Direct state mutation or forgetting to spread `...prev` loses unedited form fields.
8. **How to improve?**: Use `useReducer` or React Hook Form for complex schemas with validation.

---

## 2. Relational PK / FK Design (`database/schema.sql`)

1. **What is it?**: Relational database constraints enforcing unique identification (PK) and parent-child integrity (FK).
2. **Where is it in Hexa?**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql).
3. **Show me the code**: `projects.owner_id REFERENCES users(id) ON DELETE CASCADE`.
4. **Why designed this way?**: Prevents orphan records. Deleting a project automatically cascade-deletes associated tasks.
5. **Trade-offs**: Write latency overhead verifying parent FK existence and lock contention during cascading deletes.
6. **Runtime behavior**: PostgreSQL rejects `INSERT INTO tasks` if `project_id` does not exist in `projects`.
7. **What could break?**: Disabling FK constraints creates corrupted, unreferenced records.
8. **How to improve?**: Add soft-delete columns (`deleted_at`) to preserve historical task audit logs.

---

## 3. Database Indexing (`idx_tasks_project_id`)

1. **What is it?**: PostgreSQL B-Tree data structure accelerating column lookups.
2. **Where is it in Hexa?**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L53).
3. **Show me the code**: `CREATE INDEX idx_tasks_project_id ON tasks(project_id);`.
4. **Why designed this way?**: Optimizes task queries filtering by `project_id` in [`server/src/repositories/taskRepository.js`](file:///c:/Users/hardi/Hexa/server/src/repositories/taskRepository.js).
5. **Trade-offs**: B-Tree maintenance cost on `INSERT`/`UPDATE`/`DELETE` and RAM buffer pool consumption.
6. **Runtime behavior**: Converts $O(N)$ table scans into $O(\log N)$ B-Tree index scans.
7. **What could break?**: Over-indexing causes heavy write slowdowns.
8. **How to improve?**: Monitor `pg_stat_user_indexes` to drop unused indexes.

---

## 4. React Component Composition (`EmptyState.jsx`)

1. **What is it?**: Assembling modular UI components by passing configurable props.
2. **Where is it in Hexa?**: [`client/src/components/EmptyState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/EmptyState.jsx).
3. **Show me the code**: `<EmptyState message="No tasks found" icon="📝" />`.
4. **Why designed this way?**: Reuses fallback UI layout without duplicating DOM markup across pages.
5. **Trade-offs**: Slight prop drilling if passed deep into child trees.
6. **Runtime behavior**: Renders custom message and icon based on parent prop values.
7. **What could break?**: Missing prop default values rendering empty strings.
8. **How to improve?**: Accept React children for custom action buttons inside `EmptyState`.

---

## 5. Client-Side Routing & Route Guards (`ProtectedRoute.jsx`)

1. **What is it?**: Browser URL navigation without full page reloads, secured by client route guards.
2. **Where is it in Hexa?**: [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx) & [`client/src/App.jsx`](file:///c:/Users/hardi/Hexa/client/src/App.jsx).
3. **Show me the code**: `<Route element={<ProtectedRoute />}> <Route path="tasks/new" element={<CreateTask />} /> </Route>`.
4. **Why designed this way?**: Prevents unauthenticated users from accessing protected views on the client.
5. **Trade-offs**: Client routing improves UX but is **NOT** a true security boundary.
6. **Runtime behavior**: Unauthenticated users are redirected via `<Navigate to="/" replace />`.
7. **What could break?**: Stale auth state allowing access to protected views until API rejects.
8. **How to improve?**: Integrate Context API / JWT token expiration check.

---

## 6. Asynchronous Data Fetching (`projectApi.js`)

1. **What is it?**: Requesting remote API data using HTTP requests.
2. **Where is it in Hexa?**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js).
3. **Show me the code**: `const response = await fetch('/api/projects/1');`.
4. **Why designed this way?**: Decouples API HTTP communications into reusable helper functions.
5. **Trade-offs**: Must explicitly check `response.ok` and handle network failures.
6. **Runtime behavior**: Parses JSON payloads and throws typed errors for 400/404 statuses.
7. **What could break?**: Unhandled promise rejections crashing React render cycles.
8. **How to improve?**: Integrate TanStack Query (React Query) for automatic caching and retries.

---

## 7. JavaScript async/await & Promise.all (`Dashboard.jsx`)

1. **What is it?**: Syntactic sugar over Promises for non-blocking asynchronous execution.
2. **Where is it in Hexa?**: [`client/src/pages/Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx).
3. **Show me the code**: `const [projects, tasks] = await Promise.all([getProjects(), getTasks()]);`.
4. **Why designed this way?**: Fetches projects and tasks concurrently, reducing total page loading latency.
5. **Trade-offs**: `Promise.all` fails fast if any single promise rejects.
6. **Runtime behavior**: Requests execute in parallel; state updates once both settle.
7. **What could break?**: Unhandled rejection in one call cancels data loading for both.
8. **How to improve?**: Use `Promise.allSettled` for partial data rendering.

---

## 8. JavaScript Closures (`createTaskFilter.js`)

1. **What is it?**: An inner function retaining access to variables in its outer lexical scope.
2. **Where is it in Hexa?**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js).
3. **Show me the code**: `return function filterTasks(tasks) { return tasks.filter(t => t.status === status); };`.
4. **Why designed this way?**: Creates reusable, stateful filter functions pre-configured with a specific status.
5. **Trade-offs**: Captured variables remain in memory as long as the inner function reference exists.
6. **Runtime behavior**: The returned function evaluates tasks against the captured `status` variable.
7. **What could break?**: Stale lexical references if the captured variable changes unexpectedly.
8. **How to improve?**: Combine closures with memoization for high-volume array operations.

---

## 9. JavaScript Event Loop (`EventLoopDemo.jsx`)

1. **What is it?**: The single-threaded concurrency engine processing Call Stack, Microtasks, and Macrotasks.
2. **Where is it in Hexa?**: [`client/src/pages/EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx).
3. **Show me the code**: `Promise.resolve().then(...)` (Microtask) vs `setTimeout(..., 0)` (Macrotask).
4. **Why designed this way?**: Demonstrates why Promise microtasks execute before timer macrotasks.
5. **Trade-offs**: Heavy synchronous loops block the call stack and freeze the browser UI.
6. **Runtime behavior**: Synchronous code → Microtask Queue → Macrotask Queue execution order.
7. **What could break?**: Infinite microtask loops starvation of the macrotask queue.
8. **How to improve?**: Offload cpu-heavy tasks to Web Workers.

---

## 10. Variable & Function Hoisting (`HoistingDemo.jsx`)

1. **What is it?**: JavaScript moving declarations to the top of their scope during creation phase.
2. **Where is it in Hexa?**: [`client/src/pages/HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx).
3. **Show me the code**: `let` and `const` remain in TDZ until declared.
4. **Why designed this way?**: Explains variable lifecycle differences between `var` and `let`/`const`.
5. **Trade-offs**: Accessing `let`/`const` before initialization throws `ReferenceError`.
6. **Runtime behavior**: `var` initializes to `undefined`; `let`/`const` throws TDZ ReferenceError.
7. **What could break?**: Calling arrow function expressions before assignment.
8. **How to improve?**: Enforce ESLint rules preventing variable use before declaration.

---

## 11. Promises vs Callbacks (`PromisesDemo.jsx`)

1. **What is it?**: Asynchronous primitives comparing legacy callbacks with modern Promises.
2. **Where is it in Hexa?**: [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx).
3. **Show me the code**: Promise `.then().catch()` vs error-first callbacks.
4. **Why designed this way?**: Demonstrates how Promises solve Callback Hell and unhandled errors.
5. **Trade-offs**: Promises introduce minor allocation overhead over primitive callbacks.
6. **Runtime behavior**: Promises transition from `pending` to `fulfilled` or `rejected`.
7. **What could break?**: Unhandled promise rejections in older Node runtimes.
8. **How to improve?**: Standardize on `async/await` across all modules.

---

## 12. Environment Variables & Secrets (`env.js`)

1. **What is it?**: Isolating sensitive configuration credentials from application code.
2. **Where is it in Hexa?**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js) & [`.env.example`](file:///c:/Users/hardi/Hexa/.env.example).
3. **Show me the code**: `process.env.DATABASE_URL`.
4. **Why designed this way?**: Keeps database secrets out of version control while validating required variables.
5. **Trade-offs**: Server fails to boot if required environment variables are missing.
6. **Runtime behavior**: `dotenv` reads `.env` on boot and exposes values on `process.env`.
7. **What could break?**: Accidentally committing `.env` to Git history.
8. **How to improve?**: Integrate secret managers like AWS Secrets Manager or HashiCorp Vault.

---

## 13. Semantic HTTP Status Codes (`authController.js`)

1. **What is it?**: Standardized REST status codes indicating request outcomes.
2. **Where is it in Hexa?**: [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js).
3. **Show me the code**: `res.status(201).json(...)` on register, `res.status(409).json(...)` on duplicate email.
4. **Why designed this way?**: Provides clients with precise semantic status information.
5. **Trade-offs**: Requires disciplined status code selection across all controller handlers.
6. **Runtime behavior**: Express sets HTTP headers to matching integer status codes.
7. **What could break?**: Returning `200 OK` for error payloads confusing client fetch handlers.
8. **How to improve?**: Enforce centralized response formatting middleware.

---

## 14. Git Workflow & PR Evidence (`pull_request_template.md`)

1. **What is it?**: Feature branch workflow with Pull Request templates and code review gates.
2. **Where is it in Hexa?**: [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md) & [`docs/concepts/03-git-workflow.md`](file:///c:/Users/hardi/Hexa/docs/concepts/03-git-workflow.md).
3. **Show me the code**: Branch `feature/viva-hardening` merged into `main`.
4. **Why designed this way?**: Ensures code quality, review traceability, and clean version history.
5. **Trade-offs**: Branch management overhead and potential merge conflict resolution.
6. **Runtime behavior**: Git tracks atomic commits and branch merge points cleanly.
7. **What could break?**: Direct force-pushing to `main` bypassing PR review gates.
8. **How to improve?**: Configure GitHub branch protection rules enforcing status checks before merging.
