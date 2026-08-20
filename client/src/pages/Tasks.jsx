// Tasks Page - List all tasks with filtering
// Demonstrates useState for state management and closure for filtering

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks, deleteTask } from '../api/taskApi.js';
import { createTaskFilter } from '../utils/createTaskFilter.js';
import PageContainer from '../components/PageContainer.jsx';
import TaskList from '../components/TaskList.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tasks using async/await
  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
        setFilteredTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  // Apply filter when status changes (using closure!)
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTasks(tasks);
    } else {
      // createTaskFilter returns a closure that captures 'statusFilter'
      const filter = createTaskFilter(statusFilter);
      setFilteredTasks(filter(tasks));
    }
  }, [statusFilter, tasks]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(id);
      // Update state with functional update
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete task: ' + err.message);
    }
  };

  if (loading) return <LoadingState message="Loading tasks..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <PageContainer 
      title="Tasks" 
      subtitle="Manage your tasks and track progress"
    >
      <div className="tasks-page">
        {/* Filter Controls */}
        <div className="tasks-controls">
          <div className="filter-group">
            <label>Filter by status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <Link to="/tasks/new" className="create-button">
            + Create Task
          </Link>
        </div>

        {/* Task List with Closure-based filtering */}
        <TaskList 
          tasks={filteredTasks} 
          emptyMessage="No tasks match the selected filter"
        />
      </div>
    </PageContainer>
  );
}

export default Tasks;