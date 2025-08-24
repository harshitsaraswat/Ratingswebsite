import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ user }) => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Ratings Platform</h1>
        <p>Rate and discover stores in your area</p>
        {!user && (
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-success">Login</Link>
          </div>
        )}
      </div>

      {user && (
        <div className="user-welcome">
          <h2>Welcome back, {user.name}!</h2>
          <div className="quick-actions">
            <Link to="/stores" className="btn btn-primary">Browse Stores</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin/dashboard" className="btn btn-success">Admin Dashboard</Link>
            )}
            {user.role === 'OWNER' && (
              <Link to="/owner/dashboard" className="btn btn-success">Owner Dashboard</Link>
            )}
          </div>
        </div>
      )}

      <div className="features">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Rate Stores</h3>
            <p>Submit ratings from 1 to 5 stars for stores you've visited</p>
          </div>
          <div className="feature-card">
            <h3>Search & Filter</h3>
            <p>Find stores by name and address with advanced filtering</p>
          </div>
          <div className="feature-card">
            <h3>User Roles</h3>
            <p>Different access levels for Admin, Store Owners, and Regular Users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
