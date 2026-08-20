# Relational Schema Design with Primary Keys & Foreign Keys in Hexa

## Exact Implementation Location
- **File**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql)
- **Database Engine**: PostgreSQL

## Entity Relationship Overview
Hexa models a classic multi-tenant task management system across three core relational tables:

```
+---------------+        1:N        +------------------+        1:N        +---------------+
|     users     | ----------------> |     projects     | ----------------> |     tasks     |
+---------------+                   +------------------+                   +---------------+
| id (PK)       |                   | id (PK)          |                   | id (PK)       |
| name          |                   | name             |                   | title         |
| email (UNIQUE)|                   | owner_id (FK)    |                   | description   |
+---------------+                   +------------------+                   | status        |
        |                                                                  | project_id(FK)|
        +----------------------------------------------------------------> | created_by(FK)|
                                         1:N                               +---------------+
```

## Relational Definitions & Column Mappings

### 1. Primary Keys (PK)
- `users.id SERIAL PRIMARY KEY`: Auto-incrementing unique identifier for each user.
- `projects.id SERIAL PRIMARY KEY`: Auto-incrementing unique identifier for each project.
- `tasks.id SERIAL PRIMARY KEY`: Auto-incrementing unique identifier for each task.

### 2. Foreign Keys (FK) & Referential Integrity
- `projects.owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE`:
  - Enforces that every project belongs to an existing user.
  - `ON DELETE CASCADE`: If a user account is deleted, all projects owned by that user are automatically removed.
- `tasks.project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE`:
  - Enforces that every task belongs to an existing project.
  - `ON DELETE CASCADE`: Deleting a project automatically deletes all child tasks within that project.
- `tasks.created_by INTEGER REFERENCES users(id) ON DELETE SET NULL`:
  - Links the task to the user who created it.
  - `ON DELETE SET NULL`: If the creator user account is deleted, the task is preserved for project history while setting `created_by` to `NULL`.

## Audited Constraint Correctness (Crucial Viva Fix)
> **Constraint Audit**: Previously, `created_by` was declared as `INTEGER NOT NULL ... ON DELETE SET NULL`. This represented an SQL constraint contradiction because setting a `NOT NULL` column to `NULL` upon parent deletion violates database rules.
>
> **Resolution**: `created_by` was modified to be nullable (`INTEGER REFERENCES users(id) ON DELETE SET NULL`), allowing referential deletion without violating table constraints.

## Trade-offs & Normalization
- **Third Normal Form (3NF)**: Data is fully normalized to eliminate redundancy. User emails and project titles are stored once in their primary tables and referenced via integer keys.
- **Cascade vs. Set Null Trade-off**:
  - `projects.owner_id` uses `CASCADE` because orphan projects without an owner are invalid in Hexa.
  - `tasks.created_by` uses `SET NULL` because tasks retain business value for team members even if the original task creator leaves the organization.
