# Concept 14: Database Indexing for Query Performance (PostgreSQL B-Tree Indexes)

## Definition
A database index is a data structure (typically a B-Tree in PostgreSQL) that improves the speed of data retrieval operations on a database table at the cost of additional write overhead and storage space.

---

## Hexa Database Indexing Architecture

**Schema Location**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql#L18-L56)

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
```

---

## Query-to-Index Mapping Matrix

| Index Name | Column | Code Location / Query | Optimization Impact |
| :--- | :--- | :--- | :--- |
| `idx_users_email` | `users(email)` | [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js#L29) <br> `SELECT id, name, email FROM users WHERE email = $1;` | Fast $O(\log N)$ lookup during registration & login checks instead of sequential table scan. High selectivity column. |
| `idx_projects_owner_id` | `projects(owner_id)` | [`server/src/repositories/projectRepository.js`](file:///c:/Users/hardi/Hexa/server/src/repositories/projectRepository.js) <br> `SELECT * FROM projects WHERE owner_id = $1;` | Accelerates dashboard project listings per user. Replaces $O(N)$ full table scan with B-Tree index scan. |
| `idx_tasks_project_id` | `tasks(project_id)` | [`server/src/repositories/taskRepository.js`](file:///c:/Users/hardi/Hexa/server/src/repositories/taskRepository.js#L62-L83) <br> `SELECT * FROM tasks WHERE project_id = $1;` | Optimizes project detail views fetching associated tasks, avoiding table scan across millions of task records. |
| `idx_tasks_created_by` | `tasks(created_by)` | [`server/src/repositories/taskRepository.js`](file:///c:/Users/hardi/Hexa/server/src/repositories/taskRepository.js#L31) <br> `JOIN users u ON t.created_by = u.id` | Speeds up JOIN operations between `tasks` and `users` tables. |
| `idx_tasks_status` | `tasks(status)` | Filtering queries by status (`todo`, `in_progress`, `completed`). | Speeds up status-filtered dashboard counts. Moderate selectivity. |

---

## Query Execution Plan (EXPLAIN ANALYZE Example)

Without Index (`tasks` full table scan):
```text
Seq Scan on tasks  (cost=0.00..35.50 rows=10 width=120)
  Filter: (project_id = 1)
```

With Index (`idx_tasks_project_id` B-Tree Index Scan):
```text
Index Scan using idx_tasks_project_id on tasks  (cost=0.15..8.17 rows=10 width=120)
  Index Cond: (project_id = 1)
```

---

## Indexing Trade-Offs & Selective Indexing Guidelines

### 1. Write Overhead
Every `INSERT`, `UPDATE`, or `DELETE` on indexed columns requires PostgreSQL to maintain and update the corresponding B-Tree index structure. High-frequency writes suffer performance degradation if too many columns are indexed.

### 2. Storage Costs
Indexes reside in memory (RAM buffer pool) and disk space. Unnecessary indexes consume precious RAM, reducing space available for active data caching.

### 3. Selectivity Discussion
- **High Selectivity** (e.g. `email`): Unique or highly distinct values. Indexes are extremely effective here because they narrow down results to 1 or few rows.
- **Low Selectivity** (e.g. `boolean` flags): Values with low cardinality (e.g. `true`/`false`). Indexes on low-selectivity columns are often ignored by the PostgreSQL Query Planner in favor of sequential scans.

---

## Viva Reviewer Questions & Answers

**Q: Which exact query does idx_tasks_project_id optimize in Hexa?**  
**A**: In `server/src/repositories/taskRepository.js`, the query `SELECT * FROM tasks WHERE project_id = $1` filters tasks by project. `idx_tasks_project_id` replaces a $O(N)$ sequential scan with a logarithmic $O(\log N)$ B-Tree index scan.

**Q: Why shouldn't you index every single column in a database table?**  
**A**: Indexing every column imposes severe write overhead during `INSERT`/`UPDATE`/`DELETE` queries (since every index B-Tree must be updated) and wastes RAM buffer pool memory on low-selectivity columns.

**Q: What is column selectivity?**  
**A**: Column selectivity measures the proportion of distinct values in a column relative to total rows. `users.email` has 100% selectivity (unique), making it ideal for indexing, whereas a boolean field has low selectivity.
