import React, { useState } from 'react';

const Preferences = ({ preferences, onUpdate }) => {
  const [formData, setFormData] = useState({
    eventTypes: preferences.eventTypes || [],
    budgetRange: preferences.budgetRange || { min: 0, max: 0 },
    preferredRegions: preferences.preferredRegions || []
  });

  const EVENT_TYPES = [
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Conference'
  ];

  const REGIONS = [
    'North India',
    'South India',
    'East India',
    'West India',
    'Central India'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="preferences-section">
      <h2>Sponsorship Preferences</h2>
      <form onSubmit={handleSubmit} className="preferences-form">
        <div className="form-group">
          <h3>Event Types</h3>
          <div className="checkbox-group">
            {EVENT_TYPES.map(type => (
              <label key={type} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.eventTypes.includes(type)}
                  onChange={(e) => {
                    const updatedTypes = e.target.checked
                      ? [...formData.eventTypes, type]
                      : formData.eventTypes.filter(t => t !== type);
                    setFormData({ ...formData, eventTypes: updatedTypes });
                  }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <h3>Budget Range</h3>
          <div className="budget-inputs">
            <div className="input-group">
              <label>Minimum (₹)</label>
              <input
                type="number"
                value={formData.budgetRange.min}
                onChange={(e) => setFormData({
                  ...formData,
                  budgetRange: { ...formData.budgetRange, min: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="input-group">
              <label>Maximum (₹)</label>
              <input
                type="number"
                value={formData.budgetRange.max}
                onChange={(e) => setFormData({
                  ...formData,
                  budgetRange: { ...formData.budgetRange, max: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <h3>Preferred Regions</h3>
          <div className="checkbox-group">
            {REGIONS.map(region => (
              <label key={region} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.preferredRegions.includes(region)}
                  onChange={(e) => {
                    const updatedRegions = e.target.checked
                      ? [...formData.preferredRegions, region]
                      : formData.preferredRegions.filter(r => r !== region);
                    setFormData({ ...formData, preferredRegions: updatedRegions });
                  }}
                />
                {region}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="save-preferences-btn">
          Save Preferences
        </button>
      </form>
    </div>
  );
};

export default Preferences; 
