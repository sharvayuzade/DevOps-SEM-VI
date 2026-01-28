/**
 * Main App Component
 * ==================
 * Root component that sets up routing and providers.
 * 
 * Structure:
 * - AuthProvider for authentication context
 * - React Router for navigation
 * - Toast notifications
 * - Layout components (Navbar, Footer)
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import UploadItem from './pages/UploadItem';
import ItemsListing from './pages/ItemsListing';
import Profile from './pages/Profile';

// Styles
import './styles/App.css';

/**
 * Home Page - Redirects based on auth status
 */
const HomePage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

/**
 * Main Layout Component
 * Includes Navbar and Footer
 */
const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <div className="app-container">
      {showNavbar && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

/**
 * App Routes Component
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Home - Redirect based on auth */}
      <Route path="/" element={<HomePage />} />
      
      {/* Auth Routes - No Navbar/Footer */}
      <Route 
        path="/login" 
        element={
          <Layout showNavbar={false} showFooter={false}>
            <Login />
          </Layout>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <Layout showNavbar={false} showFooter={false}>
            <Signup />
          </Layout>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/items" 
        element={
          <ProtectedRoute>
            <Layout>
              <ItemsListing />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <UploadItem />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* 404 - Not Found */}
      <Route 
        path="*" 
        element={
          <Layout>
            <div className="container py-5 text-center">
              <h1 className="display-1 text-muted">404</h1>
              <h2>Page Not Found</h2>
              <p className="text-muted">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary mt-3">
                Go Home
              </a>
            </div>
          </Layout>
        } 
      />
    </Routes>
  );
};

/**
 * Main App Component
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
