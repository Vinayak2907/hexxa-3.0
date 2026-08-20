// JavaScript Promises vs Callbacks Demonstration
// Shows equivalent async operations using callbacks, Promises, and async/await

// ============================================
// CALLBACK PATTERN
// ============================================

// Simulating async operation with callbacks
export function loadDataWithCallback(callback) {
  // Simulate async operation
  setTimeout(() => {
    const data = { id: 1, title: 'Task from callback', status: 'completed' };
    // Error-first callback pattern: (error, data)
    callback(null, data);
  }, 100);
}

// Callback with error handling
export function loadDataWithCallbackError(callback) {
  setTimeout(() => {
    const shouldFail = Math.random() < 0.3;
    if (shouldFail) {
      callback(new Error('Failed to load data'), null);
    } else {
      const data = { id: 1, title: 'Task from callback', status: 'completed' };
      callback(null, data);
    }
  }, 100);
}

// Callback hell / Pyramid of doom
export function fetchDataWithCallbacks(callback) {
  // First fetch user
  setTimeout(() => {
    const user = { id: 1, name: 'John Doe' };
    
    // Then fetch user's projects
    setTimeout(() => {
      const projects = [{ id: 1, name: 'Hexa' }];
      
      // Then fetch project tasks
      setTimeout(() => {
        const tasks = [{ id: 1, title: 'Build API', status: 'completed' }];
        callback(null, { user, projects, tasks });
      }, 100);
    }, 100);
  }, 100);
}

// ============================================
// PROMISE PATTERN
// ============================================

// Wrap callback-based operation in Promise
export function loadDataWithPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = { id: 1, title: 'Task from Promise', status: 'completed' };
      resolve(data);
    }, 100);
  });
}

// Promise with error handling
export function loadDataWithPromiseError() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldFail = Math.random() < 0.3;
      if (shouldFail) {
        reject(new Error('Failed to load data'));
      } else {
        const data = { id: 1, title: 'Task from Promise', status: 'completed' };
        resolve(data);
      }
    }, 100);
  });
}

// Chaining Promises (no callback hell)
export function fetchDataWithPromises() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, name: 'John Doe' }), 100);
  })
    .then(user => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ ...user, projects: [{ id: 1, name: 'Hexa' }] }), 100);
      });
    })
    .then(data => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ ...data, tasks: [{ id: 1, title: 'Build API' }] }), 100);
      });
    });
}

// ============================================
// ASYNC/AWAIT PATTERN
// ============================================

// Async/await is syntactic sugar over Promises
export async function loadDataWithAsyncAwait() {
  const data = await new Promise(resolve => {
    setTimeout(() => {
      resolve({ id: 1, title: 'Task from async/await', status: 'completed' });
    }, 100);
  });
  return data;
}

// Async/await with error handling (try/catch)
export async function loadDataWithAsyncAwaitError() {
  try {
    const data = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const shouldFail = Math.random() < 0.3;
        if (shouldFail) {
          reject(new Error('Failed to load data'));
        } else {
          resolve({ id: 1, title: 'Task from async/await', status: 'completed' });
        }
      }, 100);
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Async/await with sequential operations
export async function fetchDataWithAsyncAwait() {
  const user = await new Promise(resolve => 
    setTimeout(() => resolve({ id: 1, name: 'John Doe' }), 100)
  );
  
  const projects = await new Promise(resolve => 
    setTimeout(() => resolve([{ id: 1, name: 'Hexa' }]), 100)
  );
  
  const tasks = await new Promise(resolve => 
    setTimeout(() => resolve([{ id: 1, title: 'Build API' }]), 100)
  );
  
  return { user, projects, tasks };
}

// ============================================
// PROMISE COMPARISON
// ============================================

export function getComparison() {
  return {
    callbacks: {
      pattern: 'error-first callback(error, data)',
      errorHandling: 'if (error) handleError()',
      chaining: 'Nested callbacks (callback hell)',
      readability: 'Decreases with nesting',
      pros: 'Simple, universal',
      cons: 'Callback hell, error handling分散'
    },
    promises: {
      pattern: 'promise.then().catch()',
      errorHandling: '.catch(err => handleError(err))',
      chaining: '.then().then().catch()',
      readability: 'Better with chaining',
      pros: 'Better composability, unified error handling',
      cons: 'Still some complexity with chains'
    },
    asyncAwait: {
      pattern: 'async function with await',
      errorHandling: 'try { await } catch (err) { }',
      chaining: 'await sequentially, Promise.all() for parallel',
      readability: 'Most like synchronous code',
      pros: 'Most readable, natural error handling',
      cons: 'Requires understanding of Promises'
    }
  };
}

/*
Key Differences:
================

1. CALLBACKS:
   - Original pattern for async JS
   - Error-first: callback(error, data)
   - Problem: Callback hell with nested operations
   - Error handling scattered

2. PROMISES:
   - Wrapper around callbacks
   - States: pending, fulfilled, rejected
   - .then() for success, .catch() for errors
   - Better chaining with .then().then()
   - Can use Promise.all(), Promise.race()

3. ASYNC/AWAIT:
   - Syntactic sugar over Promises
   - Looks like synchronous code
   - try/catch for error handling
   - await pauses function execution (not blocking!)
   - Most readable for complex async flows
*/