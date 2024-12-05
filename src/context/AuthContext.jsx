import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize based on token existence
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('Auth initialization:', {
        hasToken: !!token,
        hasUser: !!savedUser
      });

      if (token && savedUser) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Auth verification successful:', response.data);
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    console.log('Login called with:', { userData, hasToken: !!token });
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoggedIn, 
      setIsLoggedIn, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
