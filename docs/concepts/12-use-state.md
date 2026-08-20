# Concept 12: React State Management with useState

## Definition
`useState` is a React Hook that enables functional components to maintain local component state. It returns an array containing the current state value and a state updater function that triggers a asynchronous component re-render when called.

## Primary Repository Evidence

**File**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx#L9-L14)

```javascript
const [formData, setFormData] = useState({
  title: initialData.title || '',
  description: initialData.description || '',
  status: initialData.status || 'todo',
  projectId: initialData.project_id || ''
});
```

---

## TaskForm State Architecture & Modes

### 1. Create Mode
When creating a new task, no `initialData` object is passed (`initialData = {}`). `useState` initializes form inputs to clean default values:
- `title`: `''`
- `description`: `''`
- `status`: `'todo'`
- `projectId`: `''`

### 2. Edit Mode
When editing an existing task, `initialData` is supplied with existing task properties (e.g. `{ title: 'Fix bug', status: 'in_progress', project_id: 2 }`). `useState` initializes `formData` with these pre-populated fields.

---

## Single Object State vs Multiple State Variables

### Single Object State (`formData`)
```javascript
const [formData, setFormData] = useState({ title: '', description: '', status: 'todo', projectId: '' });
```

**Advantages**:
- **Logical Cohesion**: Keeps all form field values tightly coupled inside a single state container matching the API request body payload structure.
- **Unified Submit Handler**: Submitting requires passing `formData` directly rather than constructing a payload from 4 distinct variables.
- **Fewer Declarations**: Eliminates boilerplate state setter calls for every individual input.

**Trade-offs & Constraints**:
- **Immutable Preservation Required**: Updating any single property requires spreading the existing object (`...prev`). Omitting `...prev` overwrites the entire state object with only the modified field.
- **Re-render Scope**: Updating one property re-evaluates the entire `formData` reference.

---

## Controlled Inputs & Immutable Update Pattern

### Controlled Input Mechanics
In `TaskForm.jsx`, form inputs are fully controlled. The input value comes from React state, and changes flow back through state updates:

```jsx
<input
  type="text"
  id="title"
  name="title"
  value={formData.title}
  onChange={handleChange}
/>
```

### Immutable Update Pattern (Correct)
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

### Why Direct Mutation Fails
```javascript
// ❌ WRONG: Direct mutation of state object
formData[name] = value; 
setFormData(formData); // React detects same object reference (Object.is) and SKIPS re-render!
```

---

## Viva Reviewer Questions & Answers

**Q: In TaskForm, why did you choose one formData object instead of separate state variables?**  
**A**: A single `formData` object keeps form fields logically grouped together, matching the payload sent to the backend. It avoids managing separate state hooks for every field and simplifies form submission.

**Q: What changes when initialData is provided for editing?**  
**A**: `initialData` pre-populates `formData` properties during state initialization, seamlessly switching `TaskForm` from Create mode to Edit mode.

**Q: What is the trade-off of single-object form state?**  
**A**: Every change handler must immutably spread previous state (`...prev`). Direct object mutation (`formData.title = 'x'`) will fail to trigger a re-render because React performs a reference equality check (`Object.is`).