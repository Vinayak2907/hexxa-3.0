// TaskList Component - Displays a list of TaskCard components
// Demonstrates component composition: TaskList contains multiple TaskCards

import TaskCard from './TaskCard.jsx';
import EmptyState from './EmptyState.jsx';
import './TaskList.css';

function TaskList({ tasks, emptyMessage = 'No tasks found' }) {
  if (!tasks || tasks.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default TaskList;