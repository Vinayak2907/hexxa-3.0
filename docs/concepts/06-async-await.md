# Concept 6: JavaScript async/await & Promise Execution Models

## Definition
`async/await` is syntactic sugar built on top of native JavaScript Promises. The `async` keyword ensures a function returns a Promise, while `await` pauses execution within the `async` function until the Promise settles (resolves or rejects), all without blocking the single-threaded JavaScript Event Loop.

---

## Primary Repository Evidence

**Files**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js), [`client/src/pages/Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx#L20-L40)

```javascript
// client/src/pages/Dashboard.jsx
useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);
      // Parallel execution via Promise.all
      const [projectsData, tasksData] = await Promise.all([
        getProjects(),
        getTasks()
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  loadDashboardData();
}, []);
```

---

## Sequential Execution vs Parallel Execution (`Promise.all`)

### 1. Sequential Execution (Dependent Requests)
When Request B depends on data returned by Request A, calls must be awaited sequentially:

```javascript
// Sequential: Total duration = Time(Project) + Time(Tasks)
const project = await getProject(projectId); // Wait for project details first
const tasks = await getTasksByProject(project.id); // Dependent query requiring project.id
```

### 2. Parallel Execution (Independent Requests)
When requests are independent, executing them concurrently using `Promise.all` reduces total latency:

```javascript
// Parallel: Total duration = Max(Time(Projects), Time(Tasks))
const [projects, tasks] = await Promise.all([
  getProjects(),
  getTasks()
]);
```

---

## Error Handling with try/catch

Rejected Promises are handled using standard synchronous `try/catch` syntax:

```javascript
try {
  const data = await getProject(id);
} catch (error) {
  console.error('Fetch failed with status:', error.status);
}
```

---

## Viva Reviewer Questions & Answers

**Q: Where is async/await used in real Hexa code?**  
**A**: In `client/src/api/projectApi.js` for API request functions and in `Dashboard.jsx` inside the `loadDashboardData()` effect handler.

**Q: When would you use sequential awaits vs Promise.all?**  
**A**: Use sequential `await` when Request B requires data from Request A (e.g. `getTasksByProject(project.id)`). Use `Promise.all` when requests are independent (e.g. fetching projects and tasks simultaneously on `Dashboard.jsx`).

**Q: Does await block the JavaScript main thread?**  
**A**: No. `await` pauses execution inside the `async` function scope, allowing the Event Loop to continue processing user inputs and microtasks until the Promise resolves.