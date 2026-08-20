# Concept 9: JavaScript Variable & Function Hoisting (TDZ)

## Definition
**Hoisting** is JavaScript's default behavior of moving variable and function declarations to the top of their containing lexical scope during the creation phase before code execution occurs.

---

## Primary Repository Evidence

**Demo Component**: [`client/src/pages/HoistingDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/HoistingDemo.jsx)

---

## Technical Hoisting Breakdown by Type

### 1. `var` Variable Declarations
`var` variables are hoisted and initialized to `undefined`.

```javascript
console.log(appName); // Output: undefined (no ReferenceError!)
var appName = 'Hexa Platform';
console.log(appName); // Output: 'Hexa Platform'
```

### 2. Function Declarations
Function declarations are hoisted completely (both signature and body), allowing invocation before declaration:

```javascript
initialize(); // Works cleanly!

function initialize() {
  console.log('Hexa initialized');
}
```

### 3. `let` and `const` Declarations (Temporal Dead Zone - TDZ)

> [!IMPORTANT]
> **Correct Explanation**: `let` and `const` **ARE** hoisted into their block scope, but they are **NOT** initialized with `undefined`. Accessing them before initialization throws a `ReferenceError` because they remain in the **Temporal Dead Zone (TDZ)** until execution reaches the declaration statement.

```javascript
console.log(projectTitle); // Throws ReferenceError: Cannot access 'projectTitle' before initialization
let projectTitle = 'Hexa Architecture';
```

---

## Viva Reviewer Questions & Answers

**Q: Are let and const hoisted in JavaScript?**  
**A**: Yes. `let` and `const` are hoisted into their lexical block scope, but accessing them before their declaration line throws a `ReferenceError` because they sit in the Temporal Dead Zone (TDZ).

**Q: What is the difference between var hoisting and function hoisting?**  
**A**: `var` is hoisted and initialized with `undefined`. Function declarations are hoisted with their complete function implementation, allowing invocation prior to the line where they appear in source code.