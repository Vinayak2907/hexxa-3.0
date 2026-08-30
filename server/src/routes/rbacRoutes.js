// RBAC Demonstration Routes
// Concept: Role-based authorization checks (Auth & Security)
// Provides live endpoints demonstrating User, Manager, and Admin role enforcement

import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles, authorizeOwnerOrAdmin } from '../middleware/roleMiddleware.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

/**
 * GET /api/rbac/info
 * Public explanation of the RBAC system, roles, and hierarchy
 */
router.get('/info', (req, res) => {
  res.json({
    concept: 'Role-Based Authorization Checks (RBAC)',
    category: 'Auth & Security',
    description: 'Enforces permission barriers based on user roles embedded in cryptographically signed JWTs.',
    roles: {
      admin: {
        level: 3,
        permissions: ['read:all', 'write:all', 'delete:all', 'manage:users', 'system:config'],
        description: 'Superuser with full administrative access'
      },
      manager: {
        level: 2,
        permissions: ['read:all', 'write:projects', 'assign:tasks', 'view:reports'],
        description: 'Project/team manager who can manage projects and assign tasks'
      },
      user: {
        level: 1,
        permissions: ['read:assigned', 'write:own_tasks', 'comment'],
        description: 'Standard team member with self-service access'
      }
    },
    demoEndpoints: [
      { path: 'GET /api/rbac/public', requiredRole: 'None (Public)', description: 'Accessible to all' },
      { path: 'GET /api/rbac/user-zone', requiredRole: 'user | manager | admin', description: 'Requires any valid authenticated role' },
      { path: 'GET /api/rbac/manager-zone', requiredRole: 'manager | admin', description: 'Restricted to Managers & Admins' },
      { path: 'GET /api/rbac/admin-zone', requiredRole: 'admin', description: 'Strictly restricted to Admins only' }
    ]
  });
});

/**
 * GET /api/rbac/demo-tokens
 * Generates demo tokens for each role to allow testing without database seeding
 */
router.get('/demo-tokens', (req, res) => {
  const userToken = generateToken({ id: 101, name: 'Standard User', email: 'user@hexa.dev', role: 'user' });
  const managerToken = generateToken({ id: 202, name: 'Team Manager', email: 'manager@hexa.dev', role: 'manager' });
  const adminToken = generateToken({ id: 303, name: 'System Admin', email: 'admin@hexa.dev', role: 'admin' });

  res.json({
    message: 'Demo JWT tokens for testing role-based authorization',
    tokens: {
      user: { token: userToken, role: 'user', header: `Bearer ${userToken}` },
      manager: { token: managerToken, role: 'manager', header: `Bearer ${managerToken}` },
      admin: { token: adminToken, role: 'admin', header: `Bearer ${adminToken}` }
    },
    instructions: 'Copy a token header and send it in Authorization header to test the endpoints below.'
  });
});

/**
 * GET /api/rbac/public
 * Open to everyone
 */
router.get('/public', (req, res) => {
  res.json({
    status: 'success',
    access: 'granted',
    zone: 'Public Zone',
    message: 'This endpoint is accessible without authentication.'
  });
});

/**
 * GET /api/rbac/user-zone
 * Accessible by user, manager, and admin
 */
router.get('/user-zone', authenticateToken, authorizeRoles('user', 'manager', 'admin'), (req, res) => {
  res.json({
    status: 'success',
    access: 'granted',
    zone: 'User Zone',
    user: req.user,
    message: `Access granted to role: ${req.user.role || 'user'}`
  });
});

/**
 * GET /api/rbac/manager-zone
 * Accessible only by manager and admin
 */
router.get('/manager-zone', authenticateToken, authorizeRoles('manager', 'admin'), (req, res) => {
  res.json({
    status: 'success',
    access: 'granted',
    zone: 'Manager Zone',
    user: req.user,
    message: `Access granted to manager/admin. Your role: ${req.user.role}`
  });
});

/**
 * GET /api/rbac/admin-zone
 * Accessible strictly by admin
 */
router.get('/admin-zone', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({
    status: 'success',
    access: 'granted',
    zone: 'Admin Zone',
    user: req.user,
    message: 'Welcome to the Admin Control Panel. Full privileges active.'
  });
});

/**
 * POST /api/rbac/resource/:ownerId
 * Resource ownership demo: Only the owner OR an admin can modify
 */
router.post('/resource/:ownerId', authenticateToken, authorizeOwnerOrAdmin(req => req.params.ownerId), (req, res) => {
  res.json({
    status: 'success',
    access: 'granted',
    action: 'Resource Modified',
    ownerId: req.params.ownerId,
    actorId: req.user.userId,
    actorRole: req.user.role,
    reason: req.user.role === 'admin' ? 'Authorized as Administrator' : 'Authorized as Resource Owner'
  });
});

export default router;
