/**
 * Blog archive script for HelloEmily.dev
 * Loads and displays all blog posts from JSON
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load blog data from JSON file
  fetch('./blog/blog-data.json')
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
      
      // Build card HTML
      postCard.innerHTML = `
        ${post.featuredImage ? `<div class="blog-image"><img src="${post.featuredImage}" alt="${post.title}"></div>` : ''}
        <div class="blog-card-content">
          <div class="blog-meta">
            <span class="blog-date">${formattedDate}</span>
            <span class="blog-author">By ${post.author}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.shortDescription}</p>
          <div class="blog-tags">
            ${tagsHTML}
          </div>
          <a href="blog-post.html?id=${post.id}" class="btn blog-read-more">Read More</a>
        </div>
      `;
      
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
      blogContainer.innerHTML = `
        <div class="blog-card">
          <div class="blog-card-content">
            <div class="blog-meta">
              <span class="blog-date">March 1, 2025</span>
              <span class="blog-author">By Emily Anderson</span>
            </div>
            <h3>Getting Started with AI: A Beginner's Guide</h3>
            <p>An introduction to artificial intelligence concepts for beginners</p>
            <div class="blog-tags">
              <span class="blog-tag">Artificial Intelligence</span>
              <span class="blog-tag">Technology</span>
            </div>
            <a href="blog-post.html?id=getting-started-with-ai" class="btn blog-read-more">Read More</a>
          </div>
        </div>
      `;
    }
  }
}