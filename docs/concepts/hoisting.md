# JavaScript Hoisting in Hexa

## Exact Implementation Location
- **Interactive Component**: [`client/src/pages/HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx)
- **Demo Module**: [`client/src/demos/hoistingDemo.js`](file:///c:/Users/hardi/Hexa/client/src/demos/hoistingDemo.js)

## What is Hoisting?
Hoisting is JavaScript's default behavior of moving variable and function declarations to the top of their enclosing scope during the compilation phase before code execution occurs.

## Controlled Concept Demonstrations

### 1. Function Declaration Hoisting
Function declarations are fully hoisted with both their name and implementation body:

```javascript
// Function can be safely invoked before its source declaration line
console.log(formatTaskTitle('viva hardening')); // Returns: "[HEXA] VIVA HARDENING"

function formatTaskTitle(title) {
  return `[HEXA] ${title.toUpperCase()}`;
}
```

### 2. `var` Declaration Hoisting
Variables declared with `var` are hoisted to the top of their function or global scope and initialized with `undefined`:

```javascript
console.log(status); // Output: undefined (no ReferenceError thrown)
var status = 'completed';
console.log(status); // Output: 'completed'
```

### 3. `let` / `const` and Temporal Dead Zone (TDZ)
Variables declared with `let` and `const` are hoisted, but remain **uninitialized**. The region between entering the scope and reaching the declaration statement is the **Temporal Dead Zone (TDZ)**:

```javascript
// Accessing variable in TDZ throws ReferenceError
try {
  console.log(taskCount); // Throws ReferenceError!
  let taskCount = 10;
} catch (err) {
  console.log(err.name); // Output: "ReferenceError"
}
```

## viva Summary Table

| Declaration Type | Hoisted? | Initial Value | Access Before Declaration? | Scope |
|---|---|---|---|---|
| `function` | Yes | Function Body | Allowed (Fully functional) | Function / Block |
| `var` | Yes | `undefined` | Allowed (Returns `undefined`) | Function / Global |
| `let` | Yes | Uninitialized | Throws `ReferenceError` (TDZ) | Block |
| `const` | Yes | Uninitialized | Throws `ReferenceError` (TDZ) | Block |
