// Task Routes - API endpoints for task operations
// Maps HTTP methods and paths to controller methods
// Protected by authentication middleware

import express from 'express';
import { authenticateToken } from '../utils/jwt.js';
import taskController from '../controllers/taskController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/tasks - Get all tasks
router.get('/', taskController.getAllTasks);

// GET /api/tasks/project/:projectId - Get tasks by project
router.get('/project/:projectId', taskController.getTasksByProject);

// GET /api/tasks/:id - Get single task by ID
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - Create new task (returns 201 Created)
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Update task (returns 200 OK)
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete task (returns 204 No Content)
router.delete('/:id', taskController.deleteTask);

export default router;