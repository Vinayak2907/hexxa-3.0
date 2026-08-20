// JavaScript Closure Demonstration
// createTaskFilter is a higher-order function that returns a closure
// The returned function "closes over" the status variable from its outer scope

// Outer function that captures 'status' in its lexical scope
export function createTaskFilter(status) {
  // This inner function is a closure - it retains access to 'status'
  // even after createTaskFilter has finished executing
  return function filterTasks(tasks) {
    return tasks.filter(task => task.status === status);
  };
}

// Alternative: arrow function closure
export const createStatusFilter = (status) => (tasks) => 
  tasks.filter(task => task.status === status);

// Closure for filtering by project
export function createProjectFilter(projectId) {
  return function filterByProject(tasks) {
    return tasks.filter(task => task.project_id === projectId);
  };
}

// Closure with multiple captured variables
export function createAdvancedFilter(options) {
  const { status, projectId, searchTerm } = options;
  
  return function advancedFilter(tasks) {
    return tasks.filter(task => {
      let matches = true;
      
      if (status && task.status !== status) {
        matches = false;
      }
      
      if (projectId && task.project_id !== projectId) {
        matches = false;
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(term) && 
            !task.description?.toLowerCase().includes(term)) {
          matches = false;
        }
      }
      
      return matches;
    });
  };
}

// Example usage demonstrating closure behavior:
/*
const completedFilter = createTaskFilter('completed');
const pendingFilter = createTaskFilter('todo');

const tasks = [
  { id: 1, title: 'Task 1', status: 'completed' },
  { id: 2, title: 'Task 2', status: 'todo' },
  { id: 3, title: 'Task 3', status: 'completed' }
];

completedFilter(tasks);  // Returns tasks with status 'completed'
pendingFilter(tasks);    // Returns tasks with status 'todo'

// Each filter function has its own captured 'status' variable
// This is the essence of closure: function + its lexical environment
*/