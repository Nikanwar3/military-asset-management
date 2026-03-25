import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>MIL-ASSETS</h2>
          <p>{user?.role} {user?.base ? `- ${user.base}` : ''}</p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/purchases" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🛒</span> Purchases
          </NavLink>
          <NavLink to="/transfers" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🔄</span> Transfers
          </NavLink>
          <NavLink to="/assignments" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📋</span> Assignments
          </NavLink>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
