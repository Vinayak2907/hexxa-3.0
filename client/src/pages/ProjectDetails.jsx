// ProjectDetails Page - View project with its tasks
// Uses useState for state management

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, deleteProject } from '../api/projectApi.js';
import { getTasksByProject } from '../api/taskApi.js';
import PageContainer from '../components/PageContainer.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import TaskList from '../components/TaskList.jsx';
import { formatDateTime } from '../utils/formatters.js';
import './ProjectDetails.css';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project and its tasks using async/await
  useEffect(() => {
    async function fetchData() {
      try {
        const [projectData, tasksData] = await Promise.all([
          getProject(id),
          getTasksByProject(id)
        ]);
        setProject(projectData);
        setTasks(tasksData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  if (loading) return <LoadingState message="Loading project..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!project) return <ErrorState message="Project not found" />;

  return (
    <PageContainer title={project.name}>
      <div className="project-details">
        <div className="project-header">
          <p className="project-description">
            {project.description || 'No description provided'}
          </p>
          <div className="project-meta">
            <p><strong>Owner:</strong> {project.owner_name}</p>
            <p><strong>Created:</strong> {formatDateTime(project.created_at)}</p>
            <p><strong>Total Tasks:</strong> {project.task_count}</p>
          </div>
        </div>

        <div className="project-actions">
          <button onClick={handleDelete} className="delete-button">
            Delete Project
          </button>
          <Link to="/projects" className="back-link">Back to Projects</Link>
        </div>

        <section className="project-tasks">
          <h3>Tasks in this Project</h3>
          <TaskList tasks={tasks} emptyMessage="No tasks in this project yet" />
        </section>
      </div>
    </PageContainer>
  );
}

export default ProjectDetails;