import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isLoggedIn } = useAuth();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
