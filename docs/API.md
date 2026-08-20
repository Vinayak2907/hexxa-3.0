# Hexa API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Tasks

#### GET /api/tasks
Get all tasks with project and creator information.

**Response 200 OK**
```json
[
  {
    "id": 1,
    "title": "Build API",
    "description": "Create REST API endpoints",
    "status": "completed",
    "project_id": 1,
    "created_by": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "project_name": "Hexa Platform",
    "created_by_name": "John Doe"
  }
]
```

#### GET /api/tasks/:id
Get a single task by ID.

**Response 200 OK**
```json
{
  "id": 1,
  "title": "Build API",
  "description": "Create REST API endpoints",
  "status": "completed",
  "project_id": 1,
  "created_by": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "project_name": "Hexa Platform",
  "created_by_name": "John Doe"
}
```

**Response 404 Not Found**
```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task not found"
  }
}
```

#### GET /api/tasks/project/:projectId
Get all tasks for a specific project.

**Response 200 OK**
```json
[
  {
    "id": 1,
    "title": "Build API",
    "status": "completed",
    "project_id": 1,
    "project_name": "Hexa Platform"
  }
]
```

#### POST /api/tasks
Create a new task.

**Request Body**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "projectId": 1
}
```

**Response 201 Created**
```json
{
  "id": 6,
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "project_id": 1,
  "created_by": 1,
  "created_at": "2024-01-15T14:00:00Z",
  "updated_at": "2024-01-15T14:00:00Z"
}
```

**Response 400 Bad Request**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

#### PUT /api/tasks/:id
Update an existing task.

**Request Body**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress"
}
```

**Response 200 OK**
```json
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress",
  "project_id": 1,
  "created_by": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T15:00:00Z"
}
```

#### DELETE /api/tasks/:id
Delete a task.

**Response 204 No Content**
(No response body)

---

### Projects

#### GET /api/projects
Get all projects with task counts.

**Response 200 OK**
```json
[
  {
    "id": 1,
    "name": "Hexa Platform",
    "description": "Full-stack task management",
    "owner_id": 1,
    "created_at": "2024-01-10T10:00:00Z",
    "owner_name": "John Doe",
    "task_count": 5
  }
]
```

#### GET /api/projects/:id
Get a single project by ID.

**Response 200 OK**
```json
{
  "id": 1,
  "name": "Hexa Platform",
  "description": "Full-stack task management",
  "owner_id": 1,
  "created_at": "2024-01-10T10:00:00Z",
  "owner_name": "John Doe",
  "task_count": 5
}
```

**Response 404 Not Found**
```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found"
  }
}
```

#### POST /api/projects
Create a new project.

**Request Body**
```json
{
  "name": "New Project",
  "description": "Project description",
  "ownerId": 1
}
```

**Response 201 Created**
```json
{
  "id": 6,
  "name": "New Project",
  "description": "Project description",
  "owner_id": 1,
  "created_at": "2024-01-15T14:00:00Z"
}
```

#### PUT /api/projects/:id
Update a project.

**Request Body**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response 200 OK**

#### DELETE /api/projects/:id
Delete a project.

**Response 204 No Content**

---

### Health Check

#### GET /api/health
Check if the API is running.

**Response 200 OK**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK - Successful GET/PUT |
| 201 | Created - Successful POST |
| 204 | No Content - Successful DELETE |
| 400 | Bad Request - Validation error |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Unexpected error |

## Allowed Task Status Values
- `todo`
- `in_progress`
- `completed`