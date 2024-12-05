import React, { useState, useEffect } from 'react';
import { useEvents } from '../../context/EventContext';

const ActiveSponshorships = () => {
  const { getBrandEvents } = useEvents();
  const [brandEvents, setBrandEvents] = useState([]);

  useEffect(() => {
    const fetchBrandEvents = async () => {
      try {
        const events = await getBrandEvents();
        setBrandEvents(events);
      } catch (error) {
        console.error('Error fetching brand events:', error);
      }
    };

    fetchBrandEvents();
  }, []);

  return (
    <div className="active-sponsorships">
      <h2>Active Sponsorships</h2>
      <div className="sponsorships-grid">
        {brandEvents.map(sponsorship => (
          <div key={sponsorship._id} className="sponsorship-detail-card">
            <div className="card-header">
              <h3>{sponsorship.eventId.title}</h3>
              <span className="status-badge">{sponsorship.status}</span>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span>Amount:</span>
                <span>₹{sponsorship.amount}</span>
              </div>
              <div className="info-row">
                <span>College:</span>
                <span>{sponsorship.eventId.collegeName}</span>
              </div>
              <div className="info-row">
                <span>Date:</span>
                <span>{new Date(sponsorship.eventId.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="deliverables-section">
              <h4>Deliverables</h4>
              {sponsorship.deliverables.map((item, index) => (
                <div key={index} className="deliverable-item">
                  <input
                    type="checkbox"
                    checked={item.status === 'completed'}
                    onChange={() => handleDeliverableToggle(sponsorship._id, index)}
                  />
                  <span>{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveSponshorships; 
