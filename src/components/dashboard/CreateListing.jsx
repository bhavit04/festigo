import React, { useState } from 'react';
import brandService from '../../services/brandService';
import '../../styles/CreateListing.css';

const CreateListing = ({ brandId, brandName, industry }) => {
  const [formData, setFormData] = useState({
    budgetRange: '0-50000',
    preferredEvents: [],
    description: '',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const eventTypes = [
    'Hackathons',
    'Tech Fests',
    'Cultural Fests',
    'Sports Events',
    'Business Conclaves',
    'E-Summit',
    'Workshops',
    'Conferences'
  ];

  const handleEventTypeToggle = (eventType) => {
    setFormData(prev => ({
      ...prev,
      preferredEvents: prev.preferredEvents.includes(eventType)
        ? prev.preferredEvents.filter(e => e !== eventType)
        : [...prev.preferredEvents, eventType]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!brandId || !brandName || !industry) {
        setError('Missing required brand information');
        return;
      }

      const listingData = {
        brandId,
        brandName,
        industry,
        budgetRange: formData.budgetRange,
        preferredEvents: formData.preferredEvents,
        description: formData.description || '',
        requirements: formData.requirements || '',
        status: 'active'
      };
      console.log('Submitting listing data:', listingData);
      
      const response = await brandService.createListing(listingData);
      console.log('Listing created successfully:', response);
      
      setSuccess(true);
      setFormData({
        budgetRange: '0-50000',
        preferredEvents: [],
        description: '',
        requirements: ''
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-container">
      <h2>Create Sponsorship Listing</h2>
      
      {success && (
        <div className="success-message">
          Listing created successfully!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="listing-form">
        <div className="form-group">
          <label>Budget Range</label>
          <select
            value={formData.budgetRange}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              budgetRange: e.target.value
            }))}
          >
            <option value="0-50000">Under ₹50,000</option>
            <option value="50000-200000">₹50,000 - ₹2,00,000</option>
            <option value="200000+">Above ₹2,00,000</option>
          </select>
        </div>

        <div className="form-group">
          <label>Preferred Event Types</label>
          <div className="event-types-grid">
            {eventTypes.map(type => (
              <label key={type} className="event-type-checkbox">
                <input
                  type="checkbox"
                  checked={formData.preferredEvents.includes(type)}
                  onChange={() => handleEventTypeToggle(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))}
            placeholder="Describe your sponsorship offerings and company..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Requirements</label>
          <textarea
            value={formData.requirements}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              requirements: e.target.value
            }))}
            placeholder="List your requirements from the college events..."
            rows={4}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing; 
