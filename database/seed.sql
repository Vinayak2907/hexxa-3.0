-- Hexa Database Seed Data
-- Populates initial data for development and testing

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john.doe@hexa.com'),
  ('Jane Smith', 'jane.smith@hexa.com'),
  ('Alice Johnson', 'alice.j@hexa.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PROJECTS
-- ============================================
INSERT INTO projects (name, description, owner_id) VALUES 
  ('Hexa Platform', 'Full-stack task management platform built with React, Node.js, and PostgreSQL', 1),
  ('Mobile App', 'Cross-platform mobile application for task management', 1),
  ('API Integration', 'Third-party API integrations and webhooks', 2),
  ('Documentation', 'Technical documentation and API reference', 2),
  ('Testing Suite', 'Comprehensive test coverage and automation', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- TASKS
-- ============================================
-- Tasks for Hexa Platform (project_id = 1)
INSERT INTO tasks (title, description, status, project_id, created_by) VALUES 
  ('Setup project structure', 'Initialize React frontend and Express backend', 'completed', 1, 1),
  ('Implement database schema', 'Create PostgreSQL tables with PK/FK relationships', 'completed', 1, 1),
  ('Build REST API endpoints', 'Create CRUD operations for tasks and projects', 'completed', 1, 1),
  ('Add authentication', 'Implement JWT-based user authentication', 'in_progress', 1, 1),
  ('Create dashboard UI', 'Build main dashboard with task overview', 'todo', 1, 2);

-- Tasks for Mobile App (project_id = 2)
INSERT INTO tasks (title, description, status, project_id, created_by) VALUES 
  ('Design mobile UI', 'Create responsive design for mobile devices', 'completed', 2, 1),
  ('Setup React Native', 'Initialize React Native project', 'completed', 2, 1),
  ('Implement offline sync', 'Add local storage and sync capabilities', 'in_progress', 2, 2),
  ('Push notifications', 'Integrate push notification service', 'todo', 2, 3);

-- Tasks for API Integration (project_id = 3)
INSERT INTO tasks (title, description, status, project_id, created_by) VALUES 
  ('Research third-party APIs', 'Identify and evaluate external services', 'completed', 3, 2),
  ('Implement webhook handlers', 'Create endpoints for incoming webhooks', 'in_progress', 3, 2),
  ('Rate limiting', 'Add API rate limiting and throttling', 'todo', 3, 2);

-- Tasks for Documentation (project_id = 4)
INSERT INTO tasks (title, description, status, project_id, created_by) VALUES 
  ('Write API documentation', 'Document all REST endpoints', 'completed', 4, 2),
  ('Create user guide', 'Write comprehensive user manual', 'in_progress', 4, 3);

-- Tasks for Testing Suite (project_id = 5)
INSERT INTO tasks (title, description, status, project_id, created_by) VALUES 
  ('Setup test framework', 'Configure Jest and React Testing Library', 'completed', 5, 3),
  ('Write unit tests', 'Create tests for utility functions', 'completed', 5, 3),
  ('Integration tests', 'Test API endpoints and database operations', 'in_progress', 5, 3),
  ('End-to-end testing', 'Implement Cypress E2E tests', 'todo', 5, 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Show all users
SELECT 'Users created:' AS info, COUNT(*) AS count FROM users;

-- Show all projects with owner
SELECT 'Projects created:' AS info, COUNT(*) AS count FROM projects;

-- Show all tasks with status
SELECT 'Tasks created:' AS info, COUNT(*) AS count FROM tasks;

-- Show task distribution by status
SELECT 
  status,
  COUNT(*) AS count
FROM tasks
GROUP BY status
ORDER BY status;

-- Show JOIN example: tasks with project and user info
SELECT 
  t.id,
  t.title,
  t.status,
  p.name AS project_name,
  u.name AS created_by
FROM tasks t
JOIN projects p ON t.project_id = p.id
JOIN users u ON t.created_by = u.id
LIMIT 5;