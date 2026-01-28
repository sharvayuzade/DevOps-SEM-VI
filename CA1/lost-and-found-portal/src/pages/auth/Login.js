/**
 * Login Page Component
 * ====================
 * Handles user authentication with email and password.
 * Uses Supabase Auth for secure login.
 * 
 * Features:
 * - Email/password login form
 * - Form validation
 * - Error handling and display
 * - Redirect to dashboard after login
 * - Link to signup page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Login successful! Welcome back.');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5 col-xl-4">
            {/* Logo and Title */}
            <div className="text-center mb-4">
              <div className="auth-logo mb-3">
                <i className="bi bi-search-heart text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h1 className="h3 fw-bold text-primary">SIT Nagpur</h1>
              <p className="text-muted">Lost & Found Portal</p>
            </div>

            {/* Login Card */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="card-title text-center mb-4 h4">Welcome Back</h2>
                
                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="your.email@sitpune.edu.in"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock me-2"></i>Password
                    </label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Login
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <hr className="my-4" />

                {/* Signup Link */}
                <p className="text-center text-muted mb-0">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary text-decoration-none fw-semibold">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-muted mt-4 small">
              © {new Date().getFullYear()} Symbiosis Institute of Technology, Nagpur
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
