// Navbar Component - Application navigation
// Uses React Router's NavLink for client-side navigation

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

function Navbar() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link">Hexa</NavLink>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            Tasks
          </NavLink>
        </li>
        <li>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
            Projects
          </NavLink>
        </li>
        <li>
          <NavLink to="/concepts" className={({ isActive }) => isActive ? 'active' : ''}>
            Concepts
          </NavLink>
        </li>
      </ul>
      <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user?.name || 'User'}</span>
            <button
              onClick={logout}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', background: '#334155', color: '#f8fafc', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => login({ id: 1, name: 'John Doe', email: 'john@example.com' })}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', background: '#3b82f6', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;