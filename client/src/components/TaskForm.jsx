// TaskForm Component - Form for creating/editing tasks
// Demonstrates controlled inputs with React useState

import { useState, useEffect } from 'react';
import { getProjects } from '../api/projectApi.js';
import './TaskForm.css';

function TaskForm({ initialData = {}, onSubmit, submitLabel }) {
  // Controlled form state initialized from initialData or fallback default object shape
  // Trade-off: Grouping form fields in a single state object vs multiple useState hooks
  // keeps form inputs aligned in one object, but requires immutable functional updates.
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    projectId: initialData?.project_id || initialData?.projectId || ''
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state if initialData is updated asynchronously (e.g. edit mode re-fetch)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        projectId: initialData.project_id || initialData.projectId || ''
      });
    }
  }, [initialData]);

  // Fetch projects for the dropdown
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
        if (!formData.projectId && data.length > 0) {
          setFormData(prev => ({ ...prev, projectId: data[0].id }));
        }
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Field-handler factory demonstrating JavaScript Closures.
  // Lexical Scope & Closure:
  // - The outer function 'createFieldChangeHandler' takes the parameter 'field'.
  // - The inner anonymous function (returned) closes over the 'field' variable from the outer lexical scope.
  // - When the input changes and triggers the returned function, it retains access to 'field' 
  //   even after 'createFieldChangeHandler' has finished executing.
  // State Safety:
  // - Using the functional state update 'prev => ({ ...prev, [field]: value })' prevents stale state
  //   issues by ensuring we always modify the most current state value.
  const createFieldChangeHandler = (field) => {
    return (event) => {
      const { value } = event.target;
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      projectId: parseInt(formData.projectId)
    });
  };

  // HOISTING DEMONSTRATION:
  // - getSubmitButtonLabel is called here before its function declaration in the file.
  // - Because function declarations are hoisted (moved to the top of the scope during compilation),
  //   this runs successfully without errors.
  // - Contrast with let/const: trying to access 'formData' or 'projects' before their lines
  //   of definition would throw a ReferenceError because they are in the Temporal Dead Zone (TDZ).
  const submitText = getSubmitButtonLabel(initialData, submitLabel);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={createFieldChangeHandler('title')}
          required
          placeholder="Enter task title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={createFieldChangeHandler('description')}
          rows="4"
          placeholder="Enter task description"
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={createFieldChangeHandler('status')}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="projectId">Project *</label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={createFieldChangeHandler('projectId')}
          required
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-button">
        {submitText}
      </button>
    </form>
  );
}

// ============================================
// HOISTING DECLARATION
// ============================================
// Function declarations are hoisted to the top of their containing scope (module scope).
// This allows this function to be called safely inside the TaskForm component definition above.
function getSubmitButtonLabel(initialData, customLabel) {
  if (customLabel) return customLabel;
  return initialData?.id ? 'Update Task' : 'Create Task';
}

export default TaskForm;