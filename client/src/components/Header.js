import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">
          <Link to="/">Ratings Platform</Link>
        </h1>
        <nav className="nav">
          {user ? (
            <>
              <span className="user-info">
                Welcome, {user.name} ({user.role})
              </span>
              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
              )}
              {user.role === 'OWNER' && (
                <Link to="/owner/dashboard" className="nav-link">Owner Dashboard</Link>
              )}
              <Link to="/stores" className="nav-link">Stores</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
