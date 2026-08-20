// Dashboard Page - Main overview of tasks and projects
// Uses useState for state management

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../api/taskApi.js';
import { getProjects } from '../api/projectApi.js';
import PageContainer from '../components/PageContainer.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import './Dashboard.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data using async/await
  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksData, projectsData] = await Promise.all([
          getTasks(),
          getProjects()
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <PageContainer 
      title="Dashboard" 
      subtitle="Welcome to Hexa — Your Task & Project Management Platform"
    >
      <div className="dashboard">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-value">{totalTasks}</p>
          </div>
          <div className="stat-card completed">
            <h3>Completed</h3>
            <p className="stat-value">{completedTasks}</p>
          </div>
          <div className="stat-card in-progress">
            <h3>In Progress</h3>
            <p className="stat-value">{inProgressTasks}</p>
          </div>
          <div className="stat-card todo">
            <h3>To Do</h3>
            <p className="stat-value">{todoTasks}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/tasks/new" className="action-button primary">
            + Create New Task
          </Link>
          <Link to="/tasks" className="action-button">
            View All Tasks
          </Link>
        </div>

        {/* Recent Tasks */}
        <section className="recent-tasks">
          <h2>Recent Tasks</h2>
          {tasks.length === 0 ? (
            <p className="no-data">No tasks yet. Create your first task!</p>
          ) : (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 5).map(task => (
                  <tr key={task.id}>
                    <td>
                      <Link to={`/tasks/${task.id}`}>{task.title}</Link>
                    </td>
                    <td>{task.project_name}</td>
                    <td><StatusBadge status={task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Projects Overview */}
        <section className="projects-overview">
          <h2>Projects</h2>
          {projects.length === 0 ? (
            <p className="no-data">No projects yet.</p>
          ) : (
            <div className="projects-grid">
              {projects.slice(0, 4).map(project => (
                <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
                  <h3>{project.name}</h3>
                  <p>{project.task_count} tasks</p>
                  <span className="owner">Owner: {project.owner_name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

export default Dashboard;