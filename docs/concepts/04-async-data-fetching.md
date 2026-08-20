# Concept 4: Asynchronous Data Fetching from API

## Definition
Asynchronous data fetching enables a web application to request external data over HTTP without blocking the main browser thread or user interface execution. Hexa utilizes the native browser `fetch()` API wrapped in `async/await` syntax to communicate with the Express backend server.

---

## Primary Repository Evidence

**API Module**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js#L18-L31)

```javascript
export async function getProject(id) {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to fetch project');
    error.status = response.status;
    throw error;
  }
  return response.json();
}
```

---

## End-to-End Request & Response Sequence Flow

```text
ProjectDetails (React Component)
  │
  ▼
getProject(id) [client/src/api/projectApi.js]
  │
  ▼
fetch('/api/projects/:id') [HTTP GET Request]
  │
  ▼
Express Route Handler [server/src/routes/projectRoutes.js]
  │
  ▼
ProjectController [server/src/controllers/projectController.js]
  │
  ▼
ProjectService [server/src/services/projectService.js]
  │
  ▼
ProjectRepository [server/src/repositories/projectRepository.js]
  │
  ▼
PostgreSQL Database (Executes SELECT query)
  │
  ▼
JSON Response Payload (HTTP Status 200 OK / 404 Not Found)
  │
  ▼
React useState Updates (setProject(data) / setError(err))
  │
  ▼
UI Re-renders with Project Details
```

---

## Granular HTTP Error Status Handling

Hexa's API layer explicitly differentiates HTTP error statuses rather than collapsing all failures into generic error messages:

1. **400 Bad Request**: Throws validation error with specific backend error details (`error.status = 400`).
2. **404 Not Found**: Throws explicit resource missing error (`error.status = 404`).
3. **500 Server Error**: Captures unexpected server failures (`error.status = 500`).
4. **Network Failures**: Caught by `try/catch` blocks in React components during network disconnection.

---

## Viva Reviewer Questions & Answers

**Q: Trace an asynchronous data request in Hexa from the UI to the database.**  
**A**: `ProjectDetails.jsx` calls `getProject(id)`, triggering `fetch('/api/projects/1')`. The Express route routes it to `ProjectController` → `ProjectService` → `ProjectRepository` → PostgreSQL. The returned JSON updates `project` state and re-renders the UI.

**Q: How does Hexa handle 404 vs 400 errors during fetching?**  
**A**: `projectApi.js` checks `response.status`. A `400` reads the validation error payload, while a `404` throws a "Project not found" error with `error.status = 404`.