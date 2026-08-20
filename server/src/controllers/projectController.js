// Project Controller - HTTP request handlers for projects
// Handles incoming HTTP requests and sends appropriate responses

import projectService from '../services/projectService.js';

class ProjectController {
  // GET /api/projects - Get all projects
  async getAllProjects(req, res, next) {
    try {
      const projects = await projectService.getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/:id - Get single project
  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(parseInt(id));
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/owner/:ownerId - Get projects by owner
  async getProjectsByOwner(req, res, next) {
    try {
      const { ownerId } = req.params;
      const projects = await projectService.getProjectsByOwner(parseInt(ownerId));
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects - Create new project
  async createProject(req, res, next) {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/projects/:id - Update project
  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.updateProject(parseInt(id), req.body);
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/projects/:id - Delete project
  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      await projectService.deleteProject(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();