import React, { useState } from 'react';
import '../styles/Signup.css';
import Signup_popup from '../components/Signup_popup';

const INDUSTRY_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'banking', label: 'Banking' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'retail', label: 'Retail' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'other', label: 'Other' }
];

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [position, setPosition] = useState('');
  const [eventType, setEventType] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [authorization, setAuthorization] = useState(false);
  const [eventFrequency, setEventFrequency] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [gstin, setGstin] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandEmail, setBrandEmail] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [brandAuthorization, setBrandAuthorization] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!role) {
      alert("Please select a role.");
      return;
    }

    const payload = {
      fullName,
      password,
      role,
      ...(role === 'college' 
        ? {
            collegeName,
            position,
            eventType,
            contactEmail,
            authorization,
            eventFrequency,
            email: contactEmail
          } 
        : {
            companyName,
            industry,
            gstin,
            websiteUrl,
            brandEmail,
            authorization: brandAuthorization,
            email: brandEmail
          })
    };

    console.log('Frontend - Payload being sent:', payload);

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Frontend - Server response:', data);

      if (response.ok) {
        setIsPopupOpen(true);
        setFullName('');
        setPassword('');
        setRole('');
        setCollegeName('');
        setPosition('');
        setEventType('');
        setContactEmail('');
        setAuthorization(false);
        setEventFrequency('');
        setCompanyName('');
        setIndustry('');
        setGstin('');
        setWebsiteUrl('');
        setBrandEmail('');
        setBrandAuthorization(false);
      } else {
        alert(`Signup failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-header">
          <h2 className="signup-title">Create an Account</h2>
          <p className="signup-subtitle">Join us and start your journey</p>
        </div>
        <div className="role-selection">
          <div
            className={`role-box ${role === 'college' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('college')}
          >
            College
          </div>
          <div
            className={`role-box ${role === 'brand' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('brand')}
          >
            Brand
          </div>
        </div>

        {role && (
          <form onSubmit={handleSignup} className="signup-inputs">
            <div className="signup-input-group">
              <label htmlFor="fullName">Full Name of POC</label>
              <input
                type="text"
                id="fullName"
                className="signup-input"
                placeholder="Enter the full name of the POC"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="signup-input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="signup-input"
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {role === 'college' && (
              <>
                <div className="signup-input-group">
                  <label htmlFor="collegeName">College Name</label>
                  <input
                    type="text"
                    id="collegeName"
                    className="signup-input"
                    placeholder="Enter your college name"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="position">Position/Role</label>
                  <input
                    type="text"
                    id="position"
                    className="signup-input"
                    placeholder="Enter your position or role"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="eventType">Event Type</label>
                  <input
                    type="text"
                    id="eventType"
                    className="signup-input"
                    placeholder="Enter the types of events you plan to list"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="contactEmail">Official Contact Email ID</label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="signup-input"
                    placeholder="Enter your official contact email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="eventFrequency">Event Frequency</label>
                  <input
                    type="text"
                    id="eventFrequency"
                    className="signup-input"
                    placeholder="How often does your college host events?"
                    value={eventFrequency}
                    onChange={(e) => setEventFrequency(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group authorization-group">
                  <input
                    type="checkbox"
                    id="authorization"
                    checked={authorization}
                    onChange={(e) => setAuthorization(e.target.checked)}
                  />
                  <label htmlFor="authorization"> I have authorization to represent my college for event listings</label>
                </div>
              </>
            )}

            {role === 'brand' && (
              <>
                <div className="signup-input-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    className="signup-input"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    className="signup-input"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="signup-input-group">
                  <label htmlFor="gstin">GSTIN (Goods and Services Tax Identification Number)</label>
                  <input
                    type="text"
                    id="gstin"
                    className="signup-input"
                    placeholder="Enter your GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="websiteUrl">Website URL</label>
                  <input
                    type="url"
                    id="websiteUrl"
                    className="signup-input"
                    placeholder="Enter your website URL"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group">
                  <label htmlFor="brandEmail">Business Email</label>
                  <input
                    type="email"
                    id="brandEmail"
                    className="signup-input"
                    placeholder="Enter your business email"
                    value={brandEmail}
                    onChange={(e) => setBrandEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="signup-input-group authorization-group">
                  <input
                    type="checkbox"
                    id="brandAuthorization"
                    checked={brandAuthorization}
                    onChange={(e) => setBrandAuthorization(e.target.checked)}
                    required
                  />
                  <label htmlFor="brandAuthorization"> 
                    I have authorization to represent my company for sponsorship opportunities
                  </label>
                </div>
              </>
            )}

            <button type="submit" className="signup-submit-btn">Sign Up</button>
          </form>
        )}

        <div className="signup-footer">
          <p>Already have an account? <a href="/login" className="signup-login-link">Log in</a></p>
        </div>
      </div>
      
      <Signup_popup 
        message="Sign Up Successful!"
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default Signup;
