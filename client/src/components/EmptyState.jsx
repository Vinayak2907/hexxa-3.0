// EmptyState Component - Displays when no data is available
// Shows when collections are empty

import './EmptyState.css';

function EmptyState({ message = 'No data available', icon = '📋' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-message">{message}</p>
    </div>
  );
}

export default EmptyState;