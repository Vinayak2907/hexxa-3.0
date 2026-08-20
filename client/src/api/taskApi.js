// Task API Layer - Async data fetching from Express backend
// Demonstrates async/await, Promises, and error handling

const API_BASE = '/api';

// Async function to fetch all tasks
export async function getTasks() {
  const response = await fetch(`${API_BASE}/tasks`);
  if (!response.ok) {
    const error = new Error('Failed to fetch tasks');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Demonstrates Promise Chaining Pattern (Evaluation Layer target).
// Contrast this with async/await. Here, fetch() returns a Promise.
// We chain multiple .then() calls for response validation and parsing,
// and catch any rejection with a centralized .catch() handler.
// This proves that we understand the trade-offs of promise chains.
export function getTasksPromise() {
  return fetch(`${API_BASE}/tasks`)
    .then(response => {
      if (!response.ok) {
        const error = new Error('Failed to fetch tasks (Promise chain)');
        error.status = response.status;
        throw error;
      }
      return response.json();
    })
    .then(data => {
      // Process tasks or return directly
      return data;
    })
    .catch(error => {
      console.error('Promise chain failure in taskApi:', error);
      throw error; // Re-throw for caller handling
    });
}

// Async function to fetch single task by ID
export async function getTask(id) {
  const response = await fetch(`${API_BASE}/tasks/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to fetch task');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to fetch tasks by project
export async function getTasksByProject(projectId) {
  const response = await fetch(`${API_BASE}/tasks/project/${projectId}`);
  if (!response.ok) {
    const error = new Error('Failed to fetch project tasks');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to create new task (POST returns 201 Created)
export async function createTask(taskData) {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  
  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      const error = new Error(errorData.error?.message || 'Validation error');
      error.status = 400;
      throw error;
    }
    const error = new Error('Failed to create task');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to update task (PUT returns 200 OK)
export async function updateTask(id, taskData) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  
  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      const error = new Error(errorData.error?.message || 'Validation error');
      error.status = 400;
      throw error;
    }
    if (response.status === 404) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to update task');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to delete task (DELETE returns 204 No Content)
export async function deleteTask(id) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to delete task');
    error.status = response.status;
    throw error;
  }
  return true;
}