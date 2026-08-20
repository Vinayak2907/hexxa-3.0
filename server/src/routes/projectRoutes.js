// Project Routes - API endpoints for project operations
// Maps HTTP methods and paths to controller methods
// Protected by authentication middleware

import express from 'express';
import { authenticateToken } from '../utils/jwt.js';
import projectController from '../controllers/projectController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/owner/:ownerId - Get projects by owner
router.get('/owner/:ownerId', projectController.getProjectsByOwner);

// GET /api/projects/:id - Get single project by ID
router.get('/:id', projectController.getProjectById);

// POST /api/projects - Create new project (returns 201 Created)
router.post('/', projectController.createProject);

// PUT /api/projects/:id - Update project (returns 200 OK)
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete project (returns 204 No Content)
router.delete('/:id', projectController.deleteProject);

export default router;