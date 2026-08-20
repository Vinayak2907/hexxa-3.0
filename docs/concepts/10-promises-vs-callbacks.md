# Concept 10: JavaScript Promises vs Callback-Based Asynchrony

## Definition
Asynchronous programming in JavaScript has evolved from **Callback functions** to **Promises**, and finally to **async/await**. A `Promise` represents a proxy value for a result that will settle (resolve or reject) in the future.

---

## Primary Repository Evidence

**Demo Component**: [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx)

---

## Side-by-Side Paradigm Comparison

### 1. Callback Approach (Legacy / Node.js Error-First)
```javascript
// Problem: Callback Hell (deeply nested pyramid of doom)
getUserData(userId, (err, user) => {
  if (err) return handleError(err);
  getProjectsByUser(user.id, (err, projects) => {
    if (err) return handleError(err);
    getTasksByProject(projects[0].id, (err, tasks) => {
      if (err) return handleError(err);
      console.log('Tasks loaded:', tasks);
    });
  });
});
```

### 2. Promise Approach (`.then()` / `.catch()`)
```javascript
// Solution: Flat chainable composition
getUserData(userId)
  .then(user => getProjectsByUser(user.id))
  .then(projects => getTasksByProject(projects[0].id))
  .then(tasks => console.log('Tasks loaded:', tasks))
  .catch(err => handleError(err)); // Single centralized error handler!
```

### 3. `async/await` Approach (Modern Hexa Standard)
```javascript
// Clean synchronous-looking execution flow
try {
  const user = await getUserData(userId);
  const projects = await getProjectsByUser(user.id);
  const tasks = await getTasksByProject(projects[0].id);
  console.log('Tasks loaded:', tasks);
} catch (err) {
  handleError(err);
}
```

> [!NOTE]
> `async/await` does **NOT** replace Promises internally. It is syntactical sugar operating on top of Promises.

---

## Viva Reviewer Questions & Answers

**Q: Why choose Promise-based async code over nested callbacks?**  
**A**: Promises prevent "Callback Hell", provide centralized error handling via `.catch()`, and enable parallel composition using `Promise.all()`.

**Q: Does async/await replace Promises in JavaScript?**  
**A**: No. `async/await` is syntactic sugar built directly on top of Promises. An `async` function always returns a Promise.