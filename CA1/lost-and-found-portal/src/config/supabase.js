/**
 * Supabase Client Configuration
 * ================================
 * This file initializes the Supabase client with project credentials.
 * Supabase provides Authentication, Database, and Storage services.
 * 
 * Setup Instructions:
 * 1. Create a project at https://supabase.com
 * 2. Copy your project URL and anon key from Settings > API
 * 3. Create a .env file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Missing Supabase environment variables!\n' +
    'Please create a .env file with:\n' +
    'REACT_APP_SUPABASE_URL=your_project_url\n' +
    'REACT_APP_SUPABASE_ANON_KEY=your_anon_key'
  );
}

// Create and export the Supabase client
// This client is used throughout the application for:
// - Authentication (signup, login, logout)
// - Database operations (CRUD on tables)
// - Storage operations (upload/download files)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // Persist session in localStorage
      persistSession: true,
      // Auto-refresh tokens before they expire
      autoRefreshToken: true,
      // Detect session from URL (for OAuth callbacks)
      detectSessionInUrl: true
    }
  }
);

// Export a helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
