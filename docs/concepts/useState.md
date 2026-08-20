# State Management with useState in Hexa

## Exact Implementation Location
- **File**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx)
- **Component**: `TaskForm({ initialData = {}, onSubmit, submitLabel })`
- **Feature**: Task Creation and Task Editing

## State Design & Object Shape
In Hexa's `TaskForm`, form inputs are managed using a single state object initialized via `useState`:

```javascript
const [formData, setFormData] = useState({
  title: initialData?.title || '',
  description: initialData?.description || '',
  status: initialData?.status || 'todo',
  projectId: initialData?.project_id || initialData?.projectId || ''
});
```

### Why One State Object instead of Four `useState` Calls?
1. **Atomic Synchronization**: All related form fields remain grouped together as a single data structure matching the task entity payload.
2. **Simplified Change Handler**: A single generic `handleChange` function handles updates for all input fields using dynamic key lookup `[e.target.name]: e.target.value`.
3. **Clean Form Resets and Submissions**: Passing `formData` to `onSubmit` requires no manual aggregation across multiple variables.

## Functional State Updates
Field updates use functional state updates:

```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

**Why Functional Updates?**
Functional state updates guarantee that state mutations operate on the most up-to-date state snapshot (`prev`), avoiding race conditions or stale closure values during rapid user input events.

## Create Mode vs. Edit Mode Trade-offs

| Aspect | Create Mode | Edit Mode |
|---|---|---|
| `initialData` | Empty object `{}` | Existing task object `{ id, title, description, status, project_id }` |
| Form Fields | Fallback to defaults (`title: ''`, `status: 'todo'`) | Populated from existing task properties |
| Button Label | Default fallback `"Create Task"` | Default fallback `"Update Task"` |
| Trade-off | Simple static initialization | Requires `useEffect` synchronization if `initialData` arrives asynchronously via API |

## Edge Cases Handled
1. **Missing or Partial `initialData`**: Optional chaining (`initialData?.title || ''`) prevents runtime `TypeError: Cannot read properties of undefined`.
2. **Key Naming Discrepancies**: Supports both `project_id` (database snake_case) and `projectId` (JavaScript camelCase).
3. **Numeric Type Coercion**: Converts `formData.projectId` string values from HTML `<select>` elements to numbers using `parseInt()` upon form submission.
4. **Asynchronous Initial Data Loading**: A `useEffect` hook monitors changes to `initialData` and re-synchronizes `formData` when task details finish loading from the backend API.
