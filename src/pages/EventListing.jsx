import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import '../styles/EventListing.css';

function EventListing() {
  const { user, isLoggedIn } = useAuth();
  const { events = [], fetchEvents, loading } = useEvents();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: '',
    minBudget: '',
    maxBudget: '',
    date: ''
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Create a flag to prevent multiple calls
    let mounted = true;

    const loadEvents = async () => {
      try {
        if (mounted) {
          await fetchEvents();
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvents();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, navigate]); // Remove fetchEvents from dependency array

  const isCollegeUser = () => {
    return user?.role === 'college';
  };

  return (
    <div className="event-listing">
      <div className="event-listing-header">
        <h1>Event Listings</h1>
        {isLoggedIn && isCollegeUser() && (
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/events/create')}
          >
            Create New Event
          </button>
        )}
      </div>
      
      <EventFilter filters={filters} setFilters={setFilters} />
      
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : !Array.isArray(events) || events.length === 0 ? (
        <div className="no-events-message">
          <p>No events available at the moment.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard 
              key={event._id} 
              event={event}
              showInterestButton={user?.role === 'brand'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventListing;
