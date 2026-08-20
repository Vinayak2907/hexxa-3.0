# SQL Indexing for Query Performance in Hexa

## Exact Implementation Location
- **File**: [`database/schema.sql`](file:///c:/Users/hardi/Hexa/database/schema.sql)
- **Database Engine**: PostgreSQL B-Tree Indexes

## Real Query-Driven Indexes

Rather than adding arbitrary indexes, Hexa's database indexes are directly designed around frequent application queries:

```sql
-- 1. Index for fetching projects by owner
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- 2. Index for fetching tasks within a specific project
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- 3. Index for fetching tasks created by a specific user
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- 4. Index for filtering tasks by status (todo, in_progress, completed)
CREATE INDEX idx_tasks_status ON tasks(status);

-- 5. Index for fast email lookup during login/user authentication
CREATE INDEX idx_users_email ON users(email);
```

## Query Optimization Analysis

### Example 1: Project Task Retrieval
**Application Query**:
```sql
SELECT t.*, p.name as project_name 
FROM tasks t 
JOIN projects p ON t.project_id = p.id 
WHERE t.project_id = $1;
```
- **Without Index**: PostgreSQL performs a Full Table Scan (Sequential Scan `Seq Scan`) over all tasks in the table, examining $O(N)$ rows.
- **With `idx_tasks_project_id`**: PostgreSQL uses an Index Scan (`Index Scan`), navigating the B-Tree in $O(\log N)$ time to fetch only matching project tasks.

### Example 2: Status Filtering
**Application Query**:
```sql
SELECT * FROM tasks WHERE status = 'in_progress';
```
- **Without Index**: $O(N)$ sequential scan across all task records.
- **With `idx_tasks_status`**: B-Tree lookup quickly locates tasks matching the low-cardinality status enum.

## Trade-offs & Engineering Considerations
1. **Lookup Speed vs. Write Overhead**:
   - Indexes dramatically speed up `SELECT` queries.
   - However, every `INSERT`, `UPDATE`, or `DELETE` requires updating both the heap table and all associated B-Tree index structures.
2. **Storage Cost**: Each index consumes RAM and disk space.
3. **Selectivity**: High-selectivity columns (like `users.email` or `tasks.project_id`) yield huge performance gains compared to low-selectivity columns on tiny datasets.
