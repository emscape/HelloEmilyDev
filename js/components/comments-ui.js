/**
 * Blog Comments UI Component
 * 
 * Renders:
 * - Comment submission form
 * - List of approved comments
 * - Simple reply thread (one level)
 * - Loading/error states
 */

import { 
  getComments, 
  getRootComments, 
  getReplies, 
  submitComment, 
  getCommentCount 
} from '../utils/comments-api.js';
import { escapeHtml, formatTimeAgo } from '../utils/supabase-client.js';

/**
 * Create and return the comments section HTML
 * 
 * @param {string} postSlug - Blog post slug
 * @returns {HTMLElement} - Comments container element
 */
export function createCommentsSection(postSlug) {
  const container = document.createElement('section');
  container.id = 'blog-comments-section';
  container.className = 'blog-comments-section';
  container.innerHTML = `
    <div class="blog-comments-container">
      <h3>Comments</h3>
      
      <!-- Comment Form -->
      <div id="comment-form-area" class="comment-form-area">
        <form id="submit-comment-form" class="comment-form">
          <div class="form-group">
            <label for="author-name">Name *</label>
            <input 
              type="text" 
              id="author-name" 
              name="author-name" 
              placeholder="Your name" 
              required 
              minlength="2"
              maxlength="100"
            >
          </div>
          
          <div class="form-group">
            <label for="author-email">Email (optional)</label>
            <input 
              type="email" 
              id="author-email" 
              name="author-email" 
              placeholder="your@email.com"
              maxlength="100"
            >
            <small>Not displayed publicly. Used only for notifications.</small>
          </div>
          
          <div class="form-group">
            <label for="comment-body">Comment *</label>
            <textarea 
              id="comment-body" 
              name="comment-body" 
              placeholder="Share your thoughts..." 
              required 
              minlength="3"
              maxlength="5000"
              rows="4"
            ></textarea>
            <small id="char-count">0 / 5000</small>
          </div>
          
          <!-- Honeypot field (hidden) -->
          <input 
            type="text" 
            id="website-url" 
            name="website-url" 
            style="display: none;" 
            autocomplete="off" 
            tabindex="-1"
          >
          
          <button type="submit" class="btn btn-primary">Post Comment</button>
          <div id="form-message" class="form-message"></div>
        </form>
      </div>
      
      <!-- Comments List -->
      <div id="comments-list-area" class="comments-list-area">
        <div id="loading-comments" class="loading">Loading comments...</div>
      </div>
    </div>
  `;
  
  // Initialize form handling
  initializeCommentForm(container, postSlug);
  
  // Load and display comments
  loadAndDisplayComments(container, postSlug);
  
  return container;
}

/**
 * Initialize comment form event listeners
 */
function initializeCommentForm(container, postSlug) {
  const form = container.querySelector('#submit-comment-form');
  const bodyField = container.querySelector('#comment-body');
  const charCount = container.querySelector('#char-count');
  const formMessage = container.querySelector('#form-message');
  
  // Character counter
  bodyField.addEventListener('input', (e) => {
    charCount.textContent = `${e.target.value.length} / 5000`;
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check honeypot
    const honeypot = container.querySelector('#website-url').value;
    if (honeypot.length > 0) {
      console.warn('Honeypot triggered');
      return;
    }
    
    const authorName = container.querySelector('#author-name').value;
    const authorEmail = container.querySelector('#author-email').value;
    const body = container.querySelector('#comment-body').value;
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';
    
    // Clear messages
    formMessage.textContent = '';
    formMessage.className = 'form-message';
    
    try {
      const result = await submitComment({
        postSlug,
        authorName,
        authorEmail,
        body,
        parentId: null
      });
      
      if (result.success) {
        formMessage.className = 'form-message success';
        formMessage.textContent = '✓ Comment submitted! It will appear after moderation.';
        form.reset();
        charCount.textContent = '0 / 5000';
      } else {
        formMessage.className = 'form-message error';
        formMessage.textContent = `✗ ${result.error}`;
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      formMessage.className = 'form-message error';
      formMessage.textContent = '✗ An unexpected error occurred. Please try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/**
 * Load comments from API and display them
 */
async function loadAndDisplayComments(container, postSlug) {
  const listArea = container.querySelector('#comments-list-area');
  const loadingEl = container.querySelector('#loading-comments');
  
  try {
    // Get all approved comments
    const comments = await getComments(postSlug);
    
    loadingEl.remove();
    
    if (comments.length === 0) {
      listArea.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
      return;
    }
    
    // Build comments HTML
    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';
    
    // Separate root comments and replies
    const rootComments = comments.filter(c => !c.parent_id);
    const replies = new Map(); // parent_id -> array of replies
    
    comments.forEach(c => {
      if (c.parent_id) {
        if (!replies.has(c.parent_id)) {
          replies.set(c.parent_id, []);
        }
        replies.get(c.parent_id).push(c);
      }
    });
    
    // Render each root comment + its replies
    rootComments.forEach(comment => {
      const commentEl = createCommentElement(comment);
      commentsList.appendChild(commentEl);
      
      // Add replies if any
      const commentReplies = replies.get(comment.id) || [];
      if (commentReplies.length > 0) {
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'comment-replies';
        
        commentReplies.forEach(reply => {
          const replyEl = createCommentElement(reply, true);
          repliesContainer.appendChild(replyEl);
        });
        
        commentsList.appendChild(repliesContainer);
      }
    });
    
    listArea.innerHTML = '';
    listArea.appendChild(commentsList);
  } catch (error) {
    console.error('Error loading comments:', error);
    loadingEl.textContent = 'Failed to load comments. Please refresh the page.';
    loadingEl.classList.add('error');
  }
}

/**
 * Create a single comment element
 * 
 * @param {Object} comment - Comment object from API
 * @param {boolean} isReply - Whether this is a reply (indented)
 * @returns {HTMLElement} - Comment element
 */
function createCommentElement(comment, isReply = false) {
  const div = document.createElement('div');
  div.className = `comment ${isReply ? 'comment-reply' : 'comment-root'}`;
  div.dataset.commentId = comment.id;
  
  const timeAgo = formatTimeAgo(comment.created_at);
  
  div.innerHTML = `
    <div class="comment-header">
      <strong class="comment-author">${escapeHtml(comment.author_name)}</strong>
      <span class="comment-date">${timeAgo}</span>
    </div>
    <div class="comment-body">
      ${escapeHtml(comment.body).split('\n').join('<br>')}
    </div>
  `;
  
  return div;
}

/**
 * Refresh comments (for when new ones are approved, etc.)
 * 
 * @param {string} postSlug - Blog post slug
 */
export async function refreshComments(postSlug) {
  const container = document.querySelector('#blog-comments-section');
  if (container) {
    const listArea = container.querySelector('#comments-list-area');
    listArea.innerHTML = '<div class="loading">Refreshing comments...</div>';
    await loadAndDisplayComments(container, postSlug);
  }
}

/**
 * Update comment count badge (if present)
 * 
 * @param {string} postSlug - Blog post slug
 */
export async function updateCommentCount(postSlug) {
  const countEl = document.querySelector('.comment-count-badge');
  if (countEl) {
    const count = await getCommentCount(postSlug);
    countEl.textContent = count;
  }
}
