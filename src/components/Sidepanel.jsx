import React from 'react';
import '../styles/Sidepanel.css';

const SidePanel = () => {
  return (
    <div className="side-panel">
      <div className="role-selection">
        <h3 className="role-header">Select Role</h3>
        <div className="role-options">
          <button className="role-btn">Organiser</button>
          <button className="role-btn">Vendor</button>
          <button className="role-btn">Sponsor</button>
        </div>
      </div>
      <div className="ask-nemo">
        <h3 className="nemo-header">Ask Nemo</h3>
        {/* Add your Nemo AI assistant functionality here */}
      </div>
    </div>
  );
};

export default SidePanel;