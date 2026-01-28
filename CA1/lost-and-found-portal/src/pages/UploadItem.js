/**
 * Upload Item Page Component
 * ==========================
 * Allows students to report found items with details and images.
 * Only accessible to users with 'student' role.
 * 
 * Features:
 * - Image upload with preview
 * - Form validation
 * - Supabase Storage integration
 * - Database record creation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { toast } from 'react-toastify';

const UploadItem = () => {
  const navigate = useNavigate();
  const { userProfile, isStudent } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    foundLocation: '',
    foundDate: '',
    foundTime: '',
    depositedLocation: ''
  });
  
  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common deposit locations
  const depositLocations = [
    'Security Office - Main Gate',
    'Security Office - Back Gate',
    'Admin Office',
    'Library - Lost & Found Counter',
    'Computer Lab 1',
    'Computer Lab 2',
    'Computer Lab 3',
    'Cafeteria Counter',
    'Sports Complex Office',
    'Department Office - CSE',
    'Department Office - IT',
    'Department Office - ECE',
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
   * Handle image selection
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  /**
   * Remove selected image
   */
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (!formData.foundLocation.trim()) {
      newErrors.foundLocation = 'Found location is required';
    }

    if (!formData.foundDate) {
      newErrors.foundDate = 'Found date is required';
    } else {
      const foundDate = new Date(formData.foundDate);
      const today = new Date();
      if (foundDate > today) {
        newErrors.foundDate = 'Found date cannot be in the future';
      }
    }

    if (!formData.foundTime) {
      newErrors.foundTime = 'Found time is required';
    }

    if (!formData.depositedLocation) {
      newErrors.depositedLocation = 'Please select where item is deposited';
    }

    if (!selectedImage) {
      newErrors.image = 'Please upload an image of the item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Upload image to Supabase Storage
   */
  const uploadImage = async () => {
    if (!selectedImage) return null;

    // Create unique filename
    const fileExt = selectedImage.name.split('.').pop();
    const fileName = `${userProfile.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('item-images')
      .upload(fileName, selectedImage, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!isStudent) {
      toast.error('Only students can upload items');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload image to storage
      const imageUrl = await uploadImage();

      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // 2. Create found item record
      const { error: insertError } = await supabase
        .from('found_items')
        .insert({
          uploaded_by: userProfile.id,
          item_name: formData.itemName.trim(),
          description: formData.description.trim() || null,
          image_url: imageUrl,
          found_location: formData.foundLocation.trim(),
          found_date: formData.foundDate,
          found_time: formData.foundTime,
          deposited_location: formData.depositedLocation,
          status: 'available'
        });

      if (insertError) throw insertError;

      toast.success('Item reported successfully!');
      navigate('/items');

    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not a student
  if (!isStudent) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-shield-x text-danger" style={{ fontSize: '4rem' }}></i>
          <h2 className="mt-3">Access Denied</h2>
          <p className="text-muted">Only students can report found items.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Page Header */}
            <div className="mb-4">
              <h1 className="h3 fw-bold">
                <i className="bi bi-plus-circle me-2 text-primary"></i>
                Report Found Item
              </h1>
              <p className="text-muted">
                Found something on campus? Fill in the details below to help someone find their belongings.
              </p>
            </div>

            {/* Upload Form Card */}
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Image Upload Section */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-image me-2"></i>
                      Item Image <span className="text-danger">*</span>
                    </label>
                    
                    {!imagePreview ? (
                      <div 
                        className={`upload-zone border-2 border-dashed rounded-3 p-5 text-center ${errors.image ? 'border-danger' : 'border-primary'}`}
                        style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                        onClick={() => document.getElementById('imageInput').click()}
                      >
                        <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3 mb-1 fw-medium">Click to upload image</p>
                        <p className="small text-muted mb-0">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          id="imageInput"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    ) : (
                      <div className="position-relative d-inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-fluid rounded-3 shadow-sm"
                          style={{ maxHeight: '300px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                          onClick={removeImage}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    )}
                    
                    {errors.image && (
                      <div className="text-danger small mt-2">{errors.image}</div>
                    )}
                  </div>

                  {/* Item Name */}
                  <div className="mb-3">
                    <label htmlFor="itemName" className="form-label fw-semibold">
                      <i className="bi bi-tag me-2"></i>
                      Item Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.itemName ? 'is-invalid' : ''}`}
                      id="itemName"
                      name="itemName"
                      placeholder="e.g., Blue Water Bottle, Silver Earring, ID Card"
                      value={formData.itemName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {errors.itemName && (
                      <div className="invalid-feedback">{errors.itemName}</div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-semibold">
                      <i className="bi bi-card-text me-2"></i>
                      Description <span className="text-muted small">(Optional)</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      placeholder="Add any additional details about the item (brand, color, distinctive features...)"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Found Location */}
                  <div className="mb-3">
                    <label htmlFor="foundLocation" className="form-label fw-semibold">
                      <i className="bi bi-geo-alt me-2"></i>
                      Where was it found? <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.foundLocation ? 'is-invalid' : ''}`}
                      id="foundLocation"
                      name="foundLocation"
                      placeholder="e.g., Library - 2nd Floor, Near Cafeteria, Computer Lab 3"
                      value={formData.foundLocation}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    {errors.foundLocation && (
                      <div className="invalid-feedback">{errors.foundLocation}</div>
                    )}
                  </div>

                  {/* Date and Time Row */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="foundDate" className="form-label fw-semibold">
                        <i className="bi bi-calendar me-2"></i>
                        Date Found <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.foundDate ? 'is-invalid' : ''}`}
                        id="foundDate"
                        name="foundDate"
                        value={formData.foundDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        disabled={isSubmitting}
                      />
                      {errors.foundDate && (
                        <div className="invalid-feedback">{errors.foundDate}</div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="foundTime" className="form-label fw-semibold">
                        <i className="bi bi-clock me-2"></i>
                        Time Found <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className={`form-control ${errors.foundTime ? 'is-invalid' : ''}`}
                        id="foundTime"
                        name="foundTime"
                        value={formData.foundTime}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      {errors.foundTime && (
                        <div className="invalid-feedback">{errors.foundTime}</div>
                      )}
                    </div>
                  </div>

                  {/* Deposited Location */}
                  <div className="mb-4">
                    <label htmlFor="depositedLocation" className="form-label fw-semibold">
                      <i className="bi bi-building me-2"></i>
                      Where is the item deposited? <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${errors.depositedLocation ? 'is-invalid' : ''}`}
                      id="depositedLocation"
                      name="depositedLocation"
                      value={formData.depositedLocation}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Select deposit location</option>
                      {depositLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.depositedLocation && (
                      <div className="invalid-feedback">{errors.depositedLocation}</div>
                    )}
                    <div className="form-text">
                      Please deposit the item at the selected location after submitting.
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg flex-grow-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Submit Report
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => navigate('/dashboard')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Help Card */}
            <div className="alert alert-info mt-4">
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>
                Tips for reporting
              </h6>
              <ul className="small mb-0 ps-3">
                <li>Take a clear photo of the item</li>
                <li>Include any distinctive features in the description</li>
                <li>Be specific about the location where you found it</li>
                <li>Deposit the item at the selected location as soon as possible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadItem;
