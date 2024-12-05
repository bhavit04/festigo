import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { toast } from 'react-toastify';
import '../styles/EventInterests.css';
import '../styles/LoadingSpinner.css';

function EventInterests() {
  const { eventId } = useParams();
  const { getEventInterests, updateInterestStatus, loading } = useEvents();
  const [eventDetails, setEventDetails] = useState(null);
  const [interests, setInterests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadInterests();
  }, [eventId]);

  const loadInterests = async () => {
    try {
      const data = await getEventInterests(eventId);
      console.log('Raw interests data:', JSON.stringify(data, null, 2));
      setEventDetails(data.event);
      setInterests(data.interestedBrands);
    } catch (error) {
      console.error('Error loading interests:', error);
      toast.error('Failed to load interests');
    }
  };

  const handleStatusUpdate = async (brandId, status) => {
    try {
      await updateInterestStatus(eventId, brandId, status);
      toast.success(`Brand ${status} successfully`);
      await loadInterests();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleMessage = (brandId) => {
    navigate(`/college/messages?brandId=${brandId}&eventId=${eventId}`);
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="interests-container">
      <h2>Event Interests</h2>
      <div className="interests-grid">
        {interests.map((interest) => {
          console.log('Processing interest:', interest);
          
          const brandData = interest.brand || {};
          const companyName = brandData.companyName || 'Unknown Brand';
          const industry = brandData.industry || 'N/A';
          const email = brandData.brandEmail || brandData.email || 'N/A';
          const website = brandData.websiteUrl || 'N/A';
          const sponsorshipAmount = interest.sponsorshipAmount || 0;

          return (
            <div key={interest.brand?._id} className="interest-card">
              <div className="brand-info">
                <h3>{companyName}</h3>
                <p className={`status ${interest.status}`}>
                  Status: {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                </p>
              </div>
              <div className="brand-details">
                <p><strong>Industry:</strong> {industry}</p>
                <p><strong>Email:</strong> {email}</p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a 
                    href={website.startsWith('http') ? website : `https://${website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="website-link"
                  >
                    {website}
                  </a>
                </p>
                <p><strong>Sponsorship Amount:</strong> ${sponsorshipAmount}</p>
              </div>
              {interest.status === 'pending' && (
                <div className="action-buttons">
                  <button
                    className="accept-btn"
                    onClick={() => handleStatusUpdate(interest.brand?._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusUpdate(interest.brand?._id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
              {interest.status === 'accepted' && (
                <div className="accepted-info">
                  <p><strong>Accepted Brand:</strong> {companyName}</p>
                  <button
                    className="message-btn"
                    onClick={() => handleMessage(interest.brand?._id)}
                  >
                    Message Brand
                  </button>
                  <button
                    className="complete-btn"
                    onClick={() => handleStatusUpdate(interest.brand?._id, 'completed')}
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventInterests; 
