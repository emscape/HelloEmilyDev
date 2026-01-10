/**
 * Blog Comments and Likes System
 * Handles loading, rendering, and managing comments and likes
 * 
 * Uses localStorage for development/testing
 * Can be upgraded to use Supabase when configured
 */

const COMMENTS_CONFIG = {
  MAX_COMMENT_LENGTH: 500,
  STORAGE_KEY: 'blog_comments',
  LIKES_STORAGE_KEY: 'blog_likes',
  MODERATION: {
    ENABLED: true,
    KEYWORDS: [],
  }
};

/**
 * Initialize comments section for a blog post
 */
function initBlogComments(postId) {
  if (!postId) {
    console.error('initBlogComments: postId is required');
    return;
  }

  console.log('Initializing comments for post:', postId);

  const commentForm = document.querySelector('.comment-form');
  const commentsListArea = document.querySelector('.comments-list-area');

  if (!commentForm || !commentsListArea) {
    console.warn('Comments section elements not found');
    return;
  }

  // Load and render existing comments
  renderComments(postId, commentsListArea);

  // Setup form submission
  setupCommentForm(postId, commentForm, commentsListArea);

  // Setup likes
  initializeLikes(postId);
}

/**
 * Setup the comment form submission
 */
function setupCommentForm(postId, form, commentsListArea) {
  const submitBtn = form.querySelector('.btn-primary');
  const nameInput = form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('input[name="email"]');
  const commentInput = form.querySelector('textarea[name="comment"]');
  const messageDiv = form.querySelector('.form-message');
  const charCount = document.getElementById('char-count');

  // Setup character counter
  if (charCount) {
    commentInput.addEventListener('input', () => {
      const remaining = COMMENTS_CONFIG.MAX_COMMENT_LENGTH - commentInput.value.length;
      charCount.textContent = `${commentInput.value.length}/${COMMENTS_CONFIG.MAX_COMMENT_LENGTH}`;
      
      if (remaining < 50) {
        charCount.style.color = remaining < 0 ? '#dc2626' : '#f59e0b';
      } else {
        charCount.style.color = '';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const text = commentInput.value.trim();

    // Validation
    if (!name || !email || !text) {
      showMessage(messageDiv, 'Please fill in all fields', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage(messageDiv, 'Please enter a valid email address', 'error');
      return;
    }

    if (text.length > COMMENTS_CONFIG.MAX_COMMENT_LENGTH) {
      showMessage(messageDiv, `Comment must be under ${COMMENTS_CONFIG.MAX_COMMENT_LENGTH} characters`, 'error');
      return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Create comment object
      const comment = {
        id: generateId(),
        author: sanitizeHtml(name),
        email: email,
        text: sanitizeHtml(text),
        timestamp: new Date().toISOString(),
        postId: postId,
        approved: true,
        replies: [],
        likes: 0
      };

      // Save to storage
      saveComment(postId, comment);

      // Render the new comment
      renderComments(postId, commentsListArea);

      // Clear form
      form.reset();
      if (charCount) charCount.textContent = `0/${COMMENTS_CONFIG.MAX_COMMENT_LENGTH}`;

      showMessage(messageDiv, 'Comment posted successfully!', 'success');

      // Clear success message after 3 seconds
      setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
      }, 3000);

    } catch (error) {
      console.error('Error submitting comment:', error);
      showMessage(messageDiv, 'Error posting comment. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post Comment';
    }
  });
}

/**
 * Render comments to the DOM
 */
function renderComments(postId, commentsListArea) {
  const comments = getComments(postId);
  const listContainer = commentsListArea.querySelector('.comments-list');
  const loadingDiv = commentsListArea.querySelector('.loading');

  if (!listContainer) {
    console.warn('comments-list container not found');
    return;
  }

  if (comments.length === 0) {
    if (loadingDiv) loadingDiv.style.display = 'none';
    listContainer.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    return;
  }

  if (loadingDiv) loadingDiv.style.display = 'none';
  listContainer.innerHTML = '';

  // Sort comments by date (newest first)
  const sortedComments = comments.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  sortedComments.forEach(comment => {
    const commentEl = createCommentElement(comment, postId);
    listContainer.appendChild(commentEl);
  });
}

/**
 * Create a comment DOM element
 */
function createCommentElement(comment, postId) {
  const div = document.createElement('div');
  div.className = `comment comment-root`;
  div.id = `comment-${comment.id}`;

  const date = new Date(comment.timestamp);
  const formattedDate = formatDate(date);

  div.innerHTML = `
    <div class="comment-header">
      <span class="comment-author">${comment.author}</span>
      <span class="comment-date">${formattedDate}</span>
    </div>
    <div class="comment-body">${comment.text}</div>
    <div class="comment-actions" style="margin-top: 0.75rem; display: flex; gap: 1rem;">
      <button class="comment-like-btn" data-comment-id="${comment.id}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: var(--light-accent, #f0f9fa); border: none; cursor: pointer; color: var(--primary-dark, #008080); font-size: 0.9rem; padding: 0.4rem 0.8rem; border-radius: 4px; transition: all 0.2s;">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        <span>(${comment.likes || 0})</span>
      </button>
    </div>
  `;

  // Setup like button
  const likeBtn = div.querySelector('.comment-like-btn');
  likeBtn.addEventListener('click', () => {
    likeComment(postId, comment.id);
    const commentsListArea = document.querySelector('.comments-list-area');
    renderComments(postId, commentsListArea);
  });
  
  // Add hover effect to like button
  likeBtn.addEventListener('mouseover', () => {
    likeBtn.style.background = 'var(--primary-color, #00B5B8)';
    likeBtn.style.color = 'white';
  });
  likeBtn.addEventListener('mouseout', () => {
    likeBtn.style.background = 'var(--light-accent, #f0f9fa)';
    likeBtn.style.color = 'var(--primary-dark, #008080)';
  });

  return div;
}

/**
 * Like a comment
 */
function likeComment(postId, commentId) {
  const comments = getComments(postId);
  const comment = comments.find(c => c.id === commentId);
  
  if (comment) {
    comment.likes = (comment.likes || 0) + 1;
    saveComments(postId, comments);
  }
}

/**
 * Initialize likes functionality for blog post
 * @param {string} postId - Blog post ID
 */
function initializeLikes(postId) {
  const likesBtn = document.querySelector('.likes-button');
  
  if (!likesBtn) return;

  // Check if user has already liked this post
  const hasLiked = hasLikedPost(postId);
  if (hasLiked) {
    likesBtn.classList.add('liked');
  }

  likesBtn.addEventListener('click', () => {
    togglePostLike(postId, likesBtn);
  });
}

/**
 * Toggle post like status
 * @param {string} postId - Blog post ID
 * @param {HTMLElement} button - Like button element
 */
function togglePostLike(postId, button) {
  if (hasLikedPost(postId)) {
    unlikePost(postId);
    button.classList.remove('liked');
  } else {
    likePost(postId);
    button.classList.add('liked');
    button.classList.add('like-pulse');
    setTimeout(() => button.classList.remove('like-pulse'), 600);
  }

  // Update count
  const count = getPostLikeCount(postId);
  const countEl = button.querySelector('.likes-count');
  if (countEl) {
    countEl.textContent = count;
  }
}

/**
 * Like a post
 * @param {string} postId - Blog post ID
 */
function likePost(postId) {
  const likedPosts = JSON.parse(localStorage.getItem(COMMENTS_CONFIG.LIKES_STORAGE_KEY) || '{}');
  const userLikes = likedPosts[postId] || [];
  userLikes.push(new Date().toISOString());
  likedPosts[postId] = userLikes;
  localStorage.setItem(COMMENTS_CONFIG.LIKES_STORAGE_KEY, JSON.stringify(likedPosts));
}

/**
 * Unlike a post
 * @param {string} postId - Blog post ID
 */
function unlikePost(postId) {
  const likedPosts = JSON.parse(localStorage.getItem(COMMENTS_CONFIG.LIKES_STORAGE_KEY) || '{}');
  if (likedPosts[postId]) {
    likedPosts[postId].pop();
  }
  localStorage.setItem(COMMENTS_CONFIG.LIKES_STORAGE_KEY, JSON.stringify(likedPosts));
}

/**
 * Check if user has liked a post
 * @param {string} postId - Blog post ID
 * @returns {boolean}
 */
function hasLikedPost(postId) {
  const likedPosts = JSON.parse(localStorage.getItem(COMMENTS_CONFIG.LIKES_STORAGE_KEY) || '{}');
  return (likedPosts[postId] || []).length > 0;
}

/**
 * Get like count for a post
 * @param {string} postId - Blog post ID
 * @returns {number}
 */
function getPostLikeCount(postId) {
  const likedPosts = JSON.parse(localStorage.getItem(COMMENTS_CONFIG.LIKES_STORAGE_KEY) || '{}');
  return (likedPosts[postId] || []).length;
}

/**
 * Save a comment to storage
 * @param {string} postId - Blog post ID
 * @param {Object} comment - Comment object
 */
function saveComment(postId, comment) {
  const comments = getComments(postId);
  comments.push(comment);
  saveComments(postId, comments);
}

/**
 * Save all comments for a post
 * @param {string} postId - Blog post ID
 * @param {Array} comments - Comments array
 */
function saveComments(postId, comments) {
  const allComments = JSON.parse(localStorage.getItem(COMMENTS_CONFIG.STORAGE_KEY) || '{}');
  allComments[postId] = comments;
  localStorage.setItem(COMMENTS_CONFIG.STORAGE_KEY, JSON.stringify(allComments));
}

/**
 * Get all comments for a post
 * @param {string} postId - Blog post ID
 * @returns {Array}
 */
function getComments(postId) {
  const allComments = JSON.parse(localStorage.getItem(COMMENTS_CONFIG.STORAGE_KEY) || '{}');
  return allComments[postId] || [];
}

/**
 * Utility Functions
 */

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function sanitizeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if text contains spam keywords
 * @param {string} text
 * @returns {boolean}
 */
function isSpam(text) {
  const lowerText = text.toLowerCase();
  return COMMENTS_CONFIG.MODERATION.KEYWORDS.some(keyword => 
    lowerText.includes(keyword)
  );
}

/**
 * Format date
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Show message in form
 * @param {HTMLElement} messageDiv - Message container
 * @param {string} message - Message text
 * @param {string} type - Message type (success/error)
 */
function showMessage(messageDiv, message, type) {
  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initBlogComments,
    getComments,
    saveComment,
    formatDate,
    sanitizeHtml
  };
}
