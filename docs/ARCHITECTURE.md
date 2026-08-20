# Hexa Architecture Documentation

## Overview

Hexa is a full-stack task and project management application built with React, Node.js, Express, and PostgreSQL. It demonstrates 13 mandatory engineering concepts through real, working code.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │ Components  │  │  API Layer          │ │
│  │ - Dashboard │  │ - Layout    │  │ - taskApi.js        │ │
│  │ - Tasks     │  │ - Navbar    │  │ - projectApi.js     │ │
│  │ - Projects  │  │ - TaskCard  │  │                     │ │
│  │ - Concepts  │  │ - TaskList  │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │ fetch() / async/await
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Routes    │  │ Controllers │  │  Services           │ │
│  │ - taskRoutes│  │ - taskCtrl  │  │ - taskService       │ │
│  │ - projectRt │  │ - projectC  │  │ - projectService    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Middleware │  │   Config    │  │  Error Handling     │ │
│  │ - errorHdlr │  │ - env.js    │  │ - centralized       │ │
│  │ - notFound  │  │             │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Repository │  │   Pool      │  │  Schema             │ │
│  │ - taskRepo  │  │ - pg Pool   │  │ - users (PK)        │ │
│  │ - projectR  │  │ - queries   │  │ - projects (FK)     │ │
│  └─────────────┘  └─────────────┘  │ - tasks (FK)        │ │
│                                     └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Request Lifecycle

```
User Action (Click)
      │
      ▼
React Component
      │
      ▼
API Function (async/await)
      │
      ▼
fetch() call
      │
      ▼
Express Route
      │
      ▼
Controller (validates, calls service)
      │
      ▼
Service (business logic)
      │
      ▼
Repository (SQL queries)
      │
      ▼
PostgreSQL Database
      │
      ▼
Response flows back up
      │
      ▼
React State Update
      │
      ▼
UI Re-render
```

## Error Lifecycle

```
Database Error / Validation Error
      │
      ▼
Service throws error with statusCode
      │
      ▼
Controller catches, passes to next()
      │
      ▼
Error Middleware
      │
      ▼
JSON Error Response (statusCode + message)
      │
      ▼
React catches in try/catch
      │
      ▼
Error State → ErrorState Component
```

## Frontend Architecture

### Component Hierarchy

```
App
 └── Layout (BrowserRouter)
      └── Navbar
      └── PageContainer
           ├── Dashboard
           │    ├── StatsGrid
           │    ├── TaskList
           │    └── ProjectsGrid
           │
           ├── Tasks
           │    ├── TaskControls (filter)
           │    └── TaskList
           │         └── TaskCard
           │
           ├── TaskDetails
           │    └── TaskForm (edit mode)
           │
           ├── Projects
           │    └── ProjectCard
           │
           └── Concepts
                └── ConceptCard
```

### State Management

- **useState**: Local component state (tasks, loading, error, filters)
- **useEffect**: Data fetching on mount and dependency changes

### Routing

- React Router v6
- BrowserRouter for SPA behavior
- Dynamic route parameters (`:id`)

## Backend Architecture

### Layer Separation

1. **Routes**: Define endpoints, map to controllers
2. **Controllers**: Handle HTTP requests/responses
3. **Services**: Business logic, validation
4. **Repositories**: Database queries, SQL
5. **Middleware**: Error handling, CORS
6. **Config**: Environment variables

### Why This Separation?

- **Routes**: Only handle URL mapping
- **Controllers**: HTTP concerns only
- **Services**: Reusable business logic
- **Repositories**: Database abstraction
- **Separation of concerns**: Easy to test, maintain, modify

## Database Architecture

### Tables

```sql
users (PK: id)
  │
  ├── projects (FK: owner_id → users.id)
  │     │
  │     └── tasks (FK: project_id → projects.id)
  │
  └── tasks (FK: created_by → users.id)
```

### Keys

- **Primary Keys**: `users.id`, `projects.id`, `tasks.id`
- **Foreign Keys**: `projects.owner_id`, `tasks.project_id`, `tasks.created_by`
- **Indexes**: On FK columns for query performance

### JOIN Queries

The application uses JOINs to fetch related data:
- Tasks with project name
- Tasks with creator name
- Projects with task counts
- Projects with owner name

## Environment Configuration

```
.env (local, not committed)
  │
  ├── PORT=5000
  ├── DATABASE_URL=postgresql://...
  ├── CLIENT_URL=http://localhost:5173
  └── NODE_ENV=development

.env.example (template, committed)
  │
  └── Documents required variables
```

## Security Considerations

- **Environment variables**: Secrets in .env, not committed
- **SQL Injection**: Parameterized queries (not string concatenation)
- **Error messages**: Safe responses, no stack traces in production
- **CORS**: Configured for specific client origin
- **Validation**: Input validation at service layer

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Package Manager | npm |
| Build Tools | Vite (frontend), Node (backend) |