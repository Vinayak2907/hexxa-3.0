// Layout Component - Main application layout wrapper
// Demonstrates component composition: Layout contains Navbar and PageContainer

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;