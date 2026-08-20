# JavaScript async/await in Hexa

## Exact Implementation Location
- **Parallel Independent Fetching**: [`client/src/pages/Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx#L24-L27)
- **API Service Invocation**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) & [`client/src/api/taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js)

## Practical Application in Dashboard
When the Hexa Dashboard initializes, it requires both tasks and projects data. Because tasks data and projects data do NOT depend on each other, fetching them sequentially with two separate `await` statements would cause an unnecessary waterfall delay ($T_{\text{tasks}} + T_{\text{projects}}$).

Hexa leverages `Promise.all` with `async/await` to perform parallel execution:

```javascript
useEffect(() => {
  async function fetchData() {
    try {
      // Execute independent HTTP requests in parallel
      const [tasksData, projectsData] = await Promise.all([
        getTasks(),
        getProjects()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

## Performance & Readability Trade-off

| Pattern | Code Example | Execution Time | Use Case |
|---|---|---|---|
| Sequential `await` | `const tasks = await getTasks();`<br/>`const projects = await getProjects();` | $T_1 + T_2$ (Waterfall) | **Dependent Requests**: e.g., fetching a user profile first, then fetching projects using `user.id`. |
| Parallel `Promise.all` | `const [t, p] = await Promise.all([getTasks(), getProjects()]);` | $\max(T_1, T_2)$ (Optimized) | **Independent Requests**: e.g., Dashboard loading projects list and tasks list simultaneously. |

## Error Handling Pattern
The `try ... catch ... finally` construct cleanly catches any rejection in the `Promise.all` tuple or underlying `fetch()` network failures, ensuring `loading` state is reliably turned off in the `finally` block regardless of success or failure.
