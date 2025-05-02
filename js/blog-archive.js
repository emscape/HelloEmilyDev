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
          <a href="blog-post.html?slug=${post.slug}" class="btn blog-read-more">Read More</a>
        </div>
      `; // Use slug for link, removed author, shortDescription
      
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
  
  // Extract all unique tags
  const allTags = new Set();
  posts.forEach(post => {
    post.tags.forEach(tag => {
      allTags.add(tag);
    });
  });
  
  // Sort tags alphabetically
  const sortedTags = Array.from(allTags).sort();
  
  // Create tag filter buttons
  tagFilterContainer.innerHTML = '<button class="tag-filter active" data-tag="all">All</button>';
  sortedTags.forEach(tag => {
    const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
    tagFilterContainer.innerHTML += `<button class="tag-filter" data-tag="${tagSlug}">${tag}</button>`;
  });
}

/**
 * Sets up event listeners for blog filtering
 */
function setupBlogFilters() {
  // Tag filtering
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('tag-filter')) {
      const selectedTag = e.target.getAttribute('data-tag');
      
      // Update active state on filter buttons
      document.querySelectorAll('.tag-filter').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Filter blog posts
      filterBlogPostsByTag(selectedTag);
    }
  });
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