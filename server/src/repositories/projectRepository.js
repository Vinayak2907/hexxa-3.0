// Project Repository - Database operations for projects
// Handles all direct database interactions for project data

import { query } from '../db/pool.js';

class ProjectRepository {
  // Helper function to execute query with optional transaction client
  _executeQuery(text, params, client) {
    if (client) {
      return client.query(text, params);
    }
    return query(text, params);
  }

  // Get all projects with owner info
  async findAll(client) {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.owner_id,
        p.created_at,
        u.name AS owner_name,
        COUNT(t.id) AS task_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `;
    const result = await this._executeQuery(sql, [], client);
    return result.rows;
  }

  // Get single project by ID with task count
  async findById(id, client) {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.owner_id,
        p.created_at,
        u.name AS owner_name,
        COUNT(t.id) AS task_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, u.name
    `;
    const result = await this._executeQuery(sql, [id], client);
    return result.rows[0];
  }

  // Get projects by owner ID
  async findByOwnerId(ownerId, client) {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.owner_id,
        p.created_at,
        u.name AS owner_name,
        COUNT(t.id) AS task_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.owner_id = $1
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `;
    const result = await this._executeQuery(sql, [ownerId], client);
    return result.rows;
  }

  // Check if user exists
  async checkUserExists(userId, client) {
    const sql = 'SELECT id FROM users WHERE id = $1';
    const result = await this._executeQuery(sql, [userId], client);
    return result.rowCount > 0;
  }

  // Create new project
  async create(projectData, client) {
    const sql = `
      INSERT INTO projects (name, description, owner_id, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, name, description, owner_id, created_at
    `;
    const { name, description, ownerId } = projectData;
    const result = await this._executeQuery(sql, [name, description, ownerId], client);
    return result.rows[0];
  }

  // Update existing project
  async update(id, projectData, client) {
    const sql = `
      UPDATE projects
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING id, name, description, owner_id, created_at
    `;
    const { name, description } = projectData;
    const result = await this._executeQuery(sql, [name, description, id], client);
    return result.rows[0];
  }

  // Delete project
  async delete(id, client) {
    const sql = 'DELETE FROM projects WHERE id = $1 RETURNING id';
    const result = await this._executeQuery(sql, [id], client);
    return result.rows[0];
  }
}

export default new ProjectRepository();