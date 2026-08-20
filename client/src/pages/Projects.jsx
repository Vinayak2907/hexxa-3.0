// Projects Page - List all projects
// Demonstrates async/await data fetching with useState

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../api/projectApi.js';
import PageContainer from '../components/PageContainer.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects using async/await
  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) return <LoadingState message="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <PageContainer 
      title="Projects" 
      subtitle="Browse and manage your projects"
    >
      <div className="projects-page">
        {projects.length === 0 ? (
          <div className="empty-projects">
            <p>No projects yet.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
                <h3>{project.name}</h3>
                <p className="project-description">
                  {project.description || 'No description'}
                </p>
                <div className="project-meta">
                  <span className="task-count">📋 {project.task_count} tasks</span>
                  <span className="owner">👤 {project.owner_name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default Projects;