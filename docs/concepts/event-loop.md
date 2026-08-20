# JavaScript Event Loop in Hexa

## Exact Implementation Location
- **Interactive Component**: [`client/src/pages/EventLoopDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/EventLoopDemo.jsx)
- **Demo Module**: [`client/src/demos/eventLoopDemo.js`](file:///c:/Users/hardi/Hexa/client/src/demos/eventLoopDemo.js)

## Runtime Execution Order & Event Loop Pipeline

JavaScript is single-threaded. Concurrency is managed via the Event Loop architecture:

```
+-------------------------------------------------------------+
|                         Call Stack                          |
|  Executes synchronous code top-to-bottom                    |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                      Microtask Queue                        |
|  Promise callbacks (.then/catch), queueMicrotask()          |
|  * HIGH PRIORITY: Emptied completely before macrotasks      |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   Task / Macrotask Queue                    |
|  setTimeout, setInterval, I/O callbacks                     |
|  * Executes ONE macrotask per event loop iteration          |
+-------------------------------------------------------------+
```

## Executable Benchmark Snippet
```javascript
console.log('A');

setTimeout(() => {
  console.log('B');
}, 0);

Promise.resolve().then(() => {
  console.log('C');
});

console.log('D');
```

### Actual Output Sequence:
1. `A` (Synchronous -> Call Stack)
2. `D` (Synchronous -> Call Stack)
3. `C` (Microtask Queue -> Emptied immediately after stack clears)
4. `B` (Macrotask Queue -> Picked up by Event Loop)

**Result**: `A, D, C, B`

## Why `await` Does Not Block the JavaScript Runtime
When `await fetch(...)` is called inside an `async` function, the execution of that specific function is paused, and control is returned to the Event Loop. Other UI interactions and event handlers continue executing on the main thread while the HTTP request runs asynchronously in the background browser network layer.
