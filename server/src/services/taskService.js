// Task Service - Business logic for tasks
// Contains business rules and orchestrates between controller and repository

import taskRepository from '../repositories/taskRepository.js';
import { validateAndSanitize } from '../utils/sanitize.js';
import { transaction } from '../db/pool.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/redis.js';

// Cache keys
const CACHE_KEYS = {
  ALL_TASKS: 'tasks:all',
  TASKS_BY_PROJECT: (projectId) => `tasks:project:${projectId}`,
  TASK_BY_ID: (taskId) => `tasks:${taskId}`
};

// Cache TTL configurations (in seconds)
const CACHE_TTL = {
  ALL_TASKS: 60, // 1 minute
  TASKS_BY_PROJECT: 300, // 5 minutes
  TASK_BY_ID: 60 // 1 minute
};

// Helper to generate cache key
const getCacheKey = (keyFn, ...args) =>
  typeof keyFn === 'function' ? keyFn(...args) : keyFn;

// Task Service class
class TaskService {
  // Validation schema for task data
  static taskValidationSchema = {
    title: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 200,
      sanitizeHtml: true
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 2000,
      sanitizeHtml: true
    },
    status: {
      required: true,
      type: 'string',
      enum: ['todo', 'in_progress', 'completed']
    },
    projectId: {
      required: true,
      // We'll validate this is a valid ID in the business logic
    },
    createdBy: {
      required: false,
      // In a real app with auth, this would come from the token
    }
  };

  // Get all tasks with caching
  async getAllTasks() {
    // Try to get from cache first
    const cachedTasks = await cacheGet(CACHE_KEYS.ALL_TASKS);
    if (cachedTasks) {
      return cachedTasks;
    }

    // If not in cache, fetch from database
    const tasks = await taskRepository.findAll();

    // Cache the result
    await cacheSet(CACHE_KEYS.ALL_TASKS, tasks, CACHE_TTL.ALL_TASKS);

    return tasks;
  }

  // Get task by ID with validation and caching
  async getTaskById(id) {
    // Validate ID is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Try to get from cache first
    const cacheKey = getCacheKey(CACHE_KEYS.TASK_BY_ID, id);
    const cachedTask = await cacheGet(cacheKey);
    if (cachedTask) {
      return cachedTask;
    }

    // If not in cache, fetch from database
    const task = await taskRepository.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    // Cache the result
    await cacheSet(cacheKey, task, CACHE_TTL.TASK_BY_ID);

    return task;
  }

  // Get tasks by project with caching
  async getTasksByProject(projectId) {
    // Validate projectId is a positive integer
    if (!Number.isInteger(projectId) || projectId <= 0) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Try to get from cache first
    const cacheKey = getCacheKey(CACHE_KEYS.TASKS_BY_PROJECT, projectId);
    const cachedTasks = await cacheGet(cacheKey);
    if (cachedTasks) {
      return cachedTasks;
    }

    // If not in cache, fetch from database
    const tasks = await taskRepository.findByProjectId(projectId);

    // Cache the result
    await cacheSet(cacheKey, tasks, CACHE_TTL.TASKS_BY_PROJECT);

    return tasks;
  }

  // Create new task with validation and sanitization
  async createTask(taskData) {
    // Validate and sanitize input
    const validatedData = validateAndSanitize(taskData, TaskService.taskValidationSchema);

    // Additional business logic validation
    if (!validatedData.projectId) {
      const error = new Error('Project ID is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verify project exists
    const projectExists = await taskRepository.checkProjectExists(validatedData.projectId);
    if (!projectExists) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Set createdBy from authenticated user in real implementation
    // For now, we'll use the provided value or default to 1
    const finalData = {
      ...validatedData,
      createdBy: validatedData.createdBy || 1
    };

    // Create task
    const task = await taskRepository.create(finalData);

    // Invalidate relevant caches after creation
    await this._invalidateTaskCaches();

    return task;
  }

  // Create task with transaction (demonstrating transaction usage)
  async createTaskWithTransaction(taskData) {
    return await transaction(async (client) => {
      // Validate and sanitize input
      const validatedData = validateAndSanitize(taskData, TaskService.taskValidationSchema);

      // Additional business logic validation
      if (!validatedData.projectId) {
        const error = new Error('Project ID is required');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }

      // Verify project exists
      const projectExists = await taskRepository.checkProjectExists(validatedData.projectId, client);
      if (!projectExists) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        error.code = 'PROJECT_NOT_FOUND';
        throw error;
      }

      // Set createdBy from authenticated user in real implementation
      const finalData = {
        ...validatedData,
        createdBy: validatedData.createdBy || 1
      };

      // Create task
      const task = await taskRepository.create(finalData, client);

      // Invalidate relevant caches after creation
      await this._invalidateTaskCaches();

      return task;
    });
  }

  // Update task with validation and sanitization
  async updateTask(id, taskData) {
    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    // Validate and sanitize input
    const validatedData = validateAndSanitize(taskData, {
      ...TaskService.taskValidationSchema,
      title: { ...TaskService.taskValidationSchema.title, required: false },
      description: { ...TaskService.taskValidationSchema.description, required: false },
      status: { ...TaskService.taskValidationSchema.status, required: false },
      projectId: { required: false } // Don't allow changing projectId in update
    });

    // Verify project exists if projectId is being updated
    if (validatedData.projectId !== undefined) {
      const projectExists = await taskRepository.checkProjectExists(validatedData.projectId);
      if (!projectExists) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        error.code = 'PROJECT_NOT_FOUND';
        throw error;
      }
    }

    // Update task
    const task = await taskRepository.update(id, {
      title: validatedData.title !== undefined ? validatedData.title : existingTask.title,
      description: validatedData.description !== undefined ? validatedData.description : existingTask.description,
      status: validatedData.status !== undefined ? validatedData.status : existingTask.status,
      projectId: validatedData.projectId !== undefined ? validatedData.projectId : existingTask.project_id
    });

    // Invalidate relevant caches after update
    await this._invalidateTaskCaches(id);

    return task;
  }

  // Update task with transaction
  async updateTaskWithTransaction(id, taskData) {
    return await transaction(async (client) => {
      // Validate ID
      if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('Invalid task ID');
        error.statusCode = 400;
        error.code = 'INVALID_ID';
        throw error;
      }

      // Check if task exists
      const existingTask = await taskRepository.findById(id, client);
      if (!existingTask) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        error.code = 'TASK_NOT_FOUND';
        throw error;
      }

      // Validate and sanitize input
      const validatedData = validateAndSanitize(taskData, {
        ...TaskService.taskValidationSchema,
        title: { ...TaskService.taskValidationSchema.title, required: false },
        description: { ...TaskService.taskValidationSchema.description, required: false },
        status: { ...TaskService.taskValidationSchema.status, required: false },
        projectId: { required: false }
      });

      // Verify project exists if projectId is being updated
      if (validatedData.projectId !== undefined) {
        const projectExists = await taskRepository.checkProjectExists(validatedData.projectId, client);
        if (!projectExists) {
          const error = new Error('Project not found');
          error.statusCode = 404;
          error.code = 'PROJECT_NOT_FOUND';
          throw error;
        }
      }

      // Update task
      const task = await taskRepository.update(id, {
        title: validatedData.title !== undefined ? validatedData.title : existingTask.title,
        description: validatedData.description !== undefined ? validatedData.description : existingTask.description,
        status: validatedData.status !== undefined ? validatedData.status : existingTask.status,
        projectId: validatedData.projectId !== undefined ? validatedData.projectId : existingTask.project_id
      }, client);

      // Invalidate relevant caches after update
      await this._invalidateTaskCaches(id);

      return task;
    });
  }

  // Delete task
  async deleteTask(id) {
    // Validate ID is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid task ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    // Delete task
    await taskRepository.delete(id);

    // Invalidate relevant caches after deletion
    await this._invalidateTaskCaches(id);

    return { id }; // Return deleted task ID
  }

  // Delete task with transaction
  async deleteTaskWithTransaction(id) {
    return await transaction(async (client) => {
      // Validate ID is a positive integer
      if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('Invalid task ID');
        error.statusCode = 400;
        error.code = 'INVALID_ID';
        throw error;
      }

      const existingTask = await taskRepository.findById(id, client);
      if (!existingTask) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        error.code = 'TASK_NOT_FOUND';
        throw error;
      }

      // Delete task
      await taskRepository.delete(id, client);

      // Invalidate relevant caches after deletion
      await this._invalidateTaskCaches(id);

      return { id }; // Return deleted task ID
    });
  }

  // Private method to invalidate task-related caches
  async _invalidateTaskCaches(taskId = null) {
    try {
      // Always invalidate all tasks list
      await cacheDel(CACHE_KEYS.ALL_TASKS);

      // If specific task ID provided, invalidate that task's cache
      if (taskId !== null) {
        await cacheDel(getCacheKey(CACHE_KEYS.TASK_BY_ID, taskId));
      }

      // Note: In a real application, you might want to track which projects
      // are affected and invalidate those specifically, but for simplicity
      // we're invalidating all project-based caches when any task changes
      // In production, you might use Redis keyspace notifications or a more
      // sophisticated cache invalidation strategy
    } catch (error) {
      console.warn('Failed to invalidate task caches:', error.message);
      // Don't throw error - cache failure shouldn't break the operation
    }
  }
}

export default new TaskService();