/**
 * Supabase Client Initialization
 * 
 * Initializes the Supabase client with environment variables.
 * Uses the anon key for client-side operations (RLS handles access control).
 */

// Dynamically import based on environment (Vite specific)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase credentials. Check your .env.local file and ensure:',
    '  - VITE_SUPABASE_URL is set',
    '  - VITE_SUPABASE_ANON_KEY is set'
  );
}

// Import Supabase client
// Note: Add to package.json: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generate or retrieve a unique client ID for the current browser
 * Used for like deduplication and rate limiting
 * 
 * @returns {string} - UUID stored in localStorage
 */
export function getClientId() {
  const STORAGE_KEY = 'blog_client_id';
  let clientId = localStorage.getItem(STORAGE_KEY);
  
  if (!clientId) {
    // Generate a simple UUID v4
    clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem(STORAGE_KEY, clientId);
  }
  
  return clientId;
}

/**
 * Safe HTML escaping for comment text
 * @param {string} text - Raw text to escape
 * @returns {string} - Escaped HTML-safe text
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format timestamp to human-readable format
 * @param {string} timestamp - ISO timestamp from database
 * @returns {string} - Formatted date (e.g., "2 hours ago")
 */
export function formatTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
  
  // For older dates, show actual date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
