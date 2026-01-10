/**
 * Blog Likes API
 * 
 * Handles all likes operations:
 * - Getting like count for a post
 * - Checking if current client has liked a post
 * - Submitting a like
 */

import { supabase, getClientId } from './supabase-client.js';

/**
 * Get like count for a post
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<number>} - Number of likes
 */
export async function getLikeCount(postSlug) {
  try {
    const { count, error } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlug);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
}

/**
 * Check if current client has liked the post
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<boolean>} - Whether the post is liked
 */
export async function hasClientLiked(postSlug) {
  const clientId = getClientId();
  
  try {
    const { data, error } = await supabase
      .from('blog_likes')
      .select('*')
      .eq('post_slug', postSlug)
      .eq('client_id', clientId)
      .single();
    
    if (error) {
      // 'PGRST116' is the error code for "no rows found"
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if post is liked:', error);
    return false;
  }
}

/**
 * Like a post
 * If already liked, this will be silently ignored (UNIQUE constraint)
 * 
 * @param {string} postSlug - The blog post slug
 * @returns {Promise<{success: boolean, error?: string, likeCount?: number}>}
 */
export async function likePost(postSlug) {
  const clientId = getClientId();
  
  try {
    // Try to insert like (will fail silently if already exists due to UNIQUE constraint)
    const { error } = await supabase
      .from('blog_likes')
      .insert({
        post_slug: postSlug,
        client_id: clientId
      });
    
    // Ignore UNIQUE constraint violations (already liked)
    if (error && error.code !== '23505') {
      throw error;
    }
    
    // Get updated like count
    const likeCount = await getLikeCount(postSlug);
    
    return {
      success: true,
      likeCount
    };
  } catch (error) {
    console.error('Error liking post:', error);
    return {
      success: false,
      error: 'Failed to like post. Please try again.'
    };
  }
}

/**
 * Get like stats for multiple posts (for lists/archives)
 * 
 * @param {string[]} postSlugs - Array of post slugs
 * @returns {Promise<Map<string, number>>} - Map of slug to like count
 */
export async function getLikeCountsForPosts(postSlugs) {
  try {
    const { data, error } = await supabase
      .from('blog_likes')
      .select('post_slug')
      .in('post_slug', postSlugs);
    
    if (error) throw error;
    
    // Count likes per post
    const counts = new Map();
    postSlugs.forEach(slug => counts.set(slug, 0));
    
    (data || []).forEach(like => {
      counts.set(like.post_slug, (counts.get(like.post_slug) || 0) + 1);
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting like counts:', error);
    const counts = new Map();
    postSlugs.forEach(slug => counts.set(slug, 0));
    return counts;
  }
}
