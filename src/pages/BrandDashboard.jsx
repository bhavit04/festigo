import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import brandService from '../services/brandService';
import Overview from '../components/dashboard/Overview';
import ActiveSponshorships from '../components/dashboard/ActiveSponshorships';
import Preferences from '../components/dashboard/Preferences';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateListing from '../components/dashboard/CreateListing';
import ManageListings from '../components/dashboard/ManageListings';
import Messages from '../components/dashboard/Messages';
import axios from 'axios';
import '../styles/BrandDashboard.css';

const BrandDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalInvestment: 0,
      eventsSponsored: 0
    },
    activeSponshorships: [],
    pendingSponshorships: [],
    preferences: {
      eventTypes: [],
      budgetRange: { min: 0, max: 0 },
      preferredRegions: []
    }
  });
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/conversations/brand/${user._id}/unread`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUnreadMessages(response.data.count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    if (user?._id) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?._id) {
        throw new Error('User ID not available');
      }
      
      console.log('Fetching dashboard data for user:', user._id);
      const data = await brandService.getDashboardData(user._id);
      console.log('Received dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (preferences) => {
    try {
      setLoading(true);
      await brandService.updatePreferences(user._id, preferences);
      await fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('Current user data:', user);

  const ProposalViewModal = ({ proposal, onClose, onUpdateStatus }) => {
    const handleAccept = async () => {
      try {
        await brandService.updateProposalStatus(proposal._id, 'accepted');
        onUpdateStatus(proposal._id, 'accepted');
        alert('Proposal accepted successfully');
        onClose();
      } catch (error) {
        alert('Failed to accept proposal: ' + error.message);
      }
    };

    const handleReject = async () => {
      try {
        await brandService.updateProposalStatus(proposal._id, 'rejected');
        onUpdateStatus(proposal._id, 'rejected');
        alert('Proposal rejected successfully');
        onClose();
      } catch (error) {
        alert('Failed to reject proposal: ' + error.message);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="proposal-view-modal">
          <div className="modal-header">
            <h2>Proposal Review</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div className="pdf-container">
            <iframe
              src={`http://localhost:5000/${proposal.proposalFile}`}
              width="100%"
              height="500px"
              title="Proposal PDF"
            />
          </div>
          <div className="modal-actions">
            {proposal.status === 'pending' && (
              <>
                <button 
                  onClick={handleAccept}
                  className="accept-btn"
                >
                  Accept Proposal
                </button>
                <button 
                  onClick={handleReject}
                  className="reject-btn"
                >
                  Reject Proposal
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="cancel-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProposals = (listing) => {
    if (!listing.proposals || listing.proposals.length === 0) {
      return <p>No proposals received yet</p>;
    }

    return listing.proposals.map((proposal) => (
      <div key={proposal._id} className="proposal-item">
        <div className="proposal-info">
          <span className="college-name">
            {proposal.collegeId?.collegeName || 'Unknown College'}
          </span>
          <span className={`status ${proposal.status}`}>
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </span>
        </div>
        <button
          onClick={() => {
            setSelectedProposal(proposal);
            setShowPdfModal(true);
          }}
          className="view-proposal-btn"
        >
          View Proposal
        </button>
      </div>
    ));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  if (!user || !user._id) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>User data not available</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="company-info">
          <div className="company-logo">
            {user?.companyName?.[0] || 'B'}
          </div>
          <h3>{user?.companyName || 'Company Name'}</h3>
          <p>{user?.industry || 'Industry'}</p>
        </div>

        <nav className="dashboard-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'sponsorships' ? 'active' : ''}`}
            onClick={() => setActiveTab('sponsorships')}
          >
            Active Sponsorships
          </button>
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button 
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
            {unreadMessages > 0 && (
              <span className="notification-badge">{unreadMessages}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            Manage Listings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button 
            className="create-listing-btn"
            onClick={() => setActiveTab('create-listing')}
          >
            + CREATE NEW LISTING
          </button>
        </div>

        {activeTab === 'overview' && (
          <Overview 
            metrics={dashboardData.metrics}
            activeSponshorships={dashboardData.activeSponshorships}
            pendingSponshorships={dashboardData.pendingSponshorships}
          />
        )}

        {activeTab === 'sponsorships' && (
          <ActiveSponshorships 
            sponsorships={dashboardData.activeSponshorships}
          />
        )}

        {activeTab === 'preferences' && (
          <Preferences 
            preferences={dashboardData.preferences}
            onUpdate={handlePreferencesUpdate}
          />
        )}

        {activeTab === 'create-listing' && user && user._id && (
          <CreateListing 
            brandId={user._id.toString()}
            brandName={user.companyName || ''}
            industry={user.industry || ''}
          />
        )}

        {activeTab === 'listings' && (
          <ManageListings brandId={user._id} />
        )}

        {activeTab === 'messages' && (
          <Messages 
            brandId={user._id}
            brandName={user.companyName}
          />
        )}

        {showPdfModal && selectedProposal && (
          <ProposalViewModal
            proposal={selectedProposal}
            onClose={() => {
              setShowPdfModal(false);
              setSelectedProposal(null);
            }}
            onUpdateStatus={(proposalId, newStatus) => {
              // Update the local state to reflect the status change
              const updatedListings = listings.map(listing => ({
                ...listing,
                proposals: listing.proposals?.map(p => 
                  p._id === proposalId 
                    ? { ...p, status: newStatus }
                    : p
                )
              }));
              setListings(updatedListings);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BrandDashboard; 

