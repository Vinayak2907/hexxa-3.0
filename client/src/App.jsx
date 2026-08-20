// Hexa Main Application Component
// Sets up client-side routing and overall application structure

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import TaskDetails from './pages/TaskDetails.jsx';
import CreateTask from './pages/CreateTask.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import Concepts from './pages/Concepts.jsx';
import EventLoopDemo from './pages/EventLoopDemo.jsx';
import HoistingDemo from './pages/HoistingDemo.jsx';
import PromisesDemo from './pages/PromisesDemo.jsx';
import NoSQLDemo from './pages/NoSQLDemo.jsx';
import SSRDemo from './pages/SSRDemo.jsx';
import PaymentDemo from './pages/PaymentDemo.jsx';
import WorkerDemo from './pages/WorkerDemo.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskDetails />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="concepts" element={<Concepts />} />
            <Route path="concepts/event-loop" element={<EventLoopDemo />} />
            <Route path="concepts/hoisting" element={<HoistingDemo />} />
            <Route path="concepts/promises" element={<PromisesDemo />} />
            <Route path="concepts/nosql" element={<NoSQLDemo />} />
            <Route path="ssr-demo" element={<SSRDemo />} />
            <Route path="payment-demo" element={<PaymentDemo />} />
            <Route path="worker-demo" element={<WorkerDemo />} />

            {/* Protected Client-Side Routes guarded by ProtectedRoute consuming real AuthContext */}
            <Route element={<ProtectedRoute />}>
              <Route path="tasks/new" element={<CreateTask />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;