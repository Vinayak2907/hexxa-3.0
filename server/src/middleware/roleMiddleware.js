// Role-Based Authorization Middleware
// Concept: Role-based authorization checks (RBAC)
// Checks authenticated user's role against allowed roles for a route
// Must be used AFTER authenticateToken middleware

import { AuthorizationError } from '../utils/errors.js';

/**
 * Role-based authorization middleware factory
 * Returns middleware that checks if the authenticated user has one of the allowed roles
 *
 * @param {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.delete('/admin-only', authenticateToken, authorizeRoles('admin'), handler);
 *   router.put('/manager-or-admin', authenticateToken, authorizeRoles('admin', 'manager'), handler);
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // Ensure user is authenticated (authenticateToken must run first)
    if (!req.user) {
      return next(new AuthorizationError('Authentication required before authorization'));
    }

    // Extract role from the authenticated user object
    const userRole = req.user.role || 'user'; // Default to 'user' if no role set

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `RBAC: User ${req.user.userId || req.user.id} with role '${userRole}' ` +
        `denied access to ${req.method} ${req.originalUrl}. ` +
        `Required roles: [${allowedRoles.join(', ')}]`
      );

      return next(new AuthorizationError(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}`
      ));
    }

    // Role check passed — proceed to route handler
    console.log(
      `RBAC: User ${req.user.userId || req.user.id} with role '${userRole}' ` +
      `authorized for ${req.method} ${req.originalUrl}`
    );
    next();
  };
}

/**
 * Middleware to check if user is the resource owner OR has an admin role
 * Useful for routes where users can only modify their own resources
 *
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.put('/profile/:id', authenticateToken, authorizeOwnerOrAdmin(req => req.params.id), handler);
 */
export function authorizeOwnerOrAdmin(getResourceOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    const userRole = req.user.role || 'user';
    const userId = String(req.user.userId || req.user.id);
    const resourceOwnerId = String(getResourceOwnerId(req));

    // Admins can access any resource
    if (userRole === 'admin') {
      return next();
    }

    // Otherwise, user must be the resource owner
    if (userId !== resourceOwnerId) {
      return next(new AuthorizationError(
        'You can only access your own resources'
      ));
    }

    next();
  };
}

export default { authorizeRoles, authorizeOwnerOrAdmin };
