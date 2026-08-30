# Concept 21: Role-Based Authorization Checks (RBAC)

## Overview
Authentication (who you are) and Authorization (what you are allowed to do) are distinct security layers. Role-Based Access Control (RBAC) is an authorization model that grants access to resources based on the user's assigned role (e.g., admin, manager, user).

Hexa implements a scalable RBAC middleware system that validates JWT payloads against route-level requirements.

## Implementation Details

### 1. The Role Middleware Factory
We use a higher-order function (middleware factory) to create role-checking middleware dynamically for different routes.
```javascript
// server/src/middleware/roleMiddleware.js
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      return next(new AuthorizationError(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`
      ));
    }
    next();
  };
}
```

### 2. Route Protection Integration
The authorization middleware is chained *after* the authentication middleware.
```javascript
// server/src/routes/uploadRoutes.js
router.delete('/:filename',
  authenticateToken,               // Step 1: Who are you? (Sets req.user)
  authorizeRoles('admin'),         // Step 2: Are you allowed? (Checks req.user.role)
  (req, res, next) => { ... }      // Step 3: Action
);
```

### 3. Resource-Level Authorization (Owner or Admin)
Sometimes a role isn't enough; we need to know if the user *owns* the specific resource they are trying to modify.
```javascript
// server/src/middleware/roleMiddleware.js
export function authorizeOwnerOrAdmin(getResourceOwnerId) {
  return (req, res, next) => {
    const userRole = req.user.role || 'user';
    const userId = String(req.user.userId);
    const resourceOwnerId = String(getResourceOwnerId(req));

    if (userRole === 'admin' || userId === resourceOwnerId) {
      return next(); // Allowed: Admin OR Owner
    }

    return next(new AuthorizationError('You can only access your own resources'));
  };
}
```

## Security Best Practices Demonstrated
1. **Principle of Least Privilege**: Users default to the lowest privilege level (`'user'`).
2. **Separation of Concerns**: Auth validation (JWT parsing) is decoupled from authorization (Role checking).
3. **Fail Closed**: If a user has no role defined, they are defaulted to the lowest privilege, and if the check fails, the request is immediately terminated with a 403 Forbidden.

## Verification / Demo
- Try hitting `DELETE /api/uploads/test.txt` with a standard user JWT token. It will fail with a 403 Forbidden error.
