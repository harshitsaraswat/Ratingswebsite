import React, { useState, useEffect } from 'react';
import { storeAPI } from '../services/api';
import './Stores.css';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    address: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getStores({
        ...filters,
        sort: sortBy,
        order: sortOrder
      });
      setStores(response.data);
    } catch (err) {
      setError('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      await storeAPI.submitRating(storeId, rating);
      // Refresh stores to get updated ratings
      fetchStores();
    } catch (err) {
      setError('Failed to submit rating');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Loading stores...</div>;

  return (
    <div className="stores-page">
      <h1>Browse Stores</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="name"
            placeholder="Search by store name..."
            value={filters.name}
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            name="address"
            placeholder="Search by address..."
            value={filters.address}
            onChange={handleFilterChange}
            className="form-control"
          />
        </div>
        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
          >
            <option value="name">Sort by Name</option>
            <option value="address">Sort by Address</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className="btn btn-primary"
          >
            {sortOrder === 'ASC' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stores-grid">
        {stores.map(store => (
          <div key={store.id} className="store-card">
            <h3>{store.name}</h3>
            <p className="store-address">{store.address}</p>
            <div className="store-rating">
              <span className="rating-label">Overall Rating:</span>
              <span className="rating-value">{store.overallRating} ⭐</span>
            </div>
            {store.userRating && (
              <div className="user-rating">
                <span>Your Rating: {store.userRating} ⭐</span>
              </div>
            )}
            <div className="rating-input">
              <label>Rate this store:</label>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRatingSubmit(store.id, rating)}
                    className={`rating-btn ${store.userRating === rating ? 'active' : ''}`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && !loading && (
        <div className="no-stores">
          <p>No stores found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Stores;
