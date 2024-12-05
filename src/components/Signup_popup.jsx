import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Signup_popup.css';

const Signup_popup = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="signup-popup-overlay">
      <div className="signup-popup-content">
        <div className="signup-popup-message">{message}</div>
        <div className="signup-popup-login">
          <Link to="/login" className="signup-popup-login-link">
            Login to your account
          </Link>
        </div>
        <button className="signup-popup-close" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default Signup_popup;
