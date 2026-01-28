/**
 * Signup Page Component
 * =====================
 * Handles new user registration with role-based forms.
 * Supports both Student and Staff registration.
 * 
 * Features:
 * - Role selection (Student/Staff)
 * - Dynamic form fields based on role
 * - Form validation
 * - Supabase Auth integration
 * - Profile creation in database
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();

  // Selected role state
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Student fields
    studentId: '',
    semester: '',
    // Staff fields
    department: '',
    employeeId: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Department options for staff
  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Administration',
    'Library',
    'Finance',
    'Human Resources',
    'Other'
  ];

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
   * Validate form inputs based on selected role
   */
  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Student-specific validations
    if (selectedRole === 'student') {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }
      if (!formData.semester) {
        newErrors.semester = 'Semester is required';
      } else {
        const sem = parseInt(formData.semester);
        if (isNaN(sem) || sem < 1 || sem > 8) {
          newErrors.semester = 'Semester must be between 1 and 8';
        }
      }
    }

    // Staff-specific validations
    if (selectedRole === 'staff') {
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
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
      // Prepare role-specific data
      const roleData = selectedRole === 'student' 
        ? {
            studentId: formData.studentId,
            semester: parseInt(formData.semester)
          }
        : {
            department: formData.department,
            employeeId: formData.employeeId || null
          };

      const result = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: selectedRole,
        roleData
      });

      if (result.success) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/login');
      } else {
        toast.error(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset form when changing role
   */
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center align-items-center py-5">
          <div className="col-md-8 col-lg-6 col-xl-5">
            {/* Logo and Title */}
            <div className="text-center mb-4">
              <div className="auth-logo mb-3">
                <i className="bi bi-search-heart text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h1 className="h3 fw-bold text-primary">SIT Nagpur</h1>
              <p className="text-muted">Lost & Found Portal - Create Account</p>
            </div>

            {/* Signup Card */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                
                {/* Role Selection */}
                {!selectedRole ? (
                  <>
                    <h2 className="card-title text-center mb-4 h4">I am a...</h2>
                    
                    <div className="row g-3">
                      {/* Student Role Card */}
                      <div className="col-6">
                        <div 
                          className="card role-card h-100 text-center p-4 cursor-pointer"
                          onClick={() => handleRoleSelect('student')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body">
                            <i className="bi bi-mortarboard text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5 className="card-title">Student</h5>
                            <p className="card-text small text-muted">
                              I'm studying at SIT Nagpur
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Staff Role Card */}
                      <div className="col-6">
                        <div 
                          className="card role-card h-100 text-center p-4 cursor-pointer"
                          onClick={() => handleRoleSelect('staff')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body">
                            <i className="bi bi-person-badge text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5 className="card-title">Staff</h5>
                            <p className="card-text small text-muted">
                              I work at SIT Nagpur
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Back Button */}
                    <button 
                      className="btn btn-link text-muted p-0 mb-3"
                      onClick={() => setSelectedRole(null)}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Change role
                    </button>

                    <h2 className="card-title text-center mb-4 h4">
                      {selectedRole === 'student' ? (
                        <><i className="bi bi-mortarboard me-2"></i>Student Registration</>
                      ) : (
                        <><i className="bi bi-person-badge me-2"></i>Staff Registration</>
                      )}
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                      {/* Full Name */}
                      <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">
                          <i className="bi bi-person me-2"></i>Full Name
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                          id="fullName"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        {errors.fullName && (
                          <div className="invalid-feedback">{errors.fullName}</div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          <i className="bi bi-envelope me-2"></i>Email Address
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          placeholder="your.email@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      {/* Student-specific fields */}
                      {selectedRole === 'student' && (
                        <>
                          <div className="mb-3">
                            <label htmlFor="studentId" className="form-label">
                              <i className="bi bi-card-heading me-2"></i>Student ID
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors.studentId ? 'is-invalid' : ''}`}
                              id="studentId"
                              name="studentId"
                              placeholder="e.g., SIT2024001"
                              value={formData.studentId}
                              onChange={handleChange}
                              disabled={isSubmitting}
                            />
                            {errors.studentId && (
                              <div className="invalid-feedback">{errors.studentId}</div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label htmlFor="semester" className="form-label">
                              <i className="bi bi-calendar3 me-2"></i>Current Semester
                            </label>
                            <select
                              className={`form-select ${errors.semester ? 'is-invalid' : ''}`}
                              id="semester"
                              name="semester"
                              value={formData.semester}
                              onChange={handleChange}
                              disabled={isSubmitting}
                            >
                              <option value="">Select semester</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                              ))}
                            </select>
                            {errors.semester && (
                              <div className="invalid-feedback">{errors.semester}</div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Staff-specific fields */}
                      {selectedRole === 'staff' && (
                        <>
                          <div className="mb-3">
                            <label htmlFor="department" className="form-label">
                              <i className="bi bi-building me-2"></i>Department
                            </label>
                            <select
                              className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                              id="department"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              disabled={isSubmitting}
                            >
                              <option value="">Select department</option>
                              {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                            {errors.department && (
                              <div className="invalid-feedback">{errors.department}</div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label htmlFor="employeeId" className="form-label">
                              <i className="bi bi-card-heading me-2"></i>Employee ID 
                              <span className="text-muted small ms-1">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="employeeId"
                              name="employeeId"
                              placeholder="e.g., EMP001"
                              value={formData.employeeId}
                              onChange={handleChange}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

                      {/* Password */}
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          <i className="bi bi-lock me-2"></i>Password
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          placeholder="Create a password (min. 6 characters)"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">
                          <i className="bi bi-lock-fill me-2"></i>Confirm Password
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
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
                              Creating account...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-plus me-2"></i>
                              Create Account
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* Divider */}
                <hr className="my-4" />

                {/* Login Link */}
                <p className="text-center text-muted mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                    Login here
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

export default Signup;
