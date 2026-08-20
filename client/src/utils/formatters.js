// Utility formatters for the Hexa application
// Date and status formatting functions

// Format date to readable string
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format datetime with time
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format status for display
export function formatStatus(status) {
  const statusMap = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
}

// Get status color class
export function getStatusColor(status) {
  const colorMap = {
    'todo': '#ffc107',
    'in_progress': '#17a2b8',
    'completed': '#28a745'
  };
  return colorMap[status] || '#6c757d';
}

// Truncate text with ellipsis
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}