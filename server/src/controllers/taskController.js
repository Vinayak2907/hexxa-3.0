// Task Controller - HTTP request handlers for tasks
// Handles incoming HTTP requests and sends appropriate responses

import taskService from '../services/taskService.js';

class TaskController {
  // GET /api/tasks - Get all tasks
  async getAllTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks();
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/:id - Get single task
  async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(parseInt(id));
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/project/:projectId - Get tasks by project
  async getTasksByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const tasks = await taskService.getTasksByProject(parseInt(projectId));
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/tasks - Create new task
  async createTask(req, res, next) {
    try {
      // Using transaction-based method to demonstrate atomic operations
      const task = await taskService.createTaskWithTransaction(req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/tasks/:id - Update task
  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskService.updateTask(parseInt(id), req.body);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/tasks/:id - Delete task
  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(parseInt(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();