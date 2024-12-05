import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authService';
import '../styles/Login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.user && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        login(response.user, response.token);
        
        if (response.user.role === 'college') {
          navigate('/college-dashboard');
        } else if (response.user.role === 'brand') {
          navigate('/brand-dashboard');
        }
        
        console.log('Login successful:', {
          token: response.token,
          user: response.user
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
      alert(error.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Log in to your account</p>
          </div>
          
          <div className="login-inputs">
            <div className="login-input-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
                className="login-input"
              />
            </div>
            
            <div className="login-input-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
                className="login-input"
              />
            </div>
          </div>
          
          <div className="login-actions">
            <a href="/forgot-password" className="login-forgot-link">Forgot Password?</a>
            <button type="submit" className="login-submit-btn">Log In</button>
          </div>
          
          <div className="login-footer">
            <p>Don't have an account? 
              <a href="/signup" className="login-signup-link"> Sign Up</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
