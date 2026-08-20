# Hexa Rapid Viva Examiner Cheat Sheet

Use this cheat sheet for instant, high-impact one-liner answers during examiner evaluation.

---

### 1. useState Management
- **FILE**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx)
- **CODE**: `const [formData, setFormData] = useState({...});`
- **WHY**: Keeps form values together matching the API payload.
- **TRADE-OFF**: Object state simplifies payload submission but requires immutable spreading (`...prev`).
- **VIVA ONE-LINER**: *"I use one formData object because the fields belong to the same logical form payload, and I update it immutably using functional setter updates."*

---

### 2. Relational PK / FK Design
- **FILE**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql)
- **CODE**: `projects.owner_id REFERENCES users(id) ON DELETE CASCADE`
- **WHY**: Enforces data integrity at database level; deleting a user cascade-deletes their projects.
- **TRADE-OFF**: Referential integrity check overhead during writes and lock contention during deletes.
- **VIVA ONE-LINER**: *"Primary keys uniquely identify entities while foreign keys enforce referential integrity at the database level, preventing orphan records."*

---

### 3. SQL Indexing
- **FILE**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L53)
- **CODE**: `CREATE INDEX idx_tasks_project_id ON tasks(project_id);`
- **WHY**: Speeds up `WHERE project_id = $1` queries in `taskRepository.js`.
- **TRADE-OFF**: Replaces $O(N)$ sequential scan with $O(\log N)$ B-Tree scan, at the cost of write maintenance and RAM.
- **VIVA ONE-LINER**: *"I indexed project_id because Hexa frequently queries tasks by project, converting full table scans into logarithmic B-Tree index scans."*

---

### 4. React Composition
- **FILE**: [`client/src/components/EmptyState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/EmptyState.jsx)
- **CODE**: `<EmptyState message="No tasks found" icon="📝" />`
- **WHY**: Reuses markup and styling without duplicating DOM code across pages.
- **TRADE-OFF**: Requires prop configuration discipline.
- **VIVA ONE-LINER**: *"Composition allows parent components like Tasks and Projects to pass custom props to EmptyState while keeping markup DRY."*

---

### 5. Client-Side Routing & Guard
- **FILE**: [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)
- **CODE**: `<Route element={<ProtectedRoute />}> <Route path="tasks/new" element={<CreateTask />} /> </Route>`
- **WHY**: Redirects unauthenticated users on the client to improve UX.
- **TRADE-OFF**: Client routing improves UX navigation but backend API authorization is still strictly required.
- **VIVA ONE-LINER**: *"Client routing guards enhance UX by preventing unauthenticated access, but real security must be enforced by backend middleware."*

---

### 6. Async Data Fetching
- **FILE**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js)
- **CODE**: `const response = await fetch('/api/projects/1');`
- **WHY**: Fetches data asynchronously from Express REST API without blocking the main browser thread.
- **TRADE-OFF**: Must explicitly handle non-200 HTTP statuses like 400 and 404.
- **VIVA ONE-LINER**: *"Hexa's API layer wraps fetch in async/await to handle HTTP responses and throw granular, status-code-aware errors."*

---

### 7. async/await & Promise.all
- **FILE**: [`client/src/pages/Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx)
- **CODE**: `const [projects, tasks] = await Promise.all([getProjects(), getTasks()]);`
- **WHY**: Executes independent requests in parallel, reducing page loading latency.
- **TRADE-OFF**: Fails fast if any single request rejects.
- **VIVA ONE-LINER**: *"I use Promise.all on Dashboard to fetch projects and tasks concurrently, drastically reducing overall data fetch latency."*

---

### 8. JavaScript Closures
- **FILE**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js)
- **CODE**: `return function filterTasks(tasks) { return tasks.filter(t => t.status === status); };`
- **WHY**: Encapsulates status variable in inner function's lexical scope.
- **TRADE-OFF**: Retains captured variables in memory while inner function reference exists.
- **VIVA ONE-LINER**: *"createTaskFilter returns a closure that captures the status variable from its outer lexical scope to filter tasks."*

---

### 9. JavaScript Event Loop
- **FILE**: [`client/src/pages/EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx)
- **CODE**: `Promise.resolve().then(...)` (Microtask) vs `setTimeout(..., 0)` (Macrotask)
- **WHY**: Microtasks run before macrotasks when Call Stack empties.
- **TRADE-OFF**: Heavy synchronous operations block the event loop.
- **VIVA ONE-LINER**: *"The Event Loop drains all Promise microtasks before executing timer macrotasks, which is why Promise then runs before setTimeout 0."*

---

### 10. Hoisting & TDZ
- **FILE**: [`client/src/pages/HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx)
- **CODE**: `let` / `const` inside Temporal Dead Zone
- **WHY**: Demonstrates variable initialization behavior.
- **TRADE-OFF**: Accessing let/const in TDZ throws ReferenceError.
- **VIVA ONE-LINER**: *"let and const are hoisted into their block scope but sit in the Temporal Dead Zone until initialized, throwing a ReferenceError if accessed early."*

---

### 11. Promises vs Callbacks
- **FILE**: [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx)
- **CODE**: `Promise.then().catch()` vs nested callbacks
- **WHY**: Avoids Callback Hell and centralizes error handling.
- **TRADE-OFF**: Minor promise object allocation cost over raw callbacks.
- **VIVA ONE-LINER**: *"Promises provide a clean, chainable asynchronous abstraction with centralized catch error handling, overcoming Callback Hell."*

---

### 12. Environment Variables & Secrets
- **FILE**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js)
- **CODE**: `process.env.DATABASE_URL`
- **WHY**: Keeps secrets out of source code while `.gitignore` blocks `.env`.
- **TRADE-OFF**: Requires server startup validation.
- **VIVA ONE-LINER**: *"Secrets are externalized into .env and validated on startup, ensuring sensitive database credentials are never committed to version control."*

---

### 13. Semantic HTTP Status Codes
- **FILE**: [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js)
- **CODE**: `res.status(201).json(...)`
- **WHY**: Communicates exact REST execution outcome to API clients.
- **TRADE-OFF**: Requires explicit status assignment in controller catch/success blocks.
- **VIVA ONE-LINER**: *"Hexa uses semantic HTTP status codes like 201 for registration, 204 for deletion, and 409 for duplicate email collisions."*

---

### 14. Git Workflow
- **FILE**: [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md)
- **CODE**: Feature branch `feature/viva-hardening` → PR → `main`
- **WHY**: Isolates feature development and enforces peer code reviews.
- **TRADE-OFF**: Branch management and conflict resolution overhead.
- **VIVA ONE-LINER**: *"We use feature branches and PR templates to isolate changes, perform local testing, and maintain a clean git history on main."*