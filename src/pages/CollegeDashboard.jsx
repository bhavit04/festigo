import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CollegeDashboard.css';
import axios from 'axios';
import CollegeMessages from '../components/dashboard/CollegeMessages';

const CollegeDashboard = ({ activeTab: initialActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const [collegeEvents, setCollegeEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    confirmedSponsors: 0,
    potentialSponsors: 0,
    totalRevenue: 0
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [location.search, initialActiveTab]);

  useEffect(() => {
    const loadCollegeEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/events/college', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response data:', response.data); // Debug log
        
        // Ensure we have events array
        const events = response.data.events || [];
        setCollegeEvents(events);
        
        // Calculate active events with null checks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeEvents = events.filter(event => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        
        // Update stats with null checks
        setStats({
          totalEvents: events.length,
          activeEvents: activeEvents.length,
          confirmedSponsors: response.data.stats?.confirmedSponsors || 0,
          potentialSponsors: response.data.stats?.potentialSponsors || 0,
          totalRevenue: response.data.stats?.totalRevenue || 0
        });

      } catch (error) {
        console.error('Failed to fetch events:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    
    if (isLoggedIn && user) {
      loadCollegeEvents();
    }
  }, [navigate, user, isLoggedIn]);

  if (!isLoggedIn || !user) {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
      return null;
    }
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}/interests`);
  };

  return (
    <div className="dashboard-container">
      {!isLoggedIn || !user ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-sidebar">
            <div className="dashboard-profile">
              <div className="profile-image">
                {/* Add profile image here if needed */}
              </div>
              <h3>Welcome Back!</h3>
              <p>{user.collegeName || user.email}</p>
            </div>
            <nav className="dashboard-nav">
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('dashboard');
                  navigate('/college-dashboard');
                }}
              >
                Dashboard
              </button>
              <button 
                className="nav-item" 
                onClick={() => navigate('/events/create')}
              >
                Create Event
              </button>
              <button 
                className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('messages');
                  navigate('/college-dashboard?tab=messages');
                }}
              >
                Messages
              </button>
              <button className="nav-item">Settings</button>
            </nav>
          </div>

          <div className="dashboard-main">
            {activeTab === 'messages' ? (
              <CollegeMessages 
                collegeId={user._id}
                collegeName={user.collegeName}
              />
            ) : (
              <>
                <div className="dashboard-header">
                  <h1>Dashboard</h1>
                  <button 
                    className="create-event-btn" 
                    onClick={() => navigate('/events/create')}
                  >
                    + CREATE NEW EVENT
                  </button>
                </div>

                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>Total Events</h3>
                    <p>{stats.totalEvents}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Upcoming Events</h3>
                    <p>{stats.activeEvents}</p>
                    <small>Events that haven't occurred yet</small>
                  </div>
                  <div className="stat-card">
                    <h3>Confirmed Sponsors</h3>
                    <p>{stats.confirmedSponsors}</p>
                    <small>Completed sponsorships</small>
                  </div>
                  <div className="stat-card">
                    <h3>Potential Sponsors</h3>
                    <p>{stats.potentialSponsors}</p>
                    <small>Accepted but not yet completed</small>
                  </div>
                  <div className="stat-card">
                    <h3>Confirmed Revenue</h3>
                    <p>${stats.totalRevenue.toLocaleString()}</p>
                    <small>From completed sponsorships</small>
                  </div>
                </div>

                <div className="dashboard-events">
                  <h2>Your Events</h2>
                  <div className="events-grid">
                    {!collegeEvents || collegeEvents.length === 0 ? (
                      <div className="no-events-message">
                        <p>No events found</p>
                        <button 
                          onClick={() => navigate('/events/create')}
                          className="btn btn-primary"
                        >
                          Create Your First Event
                        </button>
                      </div>
                    ) : (
                      collegeEvents.map(event => (
                        <div 
                          key={event._id} 
                          className="event-card"
                        >
                          {event.image && <img src={event.image} alt={event.title} />}
                          <div className="event-info">
                            <h3>{event.title}</h3>
                            <p>{new Date(event.date).toLocaleDateString()}</p>
                            <div className="event-stats">
                              <span>Interested Brands: {event.interestedBrands?.length || 0}</span>
                              <span>Sponsorship: ${event.sponsorshipNeeded}</span>
                            </div>
                            <div className="event-interests">
                              <p>Pending Interests: {
                                event.interestedBrands?.filter(i => i.status === 'pending').length || 0
                              }</p>
                              <p>Accepted Sponsors: {
                                event.interestedBrands?.filter(i => i.status === 'accepted').length || 0
                              }</p>
                              <p>Completed Sponsorships: {
                                event.interestedBrands?.filter(i => i.status === 'completed').length || 0
                              }</p>
                            </div>
                            <div className="event-actions">
                              <button 
                                className="edit-event-btn"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent event card click
                                  navigate(`/events/${event._id}/edit`);
                                }}
                              >
                                Edit Event
                              </button>
                              <button 
                                className="view-interests-btn"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent event card click
                                  navigate(`/events/${event._id}/interests`);
                                }}
                              >
                                View Interests
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CollegeDashboard;
