/**
 * Item Card Component
 * ===================
 * Displays a single found item in a card format.
 * Used in items listing and profile pages.
 * 
 * Features:
 * - Responsive card design
 * - Image display with fallback
 * - Status badge
 * - Action buttons for item owner
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { toast } from 'react-toastify';

const ItemCard = ({ item, showActions = false, onUpdate }) => {
  const { userProfile } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Check if current user is the uploader
  const isOwner = userProfile?.id === item.uploaded_by;

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

  /**
   * Format time for display
   */
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  /**
   * Get status badge class
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return 'bg-success';
      case 'claimed':
        return 'bg-warning text-dark';
      case 'expired':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  };

  /**
   * Handle item deletion
   */
  const handleDelete = async () => {
    if (!isOwner) return;

    setIsDeleting(true);

    try {
      // Delete image from storage
      if (item.image_url) {
        const imagePath = item.image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('item-images').remove([imagePath]);
      }

      // Delete item from database
      const { error } = await supabase
        .from('found_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item deleted successfully');
      setShowModal(false);
      
      // Trigger parent refresh if callback provided
      if (onUpdate) onUpdate();

    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (newStatus) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('found_items')
        .update({ status: newStatus })
        .eq('id', item.id);

      if (error) throw error;

      toast.success(`Item marked as ${newStatus}`);
      
      // Trigger parent refresh if callback provided
      if (onUpdate) onUpdate();

    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update item');
    }
  };

  return (
    <>
      <div className="card item-card h-100 shadow-sm">
        {/* Image */}
        <div className="item-card-image position-relative">
          <img
            src={item.image_url || '/placeholder-image.png'}
            alt={item.item_name}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
          {/* Status Badge */}
          <span className={`badge ${getStatusBadge(item.status)} position-absolute top-0 end-0 m-2`}>
            {item.status}
          </span>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <h5 className="card-title fw-bold mb-2">{item.item_name}</h5>
          
          {item.description && (
            <p className="card-text text-muted small mb-3" style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {item.description}
            </p>
          )}

          <div className="item-details small">
            {/* Found Location */}
            <div className="d-flex align-items-start mb-2">
              <i className="bi bi-geo-alt text-primary me-2 mt-1"></i>
              <div>
                <span className="text-muted">Found at:</span>
                <div className="fw-medium">{item.found_location}</div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="d-flex align-items-start mb-2">
              <i className="bi bi-calendar text-primary me-2 mt-1"></i>
              <div>
                <span className="text-muted">Found on:</span>
                <div className="fw-medium">
                  {formatDate(item.found_date)} {item.found_time && `at ${formatTime(item.found_time)}`}
                </div>
              </div>
            </div>

            {/* Deposited Location */}
            <div className="d-flex align-items-start">
              <i className="bi bi-building text-primary me-2 mt-1"></i>
              <div>
                <span className="text-muted">Deposited at:</span>
                <div className="fw-medium">{item.deposited_location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="card-footer bg-white border-top-0 pt-0">
          {/* Uploader Info */}
          {item.users && (
            <div className="d-flex align-items-center small text-muted mb-2">
              <i className="bi bi-person-circle me-2"></i>
              <span>Reported by {item.users.full_name}</span>
            </div>
          )}

          {/* Action Buttons (for owner) */}
          {showActions && isOwner && item.status === 'available' && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-success flex-grow-1"
                onClick={() => handleStatusUpdate('claimed')}
              >
                <i className="bi bi-check-circle me-1"></i>
                Mark Claimed
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{item.item_name}</strong>?</p>
                <p className="text-muted small mb-0">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemCard;
