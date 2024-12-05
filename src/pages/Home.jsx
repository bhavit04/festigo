import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Connect College Events with Sponsors</h1>
        <p>The ultimate platform for colleges to find sponsors and for brands to discover sponsorship opportunities.</p>
        <div className="cta-buttons">
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
          <Link to="/events" className="btn btn-secondary">Create Event</Link>
        </div>
      </section>
      
      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Free Event Listings</h3>
            <p>List your college events at no cost</p>
          </div>
          <div className="feature-card">
            <h3>Profile Creation</h3>
            <p>Create detailed profiles for colleges and brands</p>
          </div>
          <div className="feature-card">
            <h3>Direct Communication</h3>
            <p>Built-in messaging system for seamless coordination</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;