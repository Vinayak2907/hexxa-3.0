// LoadingState Component - Displays loading state
// Shows when data is being fetched

import './LoadingState.css';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

export default LoadingState;