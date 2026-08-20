// StatusBadge Component - Visual status indicator
// Reusable component for displaying task/project status

import { formatStatus, getStatusColor } from '../utils/formatters.js';
import './StatusBadge.css';

function StatusBadge({ status }) {
  const color = getStatusColor(status);
  const label = formatStatus(status);

  return (
    <span className="status-badge" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}

export default StatusBadge;