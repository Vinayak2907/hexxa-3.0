// TaskCard Component - Individual task display
// Reusable component showing task information

import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { formatDate, truncate } from '../utils/formatters.js';
import './TaskCard.css';

function TaskCard({ task }) {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <Link to={`/tasks/${task.id}`} className="task-title">
          {task.title}
        </Link>
        <StatusBadge status={task.status} />
      </div>
      {task.description && (
        <p className="task-description">
          {truncate(task.description, 120)}
        </p>
      )}
      <div className="task-meta">
        <span className="task-project">
          📁 {task.project_name || 'Unknown Project'}
        </span>
        <span className="task-date">
          {formatDate(task.created_at)}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;