import React from 'react';

const Overview = ({ metrics, activeSponshorships, pendingSponshorships }) => {
  return (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Investment</h3>
          <p className="stat-number">₹{metrics.totalInvestment}</p>
        </div>
        <div className="stat-card">
          <h3>Events Sponsored</h3>
          <p className="stat-number">{metrics.eventsSponsored}</p>
        </div>
        <div className="stat-card">
          <h3>Active Sponsorships</h3>
          <p className="stat-number">{activeSponshorships.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p className="stat-number">{pendingSponshorships.length}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Active Sponsorships</h3>
        <div className="sponsorships-list">
          {activeSponshorships.map(sponsorship => (
            <div key={sponsorship._id} className="sponsorship-card">
              <h4>{sponsorship.eventId.title}</h4>
              <p>Amount: ₹{sponsorship.amount}</p>
              <p>Status: {sponsorship.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview; 
