// ErrorState Component - Displays error state
// Shows when data fetching fails

import './ErrorState.css';

function ErrorState({ message = 'An error occurred', onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;