/**
 * Footer Component
 * ================
 * Simple footer for the application.
 */

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <i className="bi bi-search-heart text-primary me-2"></i>
              <span className="fw-semibold">SIT Nagpur Lost & Found</span>
            </div>
            <p className="text-muted small mb-0 mt-1">
              Helping the campus community recover lost belongings.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <p className="text-muted small mb-0">
              © {new Date().getFullYear()} Symbiosis Institute of Technology, Nagpur
            </p>
            <p className="text-muted small mb-0">
              Built with <i className="bi bi-heart-fill text-danger"></i> by SIT Students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
