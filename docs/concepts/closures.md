# JavaScript Closures in Hexa

## Exact Implementation Location
- **Filter Factory**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js)
- **UI Application**: [`client/src/pages/Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx#L42-L45)

## Real Project Feature: Closure-Based Task Filtering
In Hexa, tasks can be dynamically filtered by status (`todo`, `in_progress`, `completed`). Instead of scattering inline filter conditionals across components, Hexa uses a factory function `createTaskFilter` that returns a closure:

```javascript
// Outer factory function capturing 'status' in its lexical environment
export function createTaskFilter(status) {
  // Returned inner function retains access to 'status'
  return function filterTasks(tasks) {
    return tasks.filter(task => task.status === status);
  };
}
```

### Usage inside `Tasks.jsx`:
```javascript
useEffect(() => {
  if (statusFilter === 'all') {
    setFilteredTasks(tasks);
  } else {
    // createTaskFilter returns a specialized filter function closure
    const filter = createTaskFilter(statusFilter);
    setFilteredTasks(filter(tasks));
  }
}, [statusFilter, tasks]);
```

## Technical Mechanics: Lexical Scope & Variable Lifetime
1. **Lexical Scope**: The inner function `filterTasks` holds a reference to its outer lexical environment where `status` was passed as an argument.
2. **Captured Variable**: `status` is captured in the closure environment.
3. **Lifetime**: Even after `createTaskFilter(statusFilter)` has finished executing and returned, the returned `filterTasks` function retains access to `status` whenever invoked.

## Practical Benefits in Hexa
- **Reusability & Composition**: Filter instances can be instantiated once (e.g. `const completedFilter = createTaskFilter('completed')`) and passed around or reused across different task collections without passing `status` repetitively.
- **Encapsulation**: Keeps filtering logic isolated and unit-testable outside React component render cycles.
