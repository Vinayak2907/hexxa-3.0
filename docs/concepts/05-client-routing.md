# Concept 5: Client-Side Routing & Route Guards

## Definition
Client-side routing allows a Single Page Application (SPA) to update the URL and render different component views without requesting a full page reload from the server. React Router v6 manages browser history, dynamic parameters, and route protection inside Hexa.

---

## Hexa Route Definitions

**File**: [`client/src/App.jsx`](file:///c:/Users/hardi/Hexa/client/src/App.jsx)

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="tasks/:id" element={<TaskDetails />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetails />} />
      <Route path="concepts" element={<Concepts />} />
      
      {/* Protected Route Guard */}
      <Route element={<ProtectedRoute isAuthenticated={true} />}>
        <Route path="tasks/new" element={<CreateTask />} />
      </Route>
    </Route>
  </Routes>
</BrowserRouter>
```

---

## Dynamic Routing Parameters (`/tasks/:id`)

**File**: [`client/src/pages/TaskDetails.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/TaskDetails.jsx)

```javascript
import { useParams } from 'react';

function TaskDetails() {
  const { id } = useParams(); // Extracts 'id' dynamic parameter from URL
  // Fetches task data via taskApi.getTask(id)
}
```

---

## Client-Side Route Protection (`ProtectedRoute.jsx`)

**File**: [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)

```jsx
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, redirectTo = '/' }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAllowed = isAuthenticated || Boolean(token);

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
```

---

## Security Boundary & UX Limitation

> [!IMPORTANT]
> **Client-Side Routing is NOT a Security Boundary!**  
> Client-side route guards improve User Experience (UX) by preventing unauthenticated users from seeing UI forms or navigating to protected paths. However, JavaScript executing in the browser can be bypassed. **Real security and data authorization must be enforced on the backend Express API server.**

---

## Viva Reviewer Questions & Answers

**Q: Show me a dynamic route in Hexa.**  
**A**: `/tasks/:id` defined in `client/src/App.jsx`. `TaskDetails.jsx` uses `useParams()` hook to extract the task ID from the URL path.

**Q: How does ProtectedRoute work?**  
**A**: `ProtectedRoute.jsx` checks the authentication state / `localStorage` token. If valid, it renders `<Outlet />` to display protected child routes (`/tasks/new`). If absent, it redirects the user using `<Navigate to="/" replace />`.

**Q: Is client-side route protection sufficient for application security?**  
**A**: No. Client-side protection improves UX and navigation. Backend endpoints must independently verify authentication tokens and authorization rules on every HTTP request.