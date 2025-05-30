/**
 * Blog archive script for HelloEmily.dev
 * Loads and displays all blog posts from JSON
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load blog index data from JSON file
  fetch('./blog-index.json') // Changed path to blog-index.json
    .then(response => response.json())
    .then(data => {
      displayBlogPosts(data.posts);
    })
    .catch(error => {
      console.error('Error loading blog data:', error);
      displayFallbackBlogPosts();
    });
    
  // Set up event listeners for blog post filtering
  setupBlogFilters();
});

/**
 * Displays all blog posts in the blog grid
 * @param {Array} posts - Array of blog post objects
 */
function displayBlogPosts(posts) {
  const blogContainer = document.querySelector('.blog-grid');
  
  if (blogContainer) {
    // Clear any existing content
    blogContainer.innerHTML = '';
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // Filter out template posts or incomplete posts
    const validPosts = sortedPosts.filter(post => {
      return post.date !== 'YYYY-MM-DD' && post.author !== 'Your Name';
    });
    
    // Create and append blog post cards
    validPosts.forEach(post => {
      const postCard = document.createElement('div');
      postCard.className = 'blog-card';
      if (post.featured) {
        postCard.classList.add('featured');
      }
      
      // Format date
      const postDate = new Date(post.date);
      const formattedDate = postDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Create tags HTML
      const tagsHTML = post.tags
        .map(tag => `<span class="blog-tag" data-tag="${tag.toLowerCase().replace(/\s+/g, '-')}">${tag}</span>`)
        .join('');
      
      // Build card HTML (added featuredImage back)
      postCard.innerHTML = `
        ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title} Featured Image" class="blog-card-image">` : ''}
        <div class="blog-card-content">
          <div class="blog-meta">
            <span class="blog-date">${formattedDate}</span>
             ${post.featured ? '<span class="featured-tag">Featured</span>' : ''}
          </div>
          <h3>${post.title}</h3>
          <p>${post.shortDescription || ''}</p> <!-- Added short description -->
          <div class="blog-tags">
            ${tagsHTML}
          </div>
          <a href="${post.slug}" class="btn blog-read-more">Read More</a>
        </div>
      `; // Use slug (which is now the full path) for link
      
      blogContainer.appendChild(postCard);
    });
    
    // Extract all unique tags for filtering
    populateTagFilters(validPosts);
  }
}

/**
 * Populates the tag filter dropdown with unique tags from all posts
 * @param {Array} posts - Array of blog post objects
 */
function populateTagFilters(posts) {
  const tagFilterContainer = document.querySelector('.blog-filter-tags');
  if (!tagFilterContainer) return;

  // Calculate tag frequencies
  const tagCounts = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by frequency (descending), then alphabetically for ties
  const sortedTags = Object.entries(tagCounts)
    .sort(([, countA, tagA], [, countB, tagB]) => {
      if (countB !== countA) {
        return countB - countA;
      }
      const tagAStr = String(tagA);
      const tagBStr = String(tagB);
      return tagAStr.localeCompare(tagBStr);
    })
    .map(([tag]) => tag);

  // Start with the 'All' button
  let tagsHTML = '<button class="tag-filter active" data-tag="all">All</button>';
  
  // Add a wrapper for all other tags
  tagsHTML += '<div class="all-tags-wrapper">';
  sortedTags.forEach(tag => {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    tagsHTML += `<button class="tag-filter" data-tag="${tagSlug}">${tag}</button>`;
  });
  tagsHTML += '</div>'; // Close wrapper
  
  // Add "See more" button after the wrapper, initially hidden
  tagsHTML += '<button class="see-more-tags" data-state="more" style="display: none;">See more</button>';

  tagFilterContainer.innerHTML = tagsHTML;

  // Adjust visibility after tags are rendered
  // Use setTimeout to ensure layout calculation happens after render
  setTimeout(adjustVisibleTags, 0);
}

/**
 * Adjusts the visibility of tags based on available width, showing only two rows initially.
 */
function adjustVisibleTags() {
  const tagFilterContainer = document.querySelector('.blog-filter-tags');
  if (!tagFilterContainer) return;
  
  const tagsWrapper = tagFilterContainer.querySelector('.all-tags-wrapper');
  const seeMoreButton = tagFilterContainer.querySelector('.see-more-tags');
  const allTagButtons = tagsWrapper ? Array.from(tagsWrapper.querySelectorAll('.tag-filter')) : [];

  if (!tagsWrapper || !seeMoreButton || allTagButtons.length === 0) {
    if (seeMoreButton) seeMoreButton.style.display = 'none'; // Hide if no tags
    return;
  }

  // Reset styles to calculate natural layout
  tagsWrapper.style.maxHeight = '';
  tagsWrapper.style.overflow = '';
  seeMoreButton.style.display = 'none'; // Hide button initially

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
       // Check if this tag starts a new row *after* the second row started
       const previousTag = tag.previousElementSibling;
       if (previousTag && tag.offsetTop > previousTag.offsetTop) {
           thirdRowOffsetTop = tag.offsetTop;
           break; // Found the start of the third row
       }
    }
  }
  
  // Check if the container itself is taller than the start of the third row (handles wrapping)
  const containerScrollHeight = tagsWrapper.scrollHeight;
  const containerClientHeight = tagsWrapper.clientHeight; // Height when not constrained

  if (thirdRowOffsetTop !== -1 && containerScrollHeight > (thirdRowOffsetTop - firstTagOffsetTop)) {
    // Calculate height for two rows. Use the offsetTop of the start of the third row.
    const twoRowsHeight = thirdRowOffsetTop - firstTagOffsetTop;
    
    // Apply max-height and overflow
    tagsWrapper.style.maxHeight = `${twoRowsHeight - 1}px`; // Subtract 1px to ensure cutoff
    tagsWrapper.style.overflow = 'hidden';
    seeMoreButton.style.display = 'inline-block'; // Show the button
    seeMoreButton.textContent = 'See more';
    seeMoreButton.setAttribute('data-state', 'more');
  } else {
    // All tags fit within two rows or less
    tagsWrapper.style.maxHeight = '';
    tagsWrapper.style.overflow = '';
    seeMoreButton.style.display = 'none'; // Hide the button
  }
}


/**
 * Sets up event listeners for blog filtering
 */
// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

let isInitialLoad = true; // Flag to prevent immediate execution on load for resize

function setupBlogFilters() {
  const tagFilterContainer = document.querySelector('.blog-filter-tags');
  if (!tagFilterContainer) return;

  // --- Event Listener for Clicks ---
  tagFilterContainer.addEventListener('click', function(e) {
    // Handle tag filter clicks (applies to 'All' button and tags inside wrapper)
    if (e.target.classList.contains('tag-filter')) {
      const selectedTag = e.target.getAttribute('data-tag');
      
      // Update active state on ALL filter buttons (incl. 'All')
      tagFilterContainer.querySelectorAll('.tag-filter').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Filter blog posts
      filterBlogPostsByTag(selectedTag);
    }

    // Handle "See more/less" clicks
    if (e.target.classList.contains('see-more-tags')) {
      const button = e.target;
      const tagsWrapper = tagFilterContainer.querySelector('.all-tags-wrapper');
      const currentState = button.getAttribute('data-state');

      if (currentState === 'more') {
        // Expand: Remove max-height and overflow
        tagsWrapper.style.maxHeight = '';
        tagsWrapper.style.overflow = '';
        button.textContent = 'See less';
        button.setAttribute('data-state', 'less');
      } else {
        // Collapse: Re-apply the two-row limit
        adjustVisibleTags(); // Recalculate and apply the correct max-height
        button.textContent = 'See more'; // adjustVisibleTags will set this if needed
        button.setAttribute('data-state', 'more'); // adjustVisibleTags will set this if needed

        // Optional: If active tag is now hidden, scroll it into view or switch to 'All'
        const activeTag = tagsWrapper.querySelector('.tag-filter.active');
        if (activeTag && tagsWrapper.scrollHeight > tagsWrapper.clientHeight) {
           // Check if the active tag is actually hidden (offsetTop > wrapper visible height)
           const wrapperRect = tagsWrapper.getBoundingClientRect();
           const activeTagRect = activeTag.getBoundingClientRect();
           if (activeTagRect.bottom > wrapperRect.bottom) {
               // Option 1: Scroll active tag into view (might be slightly off due to overflow hidden)
               // activeTag.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
               
               // Option 2: Switch back to 'All' filter
               const allButton = tagFilterContainer.querySelector('.tag-filter[data-tag="all"]');
               if (allButton) {
                   tagFilterContainer.querySelectorAll('.tag-filter').forEach(btn => btn.classList.remove('active'));
                   allButton.classList.add('active');
                   filterBlogPostsByTag('all');
               }
           }
        }
      }
    }
  });

  // --- Event Listener for Resize ---
  // Debounce the resize handler
  const debouncedAdjustTags = debounce(adjustVisibleTags, 250);

  window.addEventListener('resize', () => {
      // Don't run immediately on load if adjustVisibleTags is already called
      if (!isInitialLoad) {
          debouncedAdjustTags();
      }
      isInitialLoad = false; // Set flag after first potential resize event
  });

  // Reset flag after initial setup allows resize to work
  setTimeout(() => { isInitialLoad = false; }, 100);
}

/**
 * Filters blog posts by selected tag
 * @param {string} tag - Tag to filter by
 */
function filterBlogPostsByTag(tag) {
  const blogCards = document.querySelectorAll('.blog-card');
  
  blogCards.forEach(card => {
    if (tag === 'all') {
      card.style.display = 'block';
    } else {
      const cardTags = card.querySelectorAll('.blog-tag');
      let hasTag = false;
      
      cardTags.forEach(cardTag => {
        if (cardTag.getAttribute('data-tag') === tag) {
          hasTag = true;
        }
      });
      
      card.style.display = hasTag ? 'block' : 'none';
    }
  });
}

// Note: The openBlogPost function has been removed as we now use direct links to blog post pages

/**
 * Displays fallback blog posts if JSON loading fails
 */
function displayFallbackBlogPosts() {
  const blogContainer = document.querySelector('.blog-grid');
  
  if (blogContainer) {
    // Keep any existing content as fallback
    if (blogContainer.children.length === 0) {
      // Updated fallback content to match new structure
      blogContainer.innerHTML = `
        <div class="blog-card">
          <div class="blog-card-content">
            <div class="blog-meta">
              <span class="blog-date">April 30, 2025</span>
            </div>
            <h3>Could not load blog posts</h3>
            <p>Please try refreshing the page or check back later.</p>
            <div class="blog-tags">
              <span class="blog-tag">Error</span>
            </div>
          </div>
        </div>
      `;
    }
  }
}