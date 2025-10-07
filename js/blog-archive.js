/**
 * Blog archive script for HelloEmily.dev - REFACTORED
 * Functional programming approach with pure functions
 * Loads and displays all blog posts from JSON
 */

import { escapeHtml, sanitizeUrl } from './utils/security.js';
import { ErrorHandler, ErrorContext } from './utils/error-handler.js';
import { formatDate } from './utils/date-formatter.js';
import { sortByDate } from './utils/date-formatter.js';

// ============================================================================
// PURE FUNCTIONS - Data Transformation
// ============================================================================

/**
 * Filters out template/incomplete posts
 * Pure function
 * 
 * @param {Array<Object>} posts - Array of post objects
 * @returns {Array<Object>} - Filtered posts
 */
const filterValidPosts = (posts) => {
  return posts.filter(post => 
    post.date !== 'YYYY-MM-DD' && post.author !== 'Your Name'
  );
};

/**
 * Sorts posts by date (newest first)
 * Pure function
 * 
 * @param {Array<Object>} posts - Array of post objects
 * @returns {Array<Object>} - Sorted posts
 */
const sortPostsByDate = (posts) => {
  return sortByDate(posts, 'date', false);
};

/**
 * Prepares posts for display (sort + filter)
 * Pure function
 * 
 * @param {Array<Object>} posts - Raw posts array
 * @returns {Array<Object>} - Prepared posts
 */
const preparePosts = (posts) => {
  const sorted = sortPostsByDate(posts);
  return filterValidPosts(sorted);
};

/**
 * Generates tags HTML for a single post
 * Pure function
 * 
 * @param {Array<string>} tags - Array of tag strings
 * @returns {string} - HTML string for tags
 */
const generatePostTagsHTML = (tags) => {
  if (!tags || !Array.isArray(tags)) return '';
  
  return tags
    .map(tag => {
      const tagSlug = escapeHtml(tag.toLowerCase().replace(/\s+/g, '-'));
      const tagText = escapeHtml(tag);
      return `<span class="blog-tag" data-tag="${tagSlug}">${tagText}</span>`;
    })
    .join('');
};

/**
 * Generates WebP source path from image path
 * Pure function
 *
 * @param {string} imagePath - Original image path
 * @returns {string} - WebP path
 */
const deriveWebPPath = (imagePath) => {
  return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Generates featured image HTML with WebP support
 * Pure function
 *
 * @param {Object} post - Post object
 * @returns {string} - HTML string for featured image
 */
const generateFeaturedImageHTML = (post) => {
  if (!post.featuredImage) return '';

  const webpPath = deriveWebPPath(post.featuredImage);

  return `<picture>
    <source srcset="${sanitizeUrl(webpPath)}" type="image/webp">
    <img src="${sanitizeUrl(post.featuredImage)}"
      alt="${escapeHtml(post.title)} Featured Image"
      class="blog-card-image"
      loading="lazy">
  </picture>`;
};

/**
 * Generates featured tag HTML
 * Pure function
 * 
 * @param {boolean} isFeatured - Whether post is featured
 * @returns {string} - HTML string for featured tag
 */
const generateFeaturedTagHTML = (isFeatured) => {
  return isFeatured ? '<span class="featured-tag">Featured</span>' : '';
};

/**
 * Generates blog card HTML
 * Pure function
 * 
 * @param {Object} post - Post object
 * @returns {string} - HTML string for blog card
 */
const generateBlogCardHTML = (post) => {
  const formattedDate = formatDate(post.date);
  const tagsHTML = generatePostTagsHTML(post.tags);
  const featuredImageHTML = generateFeaturedImageHTML(post);
  const featuredTagHTML = generateFeaturedTagHTML(post.featured);
  
  return `
    ${featuredImageHTML}
    <div class="blog-card-content">
      <div class="blog-meta">
        <span class="blog-date">${escapeHtml(formattedDate)}</span>
        ${featuredTagHTML}
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.shortDescription || '')}</p>
      <div class="blog-tags">
        ${tagsHTML}
      </div>
      <a href="${sanitizeUrl(post.slug)}" class="btn blog-read-more">Read More</a>
    </div>
  `;
};

/**
 * Extracts all unique tags from posts
 * Pure function
 * 
 * @param {Array<Object>} posts - Array of post objects
 * @returns {Array<string>} - Array of unique tags
 */
const extractUniqueTags = (posts) => {
  const tagSet = new Set();
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet);
};

/**
 * Calculates tag frequencies
 * Pure function
 * 
 * @param {Array<Object>} posts - Array of post objects
 * @returns {Object} - Object with tag counts
 */
const calculateTagFrequencies = (posts) => {
  const tagCounts = {};
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  return tagCounts;
};

/**
 * Sorts tags by frequency (descending), then alphabetically
 * Pure function
 * 
 * @param {Object} tagCounts - Object with tag counts
 * @returns {Array<string>} - Sorted array of tags
 */
const sortTagsByFrequency = (tagCounts) => {
  return Object.entries(tagCounts)
    .sort(([tagA, countA], [tagB, countB]) => {
      if (countB !== countA) {
        return countB - countA;
      }
      return tagA.localeCompare(tagB);
    })
    .map(([tag]) => tag);
};

/**
 * Generates tag filter buttons HTML
 * Pure function
 * 
 * @param {Array<string>} sortedTags - Sorted array of tags
 * @returns {string} - HTML string for tag filters
 */
const generateTagFiltersHTML = (sortedTags) => {
  let html = '<button class="tag-filter active" data-tag="all">All</button>';
  html += '<div class="all-tags-wrapper">';
  
  sortedTags.forEach(tag => {
    const tagSlug = escapeHtml(tag.toLowerCase().replace(/\s+/g, '-'));
    const tagText = escapeHtml(tag);
    html += `<button class="tag-filter" data-tag="${tagSlug}">${tagText}</button>`;
  });
  
  html += '</div>';
  html += '<button class="see-more-tags" data-state="more" style="display: none;">See more</button>';
  
  return html;
};

/**
 * Checks if a blog card has a specific tag
 * Pure function
 * 
 * @param {HTMLElement} card - Blog card element
 * @param {string} tag - Tag to check for
 * @returns {boolean} - Whether card has the tag
 */
const cardHasTag = (card, tag) => {
  if (tag === 'all') return true;
  
  const cardTags = card.querySelectorAll('.blog-tag');
  return Array.from(cardTags).some(cardTag => 
    cardTag.getAttribute('data-tag') === tag
  );
};

/**
 * Debounce function
 * Higher-order function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ============================================================================
// IMPURE FUNCTIONS - Side Effects (DOM Manipulation)
// ============================================================================

/**
 * Creates a blog card DOM element
 * Impure function - DOM creation
 * 
 * @param {Object} post - Post object
 * @returns {HTMLElement} - Blog card element
 */
const createBlogCardElement = (post) => {
  const postCard = document.createElement('div');
  postCard.className = 'blog-card';
  if (post.featured) {
    postCard.classList.add('featured');
  }
  postCard.innerHTML = generateBlogCardHTML(post);
  return postCard;
};

/**
 * Renders blog posts to container
 * Impure function - DOM manipulation
 * 
 * @param {HTMLElement} container - Container element
 * @param {Array<Object>} posts - Array of post objects
 */
const renderBlogPosts = (container, posts) => {
  container.innerHTML = '';
  const preparedPosts = preparePosts(posts);
  
  preparedPosts.forEach(post => {
    const postCard = createBlogCardElement(post);
    container.appendChild(postCard);
  });
  
  return preparedPosts;
};

/**
 * Renders tag filters to container
 * Impure function - DOM manipulation
 * 
 * @param {HTMLElement} container - Tag filter container
 * @param {Array<Object>} posts - Array of post objects
 */
const renderTagFilters = (container, posts) => {
  const tagCounts = calculateTagFrequencies(posts);
  const sortedTags = sortTagsByFrequency(tagCounts);
  const filtersHTML = generateTagFiltersHTML(sortedTags);
  
  container.innerHTML = filtersHTML;
  
  // Adjust visibility after render
  setTimeout(adjustVisibleTags, 0);
};

/**
 * Adjusts visibility of tags (shows only two rows initially)
 * Impure function - DOM manipulation
 */
const adjustVisibleTags = () => {
  const tagFilterContainer = document.querySelector('.blog-filter-tags');
  if (!tagFilterContainer) return;
  
  const tagsWrapper = tagFilterContainer.querySelector('.all-tags-wrapper');
  const seeMoreButton = tagFilterContainer.querySelector('.see-more-tags');
  const allTagButtons = tagsWrapper ? Array.from(tagsWrapper.querySelectorAll('.tag-filter')) : [];

  if (!tagsWrapper || !seeMoreButton || allTagButtons.length === 0) {
    if (seeMoreButton) seeMoreButton.style.display = 'none';
    return;
  }

  // Reset styles to calculate natural layout
  tagsWrapper.style.maxHeight = '';
  tagsWrapper.style.overflow = '';
  seeMoreButton.style.display = 'none';

  const firstTag = allTagButtons[0];
  const firstTagOffsetTop = firstTag.offsetTop;
  let thirdRowOffsetTop = -1;
  let secondRowFound = false;

  // Find the offsetTop of the start of the third row
  for (const tag of allTagButtons) {
    if (!secondRowFound && tag.offsetTop > firstTagOffsetTop) {
      secondRowFound = true;
    }
    if (secondRowFound && tag.offsetTop > tag.previousElementSibling?.offsetTop && tag.offsetTop !== firstTagOffsetTop) {
      const previousTag = tag.previousElementSibling;
      if (previousTag && tag.offsetTop > previousTag.offsetTop) {
        thirdRowOffsetTop = tag.offsetTop;
        break;
      }
    }
  }
  
  const containerScrollHeight = tagsWrapper.scrollHeight;

  if (thirdRowOffsetTop !== -1 && containerScrollHeight > (thirdRowOffsetTop - firstTagOffsetTop)) {
    const twoRowsHeight = thirdRowOffsetTop - firstTagOffsetTop;
    tagsWrapper.style.maxHeight = `${twoRowsHeight - 1}px`;
    tagsWrapper.style.overflow = 'hidden';
    seeMoreButton.style.display = 'inline-block';
    seeMoreButton.textContent = 'See more';
    seeMoreButton.setAttribute('data-state', 'more');
  } else {
    tagsWrapper.style.maxHeight = '';
    tagsWrapper.style.overflow = '';
    seeMoreButton.style.display = 'none';
  }
};

/**
 * Filters blog posts by tag
 * Impure function - DOM manipulation
 * 
 * @param {string} tag - Tag to filter by
 */
const filterBlogPostsByTag = (tag) => {
  const blogCards = document.querySelectorAll('.blog-card');
  
  blogCards.forEach(card => {
    const shouldShow = cardHasTag(card, tag);
    card.style.display = shouldShow ? 'block' : 'none';
  });
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles tag filter click
 * Impure function - Event handler
 * 
 * @param {Event} e - Click event
 * @param {HTMLElement} container - Tag filter container
 */
const handleTagFilterClick = (e, container) => {
  if (!e.target.classList.contains('tag-filter')) return;
  
  const selectedTag = e.target.getAttribute('data-tag');
  
  // Update active state
  container.querySelectorAll('.tag-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  
  // Filter posts
  filterBlogPostsByTag(selectedTag);
};

/**
 * Handles "See more/less" button click
 * Impure function - Event handler
 * 
 * @param {Event} e - Click event
 * @param {HTMLElement} container - Tag filter container
 */
const handleSeeMoreClick = (e, container) => {
  if (!e.target.classList.contains('see-more-tags')) return;
  
  const button = e.target;
  const tagsWrapper = container.querySelector('.all-tags-wrapper');
  const currentState = button.getAttribute('data-state');

  if (currentState === 'more') {
    // Expand
    tagsWrapper.style.maxHeight = '';
    tagsWrapper.style.overflow = '';
    button.textContent = 'See less';
    button.setAttribute('data-state', 'less');
  } else {
    // Collapse
    adjustVisibleTags();
    
    // Switch to 'All' if active tag is now hidden
    const activeTag = tagsWrapper.querySelector('.tag-filter.active');
    if (activeTag && tagsWrapper.scrollHeight > tagsWrapper.clientHeight) {
      const wrapperRect = tagsWrapper.getBoundingClientRect();
      const activeTagRect = activeTag.getBoundingClientRect();
      if (activeTagRect.bottom > wrapperRect.bottom) {
        const allButton = container.querySelector('.tag-filter[data-tag="all"]');
        if (allButton) {
          container.querySelectorAll('.tag-filter').forEach(btn => btn.classList.remove('active'));
          allButton.classList.add('active');
          filterBlogPostsByTag('all');
        }
      }
    }
  }
};

/**
 * Sets up event listeners for blog filtering
 * Impure function - Event listener setup
 */
const setupBlogFilters = () => {
  const tagFilterContainer = document.querySelector('.blog-filter-tags');
  if (!tagFilterContainer) return;

  // Click event listener
  tagFilterContainer.addEventListener('click', (e) => {
    handleTagFilterClick(e, tagFilterContainer);
    handleSeeMoreClick(e, tagFilterContainer);
  });

  // Resize event listener with debounce
  let isInitialLoad = true;
  const debouncedAdjustTags = debounce(adjustVisibleTags, 250);

  window.addEventListener('resize', () => {
    if (!isInitialLoad) {
      debouncedAdjustTags();
    }
    isInitialLoad = false;
  });

  setTimeout(() => { isInitialLoad = false; }, 100);
};

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  const blogContainer = document.querySelector('.blog-grid');
  const tagFilterContainer = document.querySelector('.blog-filter-tags');
  const handleError = ErrorHandler.createBoundary(blogContainer, ErrorContext.FETCH);

  // Adjust path based on current page location
  const isInPagesDirectory = window.location.pathname.includes('/pages/');
  const dataPath = isInPagesDirectory ? '../data/blog-index.json' : './data/blog-index.json';

  fetch(dataPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.posts) {
        throw new Error('Invalid blog data format');
      }
      
      // Render posts and get prepared posts for tag filtering
      const preparedPosts = renderBlogPosts(blogContainer, data.posts);
      
      // Render tag filters
      if (tagFilterContainer) {
        renderTagFilters(tagFilterContainer, preparedPosts);
      }
      
      // Set up event listeners
      setupBlogFilters();
    })
    .catch(error => {
      ErrorHandler.log(error, ErrorContext.FETCH);
      handleError(error, 'Unable to load blog posts. Please try again later.');
    });
});

