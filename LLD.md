# Low-Level Design (LLD) — Hexa Detailed Specification

## Overview
This Low-Level Design (LLD) document provides detailed specifications for components, state models, database schemas, API contracts, utility functions, and algorithms in **Hexa** (`hardikkaurani/Hexa`).

---

## Detailed Component & Module Specifications

### 1. Presentation Layer Specifications

#### `AuthContext.jsx` Module Specification
- **File**: [`client/src/context/AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx)
- **State Properties**:
  - `user`: Object (`{ id, name, email }`) restored from `localStorage` or `null`.
  - `token`: String JWT token restored from `localStorage` or `null`.
  - `isAuthenticated`: Boolean derived from `Boolean(token)`.
- **Methods**:
  - `login(userData, userToken)`: Updates `user`, `token`, `isAuthenticated`, and persists to `localStorage`.
  - `logout()`: Clears state variables and removes keys from `localStorage`.
- **Custom Hook**: `useAuth()` throws error if invoked outside `AuthProvider`.

#### `ProtectedRoute.jsx` Component Specification
- **File**: [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)
- **Props**: `redirectTo` (`string`, default: `'/'`).
- **Logic**:
  ```javascript
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
  ```
- **UX Guard vs Security Note**: Redirects unauthorized visitors on the client; backend API endpoints enforce token authorization independently.

#### `TaskForm.jsx` State & Form Specification
- **File**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx)
- **Props**: `initialData` (`object`, default: `{}`), `onSubmit` (`function`), `submitLabel` (`string`, optional).
- **State (`formData`)**:
  ```javascript
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    projectId: initialData?.project_id || initialData?.projectId || ''
  });
  ```
- **Asynchronous Sync Effect**:
  ```javascript
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        projectId: initialData.project_id || initialData.projectId || ''
      });
    }
  }, [initialData]);
  ```
- **Form Submission**: Parses `projectId` as an integer (`parseInt(formData.projectId)`) and invokes `onSubmit`.

#### `createTaskFilter.js` Closure Specification
- **File**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js)
- **Signature**: `createTaskFilter(status: string): (tasks: Task[]) => Task[]`
- **Closure Structure**:
  ```javascript
  export function createTaskFilter(status) {
    return function filterTasks(tasks) {
      return tasks.filter(task => task.status === status);
    };
  }
  ```
- **Invocation**: In [`Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx), executed inside `useEffect` when `statusFilter` state updates.

---

### 2. Application Layer & API Specifications

#### Environment Validation Module (`env.js`)
- **File**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js)
- **Validation Algorithm**:
  ```javascript
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const missingSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'].filter(key => !process.env[key]);
    if (missingSecrets.length > 0) {
      console.error(`FATAL: Missing production secrets: ${missingSecrets.join(', ')}`);
      process.exit(1);
    }
  }
  ```

#### API Service Layer (`projectApi.js` & `taskApi.js`)
- **Files**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js), [`client/src/api/taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js)
- **Status Handling Table**:

| Method | Endpoint | Expected Status | Error Code | Error Thrown |
|---|---|---|---|---|
| `getTasks()` | `GET /api/tasks` | `200 OK` | `500` | `Failed to fetch tasks` |
| `getTask(id)` | `GET /api/tasks/:id` | `200 OK` | `404` | `Task not found` |
| `createTask(data)` | `POST /api/tasks` | `201 Created` | `400` | `Validation error` |
| `updateTask(id, data)`| `PUT /api/tasks/:id` | `200 OK` | `400 / 404` | `Task not found / Validation error` |
| `deleteTask(id)` | `DELETE /api/tasks/:id`| `204 No Content` | `404` | `Task not found` |

---

### 3. Database Schema & Indexing Specifications

#### Schema DDL (`database/schema.sql`)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### SQL Performance Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
```

---

### 4. Interactive Concept Demos Specification

1. **Event Loop Demo (`EventLoopDemo.jsx`)**:
   - Executes synchronous calls (`A`, `D`), microtasks (`C`), and macrotasks (`B`).
   - Renders exact sequence: `A, D, C, B`.
2. **Hoisting Demo (`HoistingDemo.jsx`)**:
   - Compares `function` declarations (invokable before definition), `var` declarations (returns `undefined`), and `let`/`const` TDZ (catches `ReferenceError`).
3. **Promises vs Callbacks Demo (`PromisesDemo.jsx`)**:
   - Runs side-by-side async workflows comparing error-first callbacks, Promise chaining, and `async/await`.

---

## 100% Concept Verification Matrix Across LLD

1. **useState**: [`TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx)
2. **PK/FK Relational Schema**: [`schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql)
3. **SQL Indexing**: [`schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L34-L55)
4. **Client-Side Routing & Auth**: [`AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx) & [`ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)
5. **Async Data Fetching**: [`projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) & [`taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js)
6. **async/await & Promise.all**: [`Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx#L24-L27)
7. **Closures**: [`createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js)
8. **Event Loop**: [`EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx)
9. **Hoisting & TDZ**: [`HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx)
10. **Promises vs Callbacks**: [`PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx)
11. **Environment Variables**: [`env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js)
12. **HTTP Status Codes**: [`tasks.js`](file:///c:/Users/hardi/Hexa/server/src/routes/tasks.js)
13. **Component Composition**: [`PageContainer.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/PageContainer.jsx)
14. **Git Workflow**: [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md)