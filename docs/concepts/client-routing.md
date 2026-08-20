# Client-Side Routing & Route Protection in Hexa

## Exact Implementation Location
- **Files**:
  - Context: [`client/src/context/AuthContext.jsx`](file:///c:/Users/hardi/Hexa/client/src/context/AuthContext.jsx)
  - Route Guard: [`client/src/components/ProtectedRoute.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ProtectedRoute.jsx)
  - Router Setup: [`client/src/App.jsx`](file:///c:/Users/hardi/Hexa/client/src/App.jsx)

## Architecture & Authentication State Flow
Client-side routing in Hexa is powered by `react-router-dom` v6 (`BrowserRouter`, `Routes`, `Route`). Real authentication state is managed via `AuthContext`:

```
+-------------------------------------------------------------------+
|                            AuthProvider                           |
|  state: { user, token, isAuthenticated }                          |
|  methods: { login(user, token), logout() }                        |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                            BrowserRouter                          |
|                                                                   |
|   /           --> Dashboard (Public)                              |
|   /tasks      --> Tasks (Public)                                  |
|   /projects   --> Projects (Public)                               |
|   /concepts   --> Concepts (Public)                               |
|                                                                   |
|   /tasks/new  --> <ProtectedRoute /> (Guarded)                   |
|                      |-- isAuthenticated?                         |
|                      |     YES --> Render <CreateTask />          |
|                      |     NO  --> Redirect <Navigate to="/" />   |
+-------------------------------------------------------------------+
```

## Client-Side Route Protection vs Server-Side Security

> **Critical Viva Distinction**:
> - **Client-Side Route Protection (`ProtectedRoute.jsx`)**: Improves User Experience (UX) by preventing unauthenticated users from seeing UI forms or private view layouts. It redirects unauthenticated users back to the dashboard or login page.
> - **Server-Side API Security (`server/src/middleware/auth.js`)**: Real security boundary. The backend independently verifies JWT bearer tokens on incoming HTTP requests and returns `401 Unauthorized` if invalid or missing.

## Edge Cases Handled
1. **Session Restoration**: On page reload, `AuthContext` restores authentication tokens and user profiles from `localStorage`.
2. **Direct URL Navigation**: Navigating directly to `/tasks/new` in the browser URL bar immediately triggers `ProtectedRoute` evaluation before component mounting.
3. **Logout Cleanup**: Invoking `logout()` clears `localStorage` keys and automatically forces protected route redirection.
