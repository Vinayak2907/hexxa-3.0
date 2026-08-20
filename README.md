# Hexa — Full-Stack Engineering Learning & Task Platform

Hexa is a production-style full-stack task and project management application built with React, Node.js, Express, and PostgreSQL. It demonstrates 13 mandatory engineering concepts through real, working code that can be explained during a technical viva examination.

## Why Hexa

Hexa is not just a collection of code examples—it's a coherent application where all 13 mandatory concepts naturally exist as part of the architecture. When an examiner reviews Hexa, they should think:

> "This student understands how frontend, backend, JavaScript, React, HTTP, Git, and relational databases work together."

Not:

> "This student created 13 random code snippets."

## Features

- **Dashboard** — Overview of tasks and projects with statistics
- **Task Management** — Create, read, update, delete tasks
- **Project Management** — Organize tasks into projects
- **Filtering** — Filter tasks by status using JavaScript closures
- **Loading/Error States** — Proper UX handling
- **Concept Center** — Interactive demonstrations of all 13 concepts
- **REST API** — Full backend API with proper HTTP semantics

## Architecture

```
React (Frontend)
    │
    ▼
React Router (Client-side routing)
    │
    ▼
API Layer (async/await, fetch)
    │
    ▼
Express API
    │
    ├── Controllers
    ├── Services (validation, business logic)
    └── Repositories (PostgreSQL queries)
            │
            ▼
    PostgreSQL (PK/FK relationships)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Package Manager | npm |

## Project Structure

```
hexa/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API layer (async/await)
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── demos/         # JavaScript concept demos
│   │   ├── utils/         # Utilities (closure filter)
│   │   ├── App.jsx        # Router setup
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Environment configuration
│   │   ├── db/            # Database connection pool
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # HTTP request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # SQL queries
│   │   ├── middleware/    # Error handling
│   │   ├── app.js         # Express app
│   │   └── server.js      # Entry point
│   └── package.json
│
├── database/               # PostgreSQL
│   ├── schema.sql         # Table definitions (PK/FK)
│   └── seed.sql           # Sample data
│
├── docs/                   # Documentation
│   ├── concepts/          # 13 concept docs
│   ├── API.md             # API reference
│   ├── ARCHITECTURE.md    # System design
│   ├── VIVA.md            # Detailed viva guide
│   └── VIVA-CHEATSHEET.md # Quick reference
│
├── .env.example           # Environment template
├── .gitignore             # Excludes secrets
└── package.json           # Root scripts
```

## Database Schema

### Relationships

```
users (PK: id)
  │
  ├── projects (FK: owner_id → users.id)
  │     │
  │     └── tasks (FK: project_id → projects.id)
  │
  └── tasks (FK: created_by → users.id)
```

### Tables

- **users** — System users (id, name, email)
- **projects** — Projects owned by users (id, name, description, owner_id FK)
- **tasks** — Tasks in projects (id, title, description, status, project_id FK, created_by FK)

## API Endpoints

### Tasks
| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | /api/tasks | 200 | Get all tasks |
| GET | /api/tasks/:id | 200 | Get task by ID |
| POST | /api/tasks | 201 | Create new task |
| PUT | /api/tasks/:id | 200 | Update task |
| DELETE | /api/tasks/:id | 204 | Delete task |

### Projects
| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | /api/projects | 200 | Get all projects |
| GET | /api/projects/:id | 200 | Get project by ID |
| POST | /api/projects | 201 | Create project |
| PUT | /api/projects/:id | 200 | Update project |
| DELETE | /api/projects/:id | 204 | Delete project |

## Mandatory Concepts

All 13 concepts are implemented and runtime-verifiable:

| # | Concept | Implementation |
|---|---------|----------------|
| 1 | HTTP Status Codes | Correct 200/201/204/400/404/500 |
| 2 | Environment Variables | dotenv, .env.example, validation |
| 3 | Git Workflow | Real branches and commits |
| 4 | Async API Fetching | fetch + async/await |
| 5 | Client-Side Routing | React Router |
| 6 | async/await | All API functions |
| 7 | Closures | Task filter utility |
| 8 | Event Loop | Interactive demo |
| 9 | Hoisting | Interactive demo |
| 10 | Promises vs Callbacks | Interactive demo |
| 11 | React Composition | Reusable components |
| 12 | useState | State management |
| 13 | PostgreSQL PK/FK | Schema with relationships |

## Concept Demonstration Center

Visit `/concepts` in the running application to see all 13 concepts with:
- Implementation locations
- Runtime demonstrations
- File references
- Explanation for viva

Interactive demos available at:
- `/concepts/event-loop` — Event loop behavior
- `/concepts/hoisting` — Hoisting demonstration
- `/concepts/promises` — Promise vs callback patterns

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/hexa
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Important**: Never commit `.env` file. It contains secrets.

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Steps

1. **Clone and install dependencies**
   ```bash
   cd hexa
   npm install
   npm run install:all
   ```

2. **Set up PostgreSQL**
   ```bash
   # Create database
   createdb hexa
   
   # Run schema
   psql -d hexa -f database/schema.sql
   
   # Seed data
   psql -d hexa -f database/seed.sql
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend
   npm run dev:server
   
   # Terminal 2: Start frontend
   npm run dev:client
   ```

5. **Open browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## Running the Application

### Development Mode
```bash
# Start both servers concurrently
npm run dev
```

### Individual Servers
```bash
# Backend only (requires PostgreSQL)
npm run dev:server

# Frontend only
npm run dev:client
```

## Testing

The API can be tested with curl:

```bash
# Get all tasks
curl http://localhost:5000/api/tasks

# Create task (returns 201)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"todo","projectId":1}'

# Try invalid request (returns 400)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{}'

# Request missing task (returns 404)
curl http://localhost:5000/api/tasks/99999

# Delete task (returns 204)
curl -X DELETE http://localhost:5000/api/tasks/1
```

## Git Workflow

This project uses a feature branch workflow:

```
main
  ├── feature/database-schema
  ├── feature/backend-api
  ├── feature/frontend-routing
  ├── feature/task-management-ui
  ├── feature/concept-demos
  └── docs/documentation
```

### Commit Messages
- `feat: add PostgreSQL relational schema with PK/FK`
- `feat: add task CRUD API endpoints`
- `feat: add React client routing with React Router`
- `feat: add task management UI components`
- `feat: add JavaScript concept demonstrations`

## Viva Preparation

### Quick Reference
See `docs/VIVA-CHEATSHEET.md` for a quick reference of all concepts.

### Detailed Guide
See `docs/VIVA.md` for comprehensive answers to common viva questions.

### Concept Coverage
See `docs/CONCEPT-COVERAGE-MATRIX.md` for verification status.

## License

MIT