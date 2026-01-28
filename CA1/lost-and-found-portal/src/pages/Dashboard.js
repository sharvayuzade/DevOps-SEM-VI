/**
 * Dashboard Page Component
 * ========================
 * Main landing page after login showing overview and quick actions.
 * Displays different content based on user role.
 * 
 * Features:
 * - Welcome message with user info
 * - Quick statistics (total items, claimed, etc.)
 * - Quick action buttons
 * - Recent activity
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { userProfile, isStudent } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    claimedItems: 0,
    myUploads: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch dashboard statistics
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch total items count
        const { count: totalItems } = await supabase
          .from('found_items')
          .select('*', { count: 'exact', head: true });

        // Fetch available items count
        const { count: availableItems } = await supabase
          .from('found_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'available');

        // Fetch claimed items count
        const { count: claimedItems } = await supabase
          .from('found_items')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'claimed');

        // Fetch user's uploads count (if student)
        let myUploads = 0;
        if (userProfile?.id) {
          const { count } = await supabase
            .from('found_items')
            .select('*', { count: 'exact', head: true })
            .eq('uploaded_by', userProfile.id);
          myUploads = count || 0;
        }

        setStats({
          totalItems: totalItems || 0,
          availableItems: availableItems || 0,
          claimedItems: claimedItems || 0,
          myUploads
        });

        // Fetch recent items
        const { data: recent, error } = await supabase
          .from('found_items')
          .select(`
            id,
            item_name,
            image_url,
            found_location,
            found_date,
            status,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRecentItems(recent || []);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile?.id]);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page py-4">
      <div className="container">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-primary text-white shadow-sm">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h1 className="h3 fw-bold mb-2">
                      Welcome back, {userProfile?.full_name || 'User'}! 👋
                    </h1>
                    <p className="mb-0 opacity-75">
                      {isStudent ? (
                        <>Student • {userProfile?.student_id} • Semester {userProfile?.semester}</>
                      ) : (
                        <>Staff • {userProfile?.department}</>
                      )}
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end mt-3 mt-md-0">
                    {isStudent && (
                      <Link to="/upload" className="btn btn-light btn-lg">
                        <i className="bi bi-plus-circle me-2"></i>
                        Report Found Item
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-4 mb-4">
          {/* Total Items */}
          <div className="col-6 col-md-3">
            <div className="card shadow-sm h-100 stat-card">
              <div className="card-body text-center">
                <div className="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-3">
                  <i className="bi bi-box-seam"></i>
                </div>
                <h3 className="h2 fw-bold mb-1">{stats.totalItems}</h3>
                <p className="text-muted small mb-0">Total Items</p>
              </div>
            </div>
          </div>

          {/* Available Items */}
          <div className="col-6 col-md-3">
            <div className="card shadow-sm h-100 stat-card">
              <div className="card-body text-center">
                <div className="stat-icon bg-success bg-opacity-10 text-success rounded-circle mx-auto mb-3">
                  <i className="bi bi-check-circle"></i>
                </div>
                <h3 className="h2 fw-bold mb-1">{stats.availableItems}</h3>
                <p className="text-muted small mb-0">Available</p>
              </div>
            </div>
          </div>

          {/* Claimed Items */}
          <div className="col-6 col-md-3">
            <div className="card shadow-sm h-100 stat-card">
              <div className="card-body text-center">
                <div className="stat-icon bg-warning bg-opacity-10 text-warning rounded-circle mx-auto mb-3">
                  <i className="bi bi-hand-thumbs-up"></i>
                </div>
                <h3 className="h2 fw-bold mb-1">{stats.claimedItems}</h3>
                <p className="text-muted small mb-0">Claimed</p>
              </div>
            </div>
          </div>

          {/* My Uploads (Students only) */}
          <div className="col-6 col-md-3">
            <div className="card shadow-sm h-100 stat-card">
              <div className="card-body text-center">
                <div className="stat-icon bg-info bg-opacity-10 text-info rounded-circle mx-auto mb-3">
                  <i className="bi bi-cloud-upload"></i>
                </div>
                <h3 className="h2 fw-bold mb-1">{stats.myUploads}</h3>
                <p className="text-muted small mb-0">My Uploads</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Recent Items */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2 text-primary"></i>
                  Recently Added Items
                </h5>
                <Link to="/items" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body p-0">
                {recentItems.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Location</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentItems.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item.image_url || '/placeholder-image.png'}
                                  alt={item.item_name}
                                  className="rounded me-3"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <span className="fw-medium">{item.item_name}</span>
                              </div>
                            </td>
                            <td className="text-muted">{item.found_location}</td>
                            <td className="text-muted">{formatDate(item.found_date)}</td>
                            <td>
                              <span className={`badge ${
                                item.status === 'available' 
                                  ? 'bg-success' 
                                  : item.status === 'claimed' 
                                    ? 'bg-warning' 
                                    : 'bg-secondary'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-3 mb-0">No items found yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-lightning me-2 text-primary"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-3">
                  <Link to="/items" className="btn btn-outline-primary">
                    <i className="bi bi-search me-2"></i>
                    Browse All Items
                  </Link>
                  
                  {isStudent && (
                    <Link to="/upload" className="btn btn-outline-success">
                      <i className="bi bi-plus-circle me-2"></i>
                      Report Found Item
                    </Link>
                  )}
                  
                  <Link to="/profile" className="btn btn-outline-secondary">
                    <i className="bi bi-person me-2"></i>
                    View My Profile
                  </Link>
                </div>

                {/* Tips Card */}
                <div className="alert alert-info mt-4 mb-0">
                  <h6 className="alert-heading">
                    <i className="bi bi-lightbulb me-2"></i>
                    Tip
                  </h6>
                  <p className="small mb-0">
                    Found something on campus? {isStudent ? (
                      <>Report it immediately to help your fellow students!</>
                    ) : (
                      <>Ask students to report it on the portal.</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h6 className="fw-bold">
                  <i className="bi bi-question-circle me-2 text-primary"></i>
                  Need Help?
                </h6>
                <p className="small text-muted mb-2">
                  Contact the Security Office for any assistance regarding lost items.
                </p>
                <p className="small mb-0">
                  <i className="bi bi-telephone me-2"></i>
                  Security: +91 XXXXX XXXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
