/**
 * Protected Route Component
 * =========================
 * Wrapper component that protects routes from unauthorized access.
 * Redirects to login if user is not authenticated.
 * 
 * Features:
 * - Authentication check
 * - Loading state handling
 * - Optional role-based access control
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles specified
  if (allowedRoles.length > 0 && userProfile) {
    if (!allowedRoles.includes(userProfile.role)) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-shield-x text-danger" style={{ fontSize: '4rem' }}></i>
            <h2 className="mt-3">Access Denied</h2>
            <p className="text-muted">You don't have permission to access this page.</p>
            <a href="/dashboard" className="btn btn-primary mt-3">
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
