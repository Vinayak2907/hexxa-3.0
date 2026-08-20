// ProtectedRoute Component - Client-side Routing Guard
// Protects routes from unauthenticated access on the client side
//
// NOTE (Viva/Architecture): Client-side route protection enhances UX by redirecting
// unauthorized users, but is NOT a true security boundary. Backend API endpoints
// must independently enforce authorization checks for real security.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ redirectTo = '/' }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
