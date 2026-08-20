# Concept 8: JavaScript Event Loop & Non-Blocking Asynchronous Concurrency

## Definition
JavaScript is a single-threaded runtime engine. The **Event Loop** is the mechanism that orchestrates asynchronous non-blocking execution by managing the **Call Stack**, **Microtask Queue** (Promises, `process.nextTick`), and **Macrotask/Task Queue** (`setTimeout`, `setInterval`, I/O callbacks).

---

## Primary Repository Evidence

**Demo Component**: [`client/src/pages/EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx)

```javascript
console.log('A: Synchronous Start');

setTimeout(() => {
  console.log('B: Macrotask (setTimeout 0ms)');
}, 0);

Promise.resolve().then(() => {
  console.log('C: Microtask (Promise resolve)');
});

console.log('D: Synchronous End');
```

---

## Execution Order Output & Sequence Explanation

### Output
```text
A: Synchronous Start
D: Synchronous End
C: Microtask (Promise resolve)
B: Macrotask (setTimeout 0ms)
```

### Execution Flow Step-by-Step

1. **Synchronous Execution Phase**:
   - `console.log('A')` is pushed to Call Stack, executes immediately, logs `A`, pops off.
   - `setTimeout(..., 0)` registers a timer with Web APIs. When timer expires, its callback is enqueued into the **Macrotask Queue**.
   - `Promise.resolve().then(...)` enqueues its `.then()` callback directly into the **Microtask Queue**.
   - `console.log('D')` executes synchronously, logs `D`, pops off Call Stack.

2. **Microtask Phase (High Priority)**:
   - Call Stack is now empty. The Event Loop inspects the **Microtask Queue** first.
   - Promise callback is popped from Microtask Queue onto Call Stack, logs `C`, pops off.
   - Microtask Queue is completely drained before checking Macrotasks.

3. **Macrotask Phase**:
   - Event Loop inspects the **Macrotask Queue**.
   - `setTimeout` callback is popped from Macrotask Queue onto Call Stack, logs `B`, pops off.

> [!NOTE]
> `setTimeout(fn, 0)` does **NOT** run immediately after 0 milliseconds. It schedules a callback into the Macrotask Queue, which must wait until all synchronous code finishes and the Microtask Queue is completely empty!

---

## Connection to Hexa API Fetching

When Hexa components call `fetch('/api/tasks')`, the browser offloads HTTP networking to browser background threads. When the HTTP response arrives, its Promise resolution callback is placed in the **Microtask Queue**, guaranteeing fast execution without blocking UI renders.

---

## Viva Reviewer Questions & Answers

**Q: Why is C printed before B in the Event Loop demo?**  
**A**: Because Promise resolutions (`C`) enter the **Microtask Queue**, which has absolute priority over the **Macrotask Queue** (`setTimeout` `B`). The Event Loop drains all microtasks before picking the next macrotask.

**Q: Does setTimeout(fn, 0) execute after 0ms?**  
**A**: No. It specifies the *minimum delay* before the task callback is enqueued in the Macrotask Queue. It will only execute after all synchronous code finishes and all pending microtasks complete.