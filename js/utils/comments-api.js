/**
 * Blog Comments API
 * 
 * Handles all comments operations:
 * - Fetching approved comments
 * - Submitting new comments
 * - Basic spam/rate limiting checks
 */

import { supabase, getClientId } from './supabase-client.js';

/**
 * Rate limiting: max 3 comments per post per client per hour
 * Adjust these constants as needed
 */
const RATE_LIMIT = {
  maxCommentsPerHour: 3,
  maxCommentsPerDay: 10
};

/**
 * Fetch all approved comments for a post
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<Array>} - Array of comment objects
 */
export async function getComments(postSlug) {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_slug', postSlug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * Fetch only root comments (no parent_id)
 * Used for flattened comment display
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<Array>} - Array of root comment objects
 */
export async function getRootComments(postSlug) {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_slug', postSlug)
      .eq('status', 'approved')
      .is('parent_id', null)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching root comments:', error);
    return [];
  }
}

/**
 * Fetch replies to a specific comment
 * 
 * @param {string} parentId - The parent comment ID
 * @returns {Promise<Array>} - Array of reply objects
 */
export async function getReplies(parentId) {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('parent_id', parentId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
}

/**
 * Check rate limits for new comments
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
export async function checkRateLimit(postSlug) {
  const clientId = getClientId();
  
  try {
    // Get comment count in last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    const { data: recentComments, error } = await supabase
      .from('comment_spam_checks')
      .select('*')
      .eq('client_id', clientId)
      .eq('post_slug', postSlug)
      .gte('created_at', oneHourAgo);
    
    if (error) throw error;
    
    if ((recentComments || []).length >= RATE_LIMIT.maxCommentsPerHour) {
      return {
        allowed: false,
        reason: `You've posted ${RATE_LIMIT.maxCommentsPerHour} comments in the last hour. Please wait before posting again.`
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // Allow on error (fail open)
    return { allowed: true };
  }
}

/**
 * Submit a new comment
 * 
 * @param {Object} commentData - Comment data
 * @param {string} commentData.postSlug - Blog post slug
 * @param {string} commentData.authorName - Author's name
 * @param {string} commentData.authorEmail - Author's email (optional)
 * @param {string} commentData.body - Comment body text
 * @param {string|null} commentData.parentId - Parent comment ID (optional, for replies)
 * @returns {Promise<{success: boolean, error?: string, id?: string}>}
 */
export async function submitComment(commentData) {
  // Validation
  if (!commentData.authorName || commentData.authorName.trim().length < 2) {
    return {
      success: false,
      error: 'Please enter a valid name (at least 2 characters).'
    };
  }
  
  if (!commentData.body || commentData.body.trim().length < 3) {
    return {
      success: false,
      error: 'Please enter a comment (at least 3 characters).'
    };
  }
  
  if (commentData.body.length > 5000) {
    return {
      success: false,
      error: 'Comment is too long (max 5000 characters).'
    };
  }
  
  // Email validation (optional field, but if provided, validate)
  if (commentData.authorEmail && commentData.authorEmail.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentData.authorEmail.trim())) {
      return {
        success: false,
        error: 'Please enter a valid email address.'
      };
    }
  }
  
  // Check rate limit
  const rateLimit = await checkRateLimit(commentData.postSlug);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: rateLimit.reason
    };
  }
  
  try {
    const clientId = getClientId();
    
    // Insert comment
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        post_slug: commentData.postSlug,
        parent_id: commentData.parentId || null,
        author_name: commentData.authorName.trim(),
        author_email: commentData.authorEmail?.trim() || null,
        body: commentData.body.trim(),
        status: 'pending'  // Always start as pending
      })
      .select();
    
    if (error) throw error;
    
    // Record spam check for rate limiting
    await supabase
      .from('comment_spam_checks')
      .insert({
        client_id: clientId,
        post_slug: commentData.postSlug
      });
    
    return {
      success: true,
      id: data[0]?.id
    };
  } catch (error) {
    console.error('Error submitting comment:', error);
    return {
      success: false,
      error: 'Failed to submit comment. Please try again later.'
    };
  }
}

/**
 * Get comment count for a post (approved comments only)
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<number>} - Count of approved comments
 */
export async function getCommentCount(postSlug) {
  try {
    const { count, error } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlug)
      .eq('status', 'approved');
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
}
