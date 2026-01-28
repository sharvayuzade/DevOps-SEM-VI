/**
 * Items Listing Page Component
 * ============================
 * Displays all found items in a responsive card grid.
 * Supports filtering and searching.
 * 
 * Features:
 * - Responsive card layout
 * - Status filtering
 * - Search functionality
 * - Real-time data from Supabase
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'react-toastify';
import ItemCard from '../../components/ItemCard';

const ItemsListing = () => {
  // State
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  /**
   * Fetch items from database
   */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        // Fetch items with uploader information
        const { data, error } = await supabase
          .from('found_items')
          .select(`
            *,
            users:uploaded_by (
              id,
              full_name,
              email,
              role
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setItems(data || []);
        setFilteredItems(data || []);

      } catch (err) {
        console.error('Error fetching items:', err);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Set up real-time subscription
    const subscription = supabase
      .channel('found_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'found_items' },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchItems(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Filter and sort items based on search/filter criteria
   */
  useEffect(() => {
    let result = [...items];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.item_name.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.found_location.toLowerCase().includes(search) ||
        item.deposited_location.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'name':
        result.sort((a, b) => a.item_name.localeCompare(b.item_name));
        break;
      default:
        break;
    }

    setFilteredItems(result);
  }, [items, searchTerm, statusFilter, sortBy]);

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="items-page py-4">
      <div className="container">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 fw-bold mb-1">
              <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>
              Found Items
            </h1>
            <p className="text-muted">
              Browse all found items reported by students. Looking for something you lost?
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              {/* Search */}
              <div className="col-md-4">
                <label className="form-label small text-muted">Search</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="col-md-3">
                <label className="form-label small text-muted">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="claimed">Claimed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="col-md-3">
                <label className="form-label small text-muted">Sort By</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="col-md-2">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted mb-0">
            Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <span className="badge bg-primary">
              Filters applied
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading items...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          /* Items Grid */
          <div className="row g-4">
            {filteredItems.map(item => (
              <div key={item.id} className="col-sm-6 col-lg-4 col-xl-3">
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-5">
            <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">No items found</h4>
            <p className="text-muted">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No found items have been reported yet'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button className="btn btn-primary mt-2" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsListing;
