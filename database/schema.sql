-- Hexa Database Schema
-- PostgreSQL relational database schema for task and project management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Primary entity representing system users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- PROJECTS TABLE
-- ============================================
-- Projects owned by users (one-to-many: user → projects)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for project owner lookups
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- ============================================
-- TASKS TABLE
-- ============================================
-- Tasks belong to projects and are created by users
-- Demonstrates one-to-many relationships: project → tasks, user → tasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common query patterns
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================
-- CONSTRAINTS
-- ============================================
-- Ensure status is one of the allowed values
ALTER TABLE tasks 
ADD CONSTRAINT chk_task_status 
CHECK (status IN ('todo', 'in_progress', 'completed'));

-- ============================================
-- COMMENTS
-- ============================================
-- Users: Contains system users (John Doe, Jane Smith)
-- Projects: Belongs to a user (owner_id FK → users.id)
-- Tasks: Belongs to a project (project_id FK → projects.id) 
--        and created by a user (created_by FK → users.id)
-- 
-- Relationships:
--   users (1) ──────< projects (N)   - One user owns many projects
--   projects (1) ───< tasks (N)      - One project has many tasks
--   users (1) ──────< tasks (N)      - One user creates many tasks