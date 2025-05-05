/**
 * Blog loader script for HelloEmily.dev
 * Dynamically loads and displays blog posts from JSON
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
    
});

/**
 * Displays blog posts in the blog grid
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
    
    // Only show the latest 3 posts on the main page
    const latestPosts = validPosts.slice(0, 3);
    
    // Create and append blog post cards
    latestPosts.forEach(post => {
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
      `; // Use slug for link
      
      blogContainer.appendChild(postCard);
    });
    
  }
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
            <p>Please try refreshing the page.</p>
            <div class="blog-tags">
              <span class="blog-tag">Error</span>
            </div>
            <a href="blog-archive.html" class="btn blog-read-more">View Archive</a>
          </div>
        </div>
      `;
    }
  }
}