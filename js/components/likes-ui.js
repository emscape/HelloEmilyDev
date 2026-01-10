/**
 * Blog Likes UI Component
 * 
 * Renders:
 * - Like button
 * - Like count
 * - Visual feedback (already liked state)
 */

import { getLikeCount, hasClientLiked, likePost } from '../utils/likes-api.js';

/**
 * Create and return the likes button HTML
 * 
 * @param {string} postSlug - Blog post slug
 * @returns {HTMLElement} - Likes button container
 */
export function createLikesButton(postSlug) {
  const container = document.createElement('div');
  container.id = `likes-button-${postSlug}`;
  container.className = 'likes-button-container';
  container.innerHTML = `
    <button class="likes-button" aria-label="Like this post">
      <span class="likes-icon">♥</span>
      <span class="likes-count">0</span>
    </button>
  `;
  
  // Initialize button
  initializeLikesButton(container, postSlug);
  
  return container;
}

/**
 * Initialize likes button event listeners
 */
async function initializeLikesButton(container, postSlug) {
  const button = container.querySelector('.likes-button');
  const countEl = container.querySelector('.likes-count');
  
  try {
    // Load initial state
    const likeCount = await getLikeCount(postSlug);
    const isLiked = await hasClientLiked(postSlug);
    
    countEl.textContent = likeCount;
    
    if (isLiked) {
      button.classList.add('liked');
    }
    
    // Handle click
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      
      button.disabled = true;
      
      try {
        const result = await likePost(postSlug);
        
        if (result.success) {
          button.classList.add('liked');
          countEl.textContent = result.likeCount;
          button.classList.add('like-pulse');
          setTimeout(() => button.classList.remove('like-pulse'), 600);
        } else {
          console.error('Failed to like post:', result.error);
        }
      } catch (error) {
        console.error('Error liking post:', error);
      } finally {
        button.disabled = false;
      }
    });
  } catch (error) {
    console.error('Error initializing likes button:', error);
  }
}

/**
 * Update like count display
 * 
 * @param {string} postSlug - Blog post slug
 */
export async function updateLikeCount(postSlug) {
  const container = document.querySelector(`#likes-button-${postSlug}`);
  if (container) {
    const countEl = container.querySelector('.likes-count');
    const likeCount = await getLikeCount(postSlug);
    countEl.textContent = likeCount;
  }
}
