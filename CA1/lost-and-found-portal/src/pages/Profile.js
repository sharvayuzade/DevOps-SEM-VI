/**
 * Profile Page Component
 * ======================
 * Displays user profile information and uploaded items.
 * 
 * Features:
 * - User profile display
 * - Role-specific information
 * - List of user's uploaded items
 * - Edit profile functionality
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { toast } from 'react-toastify';
import ItemCard from '../../components/ItemCard';

const Profile = () => {
  const { userProfile, isStudent, logout } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  /**
   * Fetch user's uploaded items
   */
  useEffect(() => {
    const fetchMyItems = async () => {
      if (!userProfile?.id) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('found_items')
          .select('*')
          .eq('uploaded_by', userProfile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setMyItems(data || []);
      } catch (err) {
        console.error('Error fetching my items:', err);
        toast.error('Failed to load your items');
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [userProfile?.id]);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out successfully');
    } else {
      toast.error('Failed to logout');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!userProfile) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page py-4">
      <div className="container">
        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body text-center p-4">
                {/* Avatar */}
                <div className="profile-avatar mx-auto mb-3">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                  >
                    {userProfile.full_name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Name and Role */}
                <h4 className="fw-bold mb-1">{userProfile.full_name}</h4>
                <span className={`badge ${isStudent ? 'bg-primary' : 'bg-success'} mb-3`}>
                  {isStudent ? 'Student' : 'Staff'}
                </span>

                {/* Contact Info */}
                <div className="text-start mt-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-envelope text-primary me-3"></i>
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span>{userProfile.email}</span>
                    </div>
                  </div>

                  {isStudent ? (
                    <>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-card-heading text-primary me-3"></i>
                        <div>
                          <small className="text-muted d-block">Student ID</small>
                          <span>{userProfile.student_id}</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-mortarboard text-primary me-3"></i>
                        <div>
                          <small className="text-muted d-block">Semester</small>
                          <span>Semester {userProfile.semester}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-building text-primary me-3"></i>
                        <div>
                          <small className="text-muted d-block">Department</small>
                          <span>{userProfile.department}</span>
                        </div>
                      </div>
                      {userProfile.employee_id && (
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-person-badge text-primary me-3"></i>
                          <div>
                            <small className="text-muted d-block">Employee ID</small>
                            <span>{userProfile.employee_id}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-check text-primary me-3"></i>
                    <div>
                      <small className="text-muted d-block">Member Since</small>
                      <span>{formatDate(userProfile.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="mt-4 pt-3 border-top">
                  <button 
                    className="btn btn-outline-danger w-100"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-8">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile Overview
                </button>
              </li>
              {isStudent && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                    onClick={() => setActiveTab('items')}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    My Uploads
                    {myItems.length > 0 && (
                      <span className="badge bg-primary ms-2">{myItems.length}</span>
                    )}
                  </button>
                </li>
              )}
            </ul>

            {/* Tab Content */}
            {activeTab === 'profile' ? (
              <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">
                    <i className="bi bi-info-circle me-2 text-primary"></i>
                    Account Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="text-muted small mb-2">Full Name</h6>
                        <p className="mb-0 fw-medium">{userProfile.full_name}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="text-muted small mb-2">Email Address</h6>
                        <p className="mb-0 fw-medium">{userProfile.email}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="text-muted small mb-2">Role</h6>
                        <p className="mb-0 fw-medium text-capitalize">{userProfile.role}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="text-muted small mb-2">
                          {isStudent ? 'Student ID' : 'Department'}
                        </h6>
                        <p className="mb-0 fw-medium">
                          {isStudent ? userProfile.student_id : userProfile.department}
                        </p>
                      </div>
                    </div>
                    {isStudent && (
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded">
                          <h6 className="text-muted small mb-2">Current Semester</h6>
                          <p className="mb-0 fw-medium">Semester {userProfile.semester}</p>
                        </div>
                      </div>
                    )}
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="text-muted small mb-2">Items Uploaded</h6>
                        <p className="mb-0 fw-medium">{myItems.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* My Items Tab */
              <div>
                <h5 className="mb-3">
                  <i className="bi bi-box-seam me-2 text-primary"></i>
                  Items I've Reported
                </h5>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : myItems.length > 0 ? (
                  <div className="row g-4">
                    {myItems.map(item => (
                      <div key={item.id} className="col-sm-6">
                        <ItemCard item={item} showActions={true} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                      <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                      <h5 className="mt-3">No items uploaded yet</h5>
                      <p className="text-muted">
                        Found something on campus? Report it to help someone find their belongings.
                      </p>
                      <a href="/upload" className="btn btn-primary mt-2">
                        <i className="bi bi-plus-circle me-2"></i>
                        Report Found Item
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
