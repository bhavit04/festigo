import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaUsers, FaTag } from 'react-icons/fa';
import '../styles/EventCard.css';

function EventCard({ event, onInterestClick }) {
  const { user } = useAuth();
  const { showInterest } = useEvents();
  const isBrand = user?.role === 'brand';

  const handleInterestClick = async (e) => {
    e.stopPropagation();
    try {
      const amount = event.sponsorshipNeeded;
      await showInterest(event._id, { sponsorshipAmount: amount });
      toast.success('Interest shown successfully!');
      if (onInterestClick) onInterestClick(event._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to show interest');
    }
  };

  const hasShownInterest = event.interestedBrands?.some(
    interest => interest.brand === user?.id
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="event-card">
      {event.image ? (
        <img src={event.image} alt={event.title} className="event-image" />
      ) : (
        <div className="event-image-placeholder" />
      )}
      <div className="event-details">
        <h3>{event.title}</h3>
        
        <div className="event-meta">
          <span className="date">
            <FaCalendarAlt />
            {formatDate(event.date)}
          </span>
          <span className="category">
            <FaTag />
            {event.category}
          </span>
        </div>

        <div className="sponsorship">
          Sponsorship Amount: 
          <span className="sponsorship-amount"> ${event.sponsorshipNeeded.toLocaleString()}</span>
        </div>

        <span className="attendees">
          <FaUsers />
          Expected Attendees: {event.attendees.toLocaleString()}
        </span>

        <p className="description">{event.description}</p>
        
        {isBrand && (
          <div className="interest-section">
            {!hasShownInterest ? (
              <button 
                className="interest-btn"
                onClick={handleInterestClick}
              >
                Show Interest
              </button>
            ) : (
              <span className="interest-status">Interest Shown</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCard;
