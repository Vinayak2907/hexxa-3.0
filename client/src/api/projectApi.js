// Project API Layer - Async data fetching for projects
// Demonstrates async/await pattern for API communication

const API_BASE = '/api';

// Async function to fetch all projects
export async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    const error = new Error('Failed to fetch projects');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to fetch single project by ID
export async function getProject(id) {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to fetch project');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to fetch projects by owner
export async function getProjectsByOwner(ownerId) {
  const response = await fetch(`${API_BASE}/projects/owner/${ownerId}`);
  if (!response.ok) {
    const error = new Error('Failed to fetch projects');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to create new project (POST returns 201 Created)
export async function createProject(projectData) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      const error = new Error(errorData.error?.message || 'Validation error');
      error.status = 400;
      throw error;
    }
    const error = new Error('Failed to create project');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to update project (PUT returns 200 OK)
export async function updateProject(id, projectData) {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(projectData)
  });
  
  if (!response.ok) {
    if (response.status === 400) {
      const errorData = await response.json();
      const error = new Error(errorData.error?.message || 'Validation error');
      error.status = 400;
      throw error;
    }
    if (response.status === 404) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to update project');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Async function to delete project (DELETE returns 204 No Content)
export async function deleteProject(id) {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      const error = new Error('Project not found');
      error.status = 404;
      throw error;
    }
    const error = new Error('Failed to delete project');
    error.status = response.status;
    throw error;
  }
  return true;
}