# Async Data Fetching from API in Hexa

## Exact Implementation Location
- **Service Layer**: [`client/src/api/projectApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/projectApi.js) & [`client/src/api/taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js)
- **UI Consumers**: [`client/src/pages/Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx) & [`client/src/pages/Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx)

## Service Layer Architecture
Hexa uses a clean separation of concerns:
- **API Service Layer**: Handles network requests via native `fetch()`, status checking, error throwing, and JSON parsing.
- **React Components**: Handle UI state (`loading`, `success`, `error`) and user interaction.

```javascript
// Example from taskApi.js
export async function getTasks() {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    const error = new Error('Failed to fetch tasks');
    error.status = response.status;
    throw error;
  }
  return response.json();
}
```

## UI State Machine: Loading, Success, Error
React components manage asynchronous lifecycle states using `useState` and `useEffect`:

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  async function loadData() {
    try {
      const result = await getTasks();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);
```

## HTTP Status Code Handling in Service Layer
- **200 OK**: Parsed and returned as JSON.
- **201 Created**: Parsed and returned upon POST completion.
- **204 No Content**: Returned as `true` boolean without body parsing.
- **400 / 404 / 500**: Throws structured `Error` object with attached HTTP `.status` code for component error boundary handling.
