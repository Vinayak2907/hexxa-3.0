// AuthContext - Real Lightweight Client-Side Authentication State Management
// Provides authentication state (user, token, isAuthenticated) to the entire application.

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('token') || 'demo-jwt-token' : 'demo-jwt-token';
  });

  const [user, setUser] = useState(() => {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return savedUser ? JSON.parse(savedUser) : { id: 1, name: 'John Doe', email: 'john@example.com' };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = (userData, userToken = 'demo-jwt-token') => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
