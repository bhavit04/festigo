import React from 'react';
import '../styles/EventFilter.css';

function EventFilter({ filters, setFilters }) {
  const categories = ['Technology', 'Business', 'Sports', 'Arts', 'Science'];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="event-filter">
      <div className="filter-group">
        <label>Category:</label>
        <select 
          name="category" 
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Min Budget:</label>
        <input
          type="number"
          name="minBudget"
          value={filters.minBudget}
          onChange={handleFilterChange}
          placeholder="Min $"
        />
      </div>

      <div className="filter-group">
        <label>Max Budget:</label>
        <input
          type="number"
          name="maxBudget"
          value={filters.maxBudget}
          onChange={handleFilterChange}
          placeholder="Max $"
        />
      </div>

      <div className="filter-group">
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
      </div>
    </div>
  );
}

export default EventFilter;