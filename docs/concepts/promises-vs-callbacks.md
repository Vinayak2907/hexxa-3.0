# JavaScript Promises vs. Callbacks in Hexa

## Exact Implementation Location
- **Interactive Component**: [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx)
- **Demo Module**: [`client/src/demos/promisesVsCallbacks.js`](file:///c:/Users/hardi/Hexa/client/src/demos/promisesVsCallbacks.js)

## Architectural Comparison Across 3 Async Eras

Hexa's `PromisesDemo` page provides side-by-side executable demonstrations comparing asynchronous JavaScript patterns:

### 1. Callback Pattern (Node.js Error-First Convention)
```javascript
function loadTaskSummary(callback) {
  setTimeout(() => {
    callback(null, { total: 10, completed: 4 });
  }, 300);
}

// Usage
loadTaskSummary((err, data) => {
  if (err) console.error(err);
  else console.log(data);
});
```
- **Pros**: Simple for single non-nested async operations.
- **Cons**: Nested callbacks lead to "Callback Hell" and unhandled exceptions.

### 2. Promises Pattern (ES6)
```javascript
function loadTaskSummaryPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ total: 10, completed: 4 });
    }, 300);
  });
}

// Usage
loadTaskSummaryPromise()
  .then(data => console.log(data))
  .catch(err => console.error(err));
```
- **Pros**: Chainable (`.then()`), composable (`Promise.all`), single `.catch()` handler.
- **Cons**: Still uses callback functions inside `.then()` chains.

### 3. async / await Syntactic Sugar (ES8)
```javascript
async function loadTaskSummaryAsync() {
  const data = await loadTaskSummaryPromise();
  return data;
}

// Usage
try {
  const data = await loadTaskSummaryAsync();
  console.log(data);
} catch (err) {
  console.error(err);
}
```
- **Pros**: Code reads top-to-bottom like synchronous code while remaining non-blocking; utilizes standard `try ... catch`.

## Crucial Viva Insight
`async/await` does NOT replace Promises internally. Under the hood, an `async` function always returns a Promise, and `await` pauses execution of the async function until the Promise resolves or rejects.
