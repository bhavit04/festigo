import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authService';
import '../styles/Navbar.css';

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn, logout } = useAuth();
  const dropdownRef = useRef(null);
  
  const isOnDashboard = location.pathname.includes('dashboard');

  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    try {
      authService.logout();
      setIsLoggedIn(false);
      setShowDropdown(false);
      window.location.href = '/login';
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboardClick = () => {
    const userRole = getUserRole();
    setShowDropdown(false);
    if (userRole === 'college') {
      navigate('/college-dashboard');
    } else {
      navigate('/brand-dashboard');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/logo.png" 
            alt="Festigo" 
            className="logo-image"
            onError={(e) => {
              console.error('Image failed to load:', e);
              console.log('Attempted image path:', e.target.src);
            }}
          />
        </Link>
        <div className="navbar-links">
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/browse" className="nav-link">Browse</Link>
          <Link to="/faqs" className="nav-link">FAQs</Link>
          <Link to="/connect" className="nav-link">Connect</Link>
        </div>
        <div className="navbar-auth">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
            </>
          ) : (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <i className="fas fa-user"></i>
              </button>
              {showDropdown && (
                <div className="user-dropdown">
                  {!isOnDashboard && (
                    <button onClick={handleDashboardClick}>Dashboard</button>
                  )}
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
