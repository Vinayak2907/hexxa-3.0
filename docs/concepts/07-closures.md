# Concept 7: JavaScript Closures & Lexical Scoping

## Definition
A **Closure** is a fundamental JavaScript concept where an inner function retains access to variables declared in its outer (enclosing) lexical scope, even after the outer function has finished executing and returned.

---

## Primary Repository Evidence

**Utility Module**: [`client/src/utils/createTaskFilter.js`](file:///c:/Users/hardi/Hexa/client/src/utils/createTaskFilter.js#L6-L12)

```javascript
// Outer higher-order factory function
export function createTaskFilter(status) {
  // Inner function (closure) captures 'status' variable in its lexical environment
  return function filterTasks(tasks) {
    return tasks.filter(task => task.status === status);
  };
}
```

---

## Usage in Hexa Components

**File**: [`client/src/pages/Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx)

```javascript
import { createTaskFilter } from '../utils/createTaskFilter.js';

// Instantiating distinct closure instances:
const completedFilter = createTaskFilter('completed');
const todoFilter = createTaskFilter('todo');

// Applying filters to task collection:
const completedTasks = completedFilter(allTasks); // Uses captured status = 'completed'
const todoTasks = todoFilter(allTasks);          // Uses captured status = 'todo'
```

---

## How Lexical Scope Capture Works

1. **Outer Execution**: Calling `createTaskFilter('completed')` creates a new execution context with local variable `status = 'completed'`.
2. **Closure Creation**: `createTaskFilter` returns the `filterTasks` function reference, which bundles its code body with a reference to its lexical environment containing `status`.
3. **Outer Function Exit**: `createTaskFilter` finishes execution and leaves the call stack.
4. **Invocation Phase**: When `completedFilter(allTasks)` is invoked later, it accesses `status` from its captured lexical environment, evaluating `task.status === 'completed'`.

---

## Viva Reviewer Questions & Answers

**Q: Show me the variable captured by the closure in Hexa.**  
**A**: In `client/src/utils/createTaskFilter.js`, the inner function `filterTasks` captures the `status` parameter from the outer `createTaskFilter` scope.

**Q: Why use a closure factory instead of passing status as an argument every time?**  
**A**: Closures enable partial application and function encapsulation. We can construct specialized, pre-configured filter functions (`completedFilter`, `todoFilter`) and pass them cleanly into array processing methods or component handlers.

**Q: Does closure variable capture cause memory leaks?**  
**A**: JavaScript garbage collection retains captured variables as long as the inner function reference (`completedFilter`) remains accessible. Memory is freed once all references to the inner function are cleared.