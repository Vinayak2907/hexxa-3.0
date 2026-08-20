// Task Repository - Database operations for tasks
// This module handles all direct database interactions for task data

import { query } from '../db/pool.js';

class TaskRepository {
  // Helper function to execute query with optional transaction client
  _executeQuery(text, params, client) {
    if (client) {
      return client.query(text, params);
    }
    return query(text, params);
  }

  // Get all tasks with project and creator info
  async findAll(client) {
    const sql = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.project_id,
        t.created_by,
        t.created_at,
        t.updated_at,
        p.name AS project_name,
        u.name AS created_by_name
      FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id
      INNER JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `;
    const result = await this._executeQuery(sql, [], client);
    return result.rows;
  }

  // Get single task by ID
  async findById(id, client) {
    const sql = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.project_id,
        t.created_by,
        t.created_at,
        t.updated_at,
        p.name AS project_name,
        u.name AS created_by_name
      FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id
      INNER JOIN users u ON t.created_by = u.id
      WHERE t.id = $1
    `;
    const result = await this._executeQuery(sql, [id], client);
    return result.rows[0];
  }

  // Get tasks by project ID
  async findByProjectId(projectId, client) {
    const sql = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.project_id,
        t.created_by,
        t.created_at,
        t.updated_at,
        p.name AS project_name,
        u.name AS created_by_name
      FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id
      INNER JOIN users u ON t.created_by = u.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `;
    const result = await this._executeQuery(sql, [projectId], client);
    return result.rows;
  }

  // Check if project exists
  async checkProjectExists(projectId, client) {
    const sql = 'SELECT id FROM projects WHERE id = $1';
    const result = await this._executeQuery(sql, [projectId], client);
    return result.rowCount > 0;
  }

  // Create new task
  async create(taskData, client) {
    const sql = `
      INSERT INTO tasks (title, description, status, project_id, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, title, description, status, project_id, created_by, created_at, updated_at
    `;
    const { title, description, status, projectId, createdBy } = taskData;
    const result = await this._executeQuery(sql, [title, description, status, projectId, createdBy], client);
    return result.rows[0];
  }

  // Update existing task
  async update(id, taskData, client) {
    const sql = `
      UPDATE tasks
      SET title = $1, description = $2, status = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, title, description, status, project_id, created_by, created_at, updated_at
    `;
    const { title, description, status } = taskData;
    const result = await this._executeQuery(sql, [title, description, status, id], client);
    return result.rows[0];
  }

  // Delete task
  async delete(id, client) {
    const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
    const result = await this._executeQuery(sql, [id], client);
    return result.rows[0];
  }
}

export default new TaskRepository();