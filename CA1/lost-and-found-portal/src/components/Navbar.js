/**
 * Navbar Component
 * ================
 * Main navigation bar for the application.
 * Shows different options based on auth state.
 * 
 * Features:
 * - Responsive design with Bootstrap
 * - Auth-aware navigation links
 * - User dropdown menu
 * - Mobile-friendly hamburger menu
 */

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isStudent, logout } = useAuth();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out successfully');
      navigate('/login');
    } else {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to={isAuthenticated ? '/dashboard' : '/'}>
          <i className="bi bi-search-heart text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
          <span className="fw-bold">
            SIT Nagpur <span className="text-primary">Lost & Found</span>
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
                    to="/dashboard"
                  >
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </NavLink>
                </li>

                {/* Browse Items */}
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
                    to="/items"
                  >
                    <i className="bi bi-grid-3x3-gap me-1"></i>
                    Browse Items
                  </NavLink>
                </li>

                {/* Upload (Students Only) */}
                {isStudent && (
                  <li className="nav-item">
                    <NavLink 
                      className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
                      to="/upload"
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Report Item
                    </NavLink>
                  </li>
                )}

                {/* User Dropdown */}
                <li className="nav-item dropdown ms-lg-3">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center btn btn-link"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                      style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}
                    >
                      {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="d-none d-lg-inline">
                      {userProfile?.full_name?.split(' ')[0] || 'User'}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-semibold">{userProfile?.full_name}</div>
                      <div className="small text-muted">{userProfile?.email}</div>
                      <span className={`badge ${isStudent ? 'bg-primary' : 'bg-success'} mt-1`}>
                        {isStudent ? 'Student' : 'Staff'}
                      </span>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        My Profile
                      </Link>
                    </li>
                    {isStudent && (
                      <li>
                        <Link className="dropdown-item" to="/profile?tab=items">
                          <i className="bi bi-box-seam me-2"></i>
                          My Uploads
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* Login */}
                <li className="nav-item">
                  <NavLink 
                    className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
                    to="/login"
                  >
                    Login
                  </NavLink>
                </li>

                {/* Signup */}
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-primary" to="/signup">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
