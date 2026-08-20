# Concept 13: Relational Schema Design with Primary Keys (PK) & Foreign Keys (FK)

## Definition
A relational database schema structures application entities into tables with strict integrity rules. **Primary Keys (PK)** uniquely identify every row in a table. **Foreign Keys (FK)** enforce referential integrity across tables by guaranteeing that child records strictly reference existing parent records.

---

## Hexa Relational Schema Architecture

**Database Schema File**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql)

### 1. `users` Table
- `id` (`SERIAL PRIMARY KEY`): Unique integer identifier for each system user.
- `name` (`VARCHAR(255) NOT NULL`): User display name.
- `email` (`VARCHAR(255) NOT NULL UNIQUE`): Unique email address.

### 2. `projects` Table
- `id` (`SERIAL PRIMARY KEY`): Unique project identifier.
- `name` (`VARCHAR(255) NOT NULL`): Project title.
- `owner_id` (`INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE`): **Foreign Key** pointing to `users.id`.

### 3. `tasks` Table
- `id` (`SERIAL PRIMARY KEY`): Unique task identifier.
- `title` (`VARCHAR(255) NOT NULL`): Task title.
- `status` (`VARCHAR(50) NOT NULL DEFAULT 'todo'`): Task status (`todo`, `in_progress`, `completed`).
- `project_id` (`INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE`): **Foreign Key** pointing to `projects.id`.
- `created_by` (`INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL`): **Foreign Key** pointing to `users.id`.

---

## Relationship Cardinality

```text
  users (1)  ──────< projects (N)   [owner_id FK → users.id]
  projects (1) ───< tasks (N)      [project_id FK → projects.id]
  users (1)  ──────< tasks (N)      [created_by FK → users.id]
```

1. **User → Projects (1 : N)**: One user can own multiple projects (`projects.owner_id`).
2. **Project → Tasks (1 : N)**: One project contains multiple tasks (`tasks.project_id`).
3. **User → Tasks (1 : N)**: One user can create multiple tasks (`tasks.created_by`).

---

## Real SQL JOIN Query from Hexa Backend

**Repository File**: [`server/src/repositories/taskRepository.js`](file:///c:/Users/hardi/Hexa/server/src/repositories/taskRepository.js#L17-L33)

```sql
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
JOIN projects p ON t.project_id = p.id
JOIN users u ON t.created_by = u.id
ORDER BY t.created_at DESC;
```

---

## Viva Reviewer Questions & Answers

**Q: Why is each PK needed?**  
**A**: PKs provide an immutable, unique identifier for every row in `users`, `projects`, and `tasks`. This allows exact row retrieval, updates, and deletes without ambiguity.

**Q: Why is each FK needed and what data integrity does it enforce?**  
**A**: FKs (`projects.owner_id`, `tasks.project_id`, `tasks.created_by`) enforce referential integrity at the database level. PostgreSQL prevents inserting a task with a non-existent `project_id` or `created_by`.

**Q: What would happen without FK constraints?**  
**A**: Without FKs, "orphan rows" would occur. If a project was deleted, tasks referencing its ID would remain stranded in the database without a parent project.

**Q: What trade-offs does relational integrity introduce?**  
**A**:
- **Cascading & Lock Overhead**: `ON DELETE CASCADE` requires PostgreSQL to check and delete dependent rows upon deletion.
- **Write Latency**: Every `INSERT` into `tasks` requires verifying that `project_id` exists in `projects` and `created_by` exists in `users`.

**Q: Why choose relational design over duplicating user/project data inside tasks?**  
**A**: Relational normalization prevents data duplication and inconsistency. If a project or user updates their name, it instantly reflects across all associated tasks without needing bulk updates across millions of task records.