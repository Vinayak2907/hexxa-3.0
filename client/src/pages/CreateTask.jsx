// CreateTask Page - Form for creating new tasks
// Demonstrates async data fetching and form handling with useState

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/taskApi.js';
import PageContainer from '../components/PageContainer.jsx';
import TaskForm from '../components/TaskForm.jsx';
import './CreateTask.css';

function CreateTask() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (taskData) => {
    setSubmitting(true);
    setError(null);
    try {
      // async/await for creating task - POST returns 201 Created
      await createTask(taskData);
      navigate('/tasks');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <PageContainer 
      title="Create New Task" 
      subtitle="Add a new task to your project"
    >
      <div className="create-task">
        {error && <div className="error-message">{error}</div>}
        <TaskForm 
          onSubmit={handleSubmit} 
          submitLabel={submitting ? 'Creating...' : 'Create Task'}
          disabled={submitting}
        />
      </div>
    </PageContainer>
  );
}

export default CreateTask;