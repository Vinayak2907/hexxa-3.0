// Project Service - Business logic for projects
// Contains business rules and orchestrates between controller and repository

import projectRepository from '../repositories/projectRepository.js';
import { validateAndSanitize } from '../utils/sanitize.js';
import { transaction } from '../db/pool.js';
import { cacheGet, cacheSet, cacheDel } from '../utils/redis.js';

// Cache keys
const CACHE_KEYS = {
  ALL_PROJECTS: 'projects:all',
  PROJECT_BY_ID: (projectId) => `projects:${projectId}`,
  PROJECTS_BY_OWNER: (ownerId) => `projects:owner:${ownerId}`
};

// Cache TTL configurations (in seconds)
const CACHE_TTL = {
  ALL_PROJECTS: 60, // 1 minute
  PROJECT_BY_ID: 300, // 5 minutes
  PROJECTS_BY_OWNER: 300 // 5 minutes
};

// Helper to generate cache key
const getCacheKey = (keyFn, ...args) =>
  typeof keyFn === 'function' ? keyFn(...args) : keyFn;

// Project Service class
class ProjectService {
  // Validation schema for project data
  static projectValidationSchema = {
    name: {
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
    ownerId: {
      required: false, // In a real app with auth, this would come from the token
      // We'll validate it's a valid user ID if provided
    }
  };

  // Get all projects with caching
  async getAllProjects() {
    // Try to get from cache first
    const cachedProjects = await cacheGet(CACHE_KEYS.ALL_PROJECTS);
    if (cachedProjects) {
      return cachedProjects;
    }

    // If not in cache, fetch from database
    const projects = await projectRepository.findAll();

    // Cache the result
    await cacheSet(CACHE_KEYS.ALL_PROJECTS, projects, CACHE_TTL.ALL_PROJECTS);

    return projects;
  }

  // Get project by ID with caching
  async getProjectById(id) {
    // Validate ID is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Try to get from cache first
    const cacheKey = getCacheKey(CACHE_KEYS.PROJECT_BY_ID, id);
    const cachedProject = await cacheGet(cacheKey);
    if (cachedProject) {
      return cachedProject;
    }

    // If not in cache, fetch from database
    const project = await projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Cache the result
    await cacheSet(cacheKey, project, CACHE_TTL.PROJECT_BY_ID);

    return project;
  }

  // Get projects by owner with caching
  async getProjectsByOwner(ownerId) {
    // Validate ownerId is a positive integer
    if (!Number.isInteger(ownerId) || ownerId <= 0) {
      const error = new Error('Invalid owner ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Try to get from cache first
    const cacheKey = getCacheKey(CACHE_KEYS.PROJECTS_BY_OWNER, ownerId);
    const cachedProjects = await cacheGet(cacheKey);
    if (cachedProjects) {
      return cachedProjects;
    }

    // If not in cache, fetch from database
    const projects = await projectRepository.findByOwnerId(ownerId);

    // Cache the result
    await cacheSet(cacheKey, projects, CACHE_TTL.PROJECTS_BY_OWNER);

    return projects;
  }

  // Create new project with validation and sanitization
  async createProject(projectData) {
    // Validate and sanitize input
    const validatedData = validateAndSanitize(projectData, ProjectService.projectValidationSchema);

    // Additional business logic validation
    if (!validatedData.name || validatedData.name.trim() === '') {
      const error = new Error('Project name is required');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Verify owner exists if ownerId is provided
    if (validatedData.ownerId !== undefined) {
      const ownerExists = await projectRepository.checkUserExists(validatedData.ownerId);
      if (!ownerExists) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }
    }

    // Set ownerId from authenticated user in real implementation
    // For now, we'll use the provided value or default to 1
    const finalData = {
      ...validatedData,
      ownerId: validatedData.ownerId || 1
    };

    // Create project
    const project = await projectRepository.create(finalData);

    // Invalidate relevant caches after creation
    await this._invalidateProjectCaches();

    return project;
  }

  // Create project with transaction (demonstrating transaction usage)
  async createProjectWithTransaction(projectData) {
    return await transaction(async (client) => {
      // Validate and sanitize input
      const validatedData = validateAndSanitize(projectData, ProjectService.projectValidationSchema);

      // Additional business logic validation
      if (!validatedData.name || validatedData.name.trim() === '') {
        const error = new Error('Project name is required');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }

      // Verify owner exists if ownerId is provided
      if (validatedData.ownerId !== undefined) {
        const ownerExists = await projectRepository.checkUserExists(validatedData.ownerId, client);
        if (!ownerExists) {
          const error = new Error('User not found');
          error.statusCode = 404;
          error.code = 'USER_NOT_FOUND';
          throw error;
        }
      }

      // Set ownerId from authenticated user in real implementation
      const finalData = {
        ...validatedData,
        ownerId: validatedData.ownerId || 1
      };

      // Create project
      const project = await projectRepository.create(finalData, client);

      // Invalidate relevant caches after creation
      await this._invalidateProjectCaches();

      return project;
    });
  }

  // Update project with validation and sanitization
  async updateProject(id, projectData) {
    // Validate ID
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    // Check if project exists
    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Validate and sanitize input
    const validatedData = validateAndSanitize(projectData, {
      ...ProjectService.projectValidationSchema,
      name: { ...ProjectService.projectValidationSchema.name, required: false },
      description: { ...ProjectService.projectValidationSchema.description, required: false },
      ownerId: { required: false } // Don't allow changing ownerId in update
    });

    // Verify owner exists if ownerId is being updated
    if (validatedData.ownerId !== undefined) {
      const ownerExists = await projectRepository.checkUserExists(validatedData.ownerId);
      if (!ownerExists) {
        const error = new Error('User not found');
        error.statusCode = 404;
        error.code = 'USER_NOT_FOUND';
        throw error;
      }
    }

    // Update project
    const project = await projectRepository.update(id, {
      name: validatedData.name !== undefined ? validatedData.name.trim() : existingProject.name,
      description: validatedData.description !== undefined ? validatedData.description : existingProject.description
    });

    // Invalidate relevant caches after update
    await this._invalidateProjectCaches(id);

    return project;
  }

  // Update project with transaction
  async updateProjectWithTransaction(id, projectData) {
    return await transaction(async (client) => {
      // Validate ID
      if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('Invalid project ID');
        error.statusCode = 400;
        error.code = 'INVALID_ID';
        throw error;
      }

      // Check if project exists
      const existingProject = await projectRepository.findById(id, client);
      if (!existingProject) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        error.code = 'PROJECT_NOT_FOUND';
        throw error;
      }

      // Validate and sanitize input
      const validatedData = validateAndSanitize(projectData, {
        ...ProjectService.projectValidationSchema,
        name: { ...ProjectService.projectValidationSchema.name, required: false },
        description: { ...ProjectService.projectValidationSchema.description, required: false },
        ownerId: { required: false }
      });

      // Verify owner exists if ownerId is being updated
      if (validatedData.ownerId !== undefined) {
        const ownerExists = await projectRepository.checkUserExists(validatedData.ownerId, client);
        if (!ownerExists) {
          const error = new Error('User not found');
          error.statusCode = 404;
          error.code = 'USER_NOT_FOUND';
          throw error;
        }
      }

      // Update project
      const project = await projectRepository.update(id, {
        name: validatedData.name !== undefined ? validatedData.name.trim() : existingProject.name,
        description: validatedData.description !== undefined ? validatedData.description : existingProject.description
      }, client);

      // Invalidate relevant caches after update
      await this._invalidateProjectCaches(id);

      return project;
    });
  }

  // Delete project
  async deleteProject(id) {
    // Validate ID is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid project ID');
      error.statusCode = 400;
      error.code = 'INVALID_ID';
      throw error;
    }

    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    // Delete project
    await projectRepository.delete(id);

    // Invalidate relevant caches after deletion
    await this._invalidateProjectCaches(id);

    return { id }; // Return deleted project ID
  }

  // Delete project with transaction
  async deleteProjectWithTransaction(id) {
    return await transaction(async (client) => {
      // Validate ID is a positive integer
      if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('Invalid project ID');
        error.statusCode = 400;
        error.code = 'INVALID_ID';
        throw error;
      }

      const existingProject = await projectRepository.findById(id, client);
      if (!existingProject) {
        const error = new Error('Project not found');
        error.statusCode = 404;
        error.code = 'PROJECT_NOT_FOUND';
        throw error;
      }

      // Delete project
      await projectRepository.delete(id, client);

      // Invalidate relevant caches after deletion
      await this._invalidateProjectCaches(id);

      return { id }; // Return deleted project ID
    });
  }

  // Private method to invalidate project-related caches
  async _invalidateProjectCaches(projectId = null) {
    try {
      // Always invalidate all projects list
      await cacheDel(CACHE_KEYS.ALL_PROJECTS);

      // If specific project ID provided, invalidate that project's cache
      if (projectId !== null) {
        await cacheDel(getCacheKey(CACHE_KEYS.PROJECT_BY_ID, projectId));
        // Also invalidate projects by owner for this project (would need to fetch owner first)
        // For simplicity, we're invalidating all owner-based caches too
        await cacheDelMatchingPattern(CACHE_KEYS.PROJECTS_BY_OWNER + '*');
      }

      // Note: In a real application, you might want to be more specific about cache invalidation
      // For now, we're doing broad invalidation to ensure consistency
    } catch (error) {
      console.warn('Failed to invalidate project caches:', error.message);
      // Don't throw error - cache failure shouldn't break the operation
    }
  }

  // Helper to delete keys matching a pattern (Redis SCAN operation)
  async _deleteMatchingPattern(pattern) {
    try {
      // Note: This is a simplified implementation
      // In production, you'd use Redis SCAN for production safety
      // For now, we'll skip this as it requires more complex implementation
      // and may impact performance on large datasets
      console.log(`Would delete keys matching pattern: ${pattern}`);
    } catch (error) {
      console.warn('Failed to delete keys matching pattern:', error.message);
    }
  }
}

export default new ProjectService();