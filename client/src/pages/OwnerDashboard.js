import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';
import './Dashboard.css';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Store Owner Dashboard</h1>
      
      {error && <div className="error">{error}</div>}

      {dashboardData && (
        <>
          <div className="store-info">
            <h2>{dashboardData.store.name}</h2>
            <p className="store-address">{dashboardData.store.address}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Average Rating</h3>
              <p className="stat-number">{dashboardData.averageRating} ⭐</p>
            </div>
            <div className="stat-card">
              <h3>Total Ratings</h3>
              <p className="stat-number">{dashboardData.totalRatings}</p>
            </div>
          </div>

          <div className="section">
            <h2>Recent Ratings</h2>
            {dashboardData.raters.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.raters.map((rater, index) => (
                      <tr key={index}>
                        <td>{rater.name}</td>
                        <td>{rater.email}</td>
                        <td>
                          <span className="rating-display">
                            {rater.rating} ⭐
                          </span>
                        </td>
                        <td>{new Date(rater.ratedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No ratings yet for your store.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
