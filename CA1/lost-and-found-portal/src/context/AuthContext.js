/**
 * Authentication Context
 * ======================
 * Provides authentication state and methods throughout the application.
 * Uses React Context API to avoid prop drilling.
 * 
 * Features:
 * - User authentication state management
 * - Login, signup, and logout functionality
 * - Session persistence
 * - User profile data with role information
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

// Create the context
const AuthContext = createContext({});

/**
 * Custom hook to use auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state to all children
 */
export const AuthProvider = ({ children }) => {
  // State for current user (null if not logged in)
  const [user, setUser] = useState(null);
  // State for user profile data (includes role, name, etc.)
  const [userProfile, setUserProfile] = useState(null);
  // Loading state for initial session check
  const [loading, setLoading] = useState(true);
  // Error state for auth operations
  const [error, setError] = useState(null);

  /**
   * Fetch user profile from our custom users table
   * This gets the additional user data (role, name, etc.)
   */
  const fetchUserProfile = async (userId) => {
    try {
      // First, get the base user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Based on role, fetch additional data
      let roleData = null;
      if (userData.role === 'student') {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error) roleData = data;
      } else if (userData.role === 'staff') {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error) roleData = data;
      }

      // Combine user data with role-specific data
      const profile = {
        ...userData,
        ...(roleData || {})
      };

      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile(null);
      return null;
    }
  };

  /**
   * Initialize auth state on app load
   * Check for existing session and set up auth listener
   */
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user
   * @param {Object} params - Signup parameters
   * @param {string} params.email - User's email
   * @param {string} params.password - User's password
   * @param {string} params.fullName - User's full name
   * @param {string} params.role - 'student' or 'staff'
   * @param {Object} params.roleData - Role-specific data
   */
  const signUp = async ({ email, password, fullName, role, roleData }) => {
    try {
      setError(null);
      setLoading(true);

      // 1. Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Create user profile in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role
        });

      if (userError) throw userError;

      // 3. Create role-specific record
      if (role === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            id: userId,
            student_id: roleData.studentId,
            semester: roleData.semester
          });

        if (studentError) throw studentError;
      } else if (role === 'staff') {
        const { error: staffError } = await supabase
          .from('staff')
          .insert({
            id: userId,
            department: roleData.department,
            employee_id: roleData.employeeId || null
          });

        if (staffError) throw staffError;
      }

      // 4. Fetch and set user profile
      await fetchUserProfile(userId);

      return { success: true, user: authData.user };
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in an existing user
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Profile will be fetched by auth state listener
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Update user profile
   * @param {Object} updates - Fields to update
   */
  const updateProfile = async (updates) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchUserProfile(user.id);
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Context value - all auth state and methods
  const value = {
    // State
    user,                    // Supabase auth user object
    userProfile,             // Custom user profile with role data
    loading,                 // Loading state
    error,                   // Error message if any
    
    // Computed
    isAuthenticated: !!user, // Boolean for auth check
    isStudent: userProfile?.role === 'student',
    isStaff: userProfile?.role === 'staff',
    
    // Methods
    signUp,
    login,
    logout,
    updateProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
