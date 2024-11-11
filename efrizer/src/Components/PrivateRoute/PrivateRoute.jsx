import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const salonId = localStorage.getItem('salonId');

  if (!isAuthenticated || !salonId) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute; 