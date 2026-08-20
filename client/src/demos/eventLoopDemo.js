// JavaScript Event Loop Demonstration
// Demonstrates the event loop, call stack, microtask queue, and task queue

// This function simulates event loop behavior and captures the execution order
export function demonstrateEventLoop() {
  const executionOrder = [];
  
  // Sync code runs first - goes directly to call stack
  executionOrder.push('A');
  
  // setTimeout is a macrotask - goes to task queue
  setTimeout(() => {
    executionOrder.push('B');
  }, 0);
  
  // Promise.then is a microtask - goes to microtask queue (higher priority)
  Promise.resolve().then(() => {
    executionOrder.push('C');
  });
  
  // Another sync code
  executionOrder.push('D');
  
  // Return current state (async hasn't run yet)
  // In real execution, order would be: A, D, C, B
  
  // Simulate the actual execution order after event loop processes
  setTimeout(() => {
    console.log('Final execution order:', executionOrder.join(' -> '));
  }, 10);
  
  return {
    syncExecuted: ['A', 'D'],
    expectedOrder: 'A -> D -> C -> B',
    explanation: 'Sync code runs first, then microtasks (Promise), then macrotasks (setTimeout)'
  };
}

// More detailed event loop demonstration
export function detailedEventLoopDemo() {
  const logs = [];
  
  // Phase 1: Call stack (synchronous)
  function sync1() { logs.push('1. Sync: First sync code'); }
  function sync2() { logs.push('4. Sync: Second sync code'); }
  
  // Phase 2: Microtasks (Promise callbacks)
  function microtask() { 
    logs.push('3. Microtask: Promise.then callback'); 
  }
  
  // Phase 3: Macrotasks (setTimeout)
  function macrotask() { 
    logs.push('5. Macrotask: setTimeout callback'); 
  }
  
  // Execute
  sync1();
  Promise.resolve().then(microtask);
  sync2();
  setTimeout(macrotask, 0);
  
  return logs;
}

// Async/await event loop behavior
export async function asyncAwaitDemo() {
  const logs = [];
  
  logs.push('1. Start of async function');
  
  await Promise.resolve();
  logs.push('2. After first await');
  
  setTimeout(() => {
    logs.push('4. Inside setTimeout');
  }, 0);
  
  await Promise.resolve();
  logs.push('3. After second await');
  
  return logs;
}

/*
Event Loop Explanation:
======================

1. CALL STACK: Executes synchronous code immediately
   - Functions are pushed when called, popped when done

2. MICROTASK QUEUE: High priority
   - Promise callbacks (then, catch, finally)
   - queueMicrotask()
   - MutationObserver callbacks
   
3. TASK QUEUE (MACROTASK QUEUE): Lower priority
   - setTimeout, setInterval
   - I/O operations
   - UI rendering

4. EVENT LOOP:
   - Execute ALL tasks in microtask queue first
   - Then execute ONE task from task queue
   - Then check if rendering is needed
   - Repeat

Expected output for the demo:
A
D
C
B
*/