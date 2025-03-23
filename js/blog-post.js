/**
 * Blog post script for HelloEmily.dev
 * Loads and displays a single blog post based on URL parameters
 * Uses BlogContentParser for rendering content blocks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get post ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        displayError('No blog post ID specified');
        return;
    }
    
    // Load blog data from JSON file
    fetch('./blog/blog-data.json')
        .then(response => response.json())
        .then(data => {
            const post = data.posts.find(p => p.id === postId);
            
            if (!post) {
                displayError('Blog post not found');
                return;
            }
            
            displayBlogPost(post);
            updateMetaTags(post);
        })
        .catch(error => {
            console.error('Error loading blog data:', error);
            displayError('Error loading blog post');
        });
});

/**
 * Displays a single blog post
 * @param {Object} post - Blog post object
 */
function displayBlogPost(post) {
    const container = document.querySelector('.blog-post-content-container');
    
    if (!container) return;
    
    // Initialize content parser
    const contentParser = new BlogContentParser();
    
    // Format date
    const postDate = new Date(post.date);
    const formattedDate = postDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create tags HTML
    const tagsHTML = post.tags
        .map(tag => `<span class="blog-tag">${tag}</span>`)
        .join('');
    
    // Check for featured image - if none exists, use placeholder
    let featuredImageHtml = '';
    if (post.featuredImage && post.featuredImage.trim() !== '') {
        featuredImageHtml = `<div class="blog-post-image"><img src="${post.featuredImage}" alt="${post.title}"></div>`;
    } else {
        // Use placeholder image based on post ID
        const placeholderPath = `images/blog/placeholder.svg`;
        featuredImageHtml = `<div class="blog-post-image"><img src="${placeholderPath}" alt="${post.title}"></div>`;
        console.warn(`No featured image found for post: ${post.id}`);
    }
    
    // Parse content based on format
    let parsedContent;
    if (post.blocks && Array.isArray(post.blocks)) {
        // New format: content is stored as blocks
        parsedContent = contentParser.parseBlocks(post.blocks);
    } else if (post.content) {
        // Legacy format: content is stored as HTML string
        const legacyBlocks = contentParser.parseLegacyContent(post.content);
        parsedContent = contentParser.parseBlocks(legacyBlocks);
    } else {
        parsedContent = '<p>No content available</p>';
    }
    
    // Build post HTML
    container.innerHTML = `
        <article class="blog-post">
            ${featuredImageHtml}
            <div class="blog-post-header">
                <h2>${post.title}</h2>
                <div class="blog-meta">
                    <span class="blog-date">${formattedDate}</span>
                    <span class="blog-author">By ${post.author}</span>
                </div>
                <div class="blog-tags">
                    ${tagsHTML}
                </div>
            </div>
            <div class="blog-post-content">
                ${parsedContent}
            </div>
            ${post.additionalImages && post.additionalImages.length > 0 ? renderAdditionalImages(post.additionalImages, post.title) : ''}
        </article>
    `;
    
    // Update document title
    document.title = `${post.title} | Emily Anderson`;
}

/**
 * Renders additional images gallery for a blog post
 * @param {Array} images - Array of image paths
 * @param {String} postTitle - Title of the blog post for alt text
 * @returns {String} HTML for the image gallery
 */
function renderAdditionalImages(images, postTitle) {
    if (!images || images.length === 0) return '';
    
    const imagesHtml = images.map((img, index) =>
        `<div class="gallery-item">
            <img src="${img}" alt="${postTitle} - Image ${index + 1}" class="gallery-image">
        </div>`
    ).join('');
    
    return `
        <div class="blog-image-gallery">
            <h3>Image Gallery</h3>
            <div class="gallery-container">
                ${imagesHtml}
            </div>
        </div>
    `;
}

/**
 * Updates meta tags for social sharing
 * @param {Object} post - Blog post object
 */
function updateMetaTags(post) {
    // Set canonical URL
    const canonicalURL = `https://helloemily.dev/blog-post.html?id=${post.id}`;
    
    // Update Open Graph meta tags
    document.querySelector('meta[property="og:url"]').setAttribute('content', canonicalURL);
    document.querySelector('meta[property="og:title"]').setAttribute('content', post.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', post.shortDescription);
    
    if (post.featuredImage) {
        document.querySelector('meta[property="og:image"]').setAttribute('content', `https://helloemily.dev/${post.featuredImage}`);
    }
    
    // Update Twitter meta tags
    document.querySelector('meta[property="twitter:url"]').setAttribute('content', canonicalURL);
    document.querySelector('meta[property="twitter:title"]').setAttribute('content', post.title);
    document.querySelector('meta[property="twitter:description"]').setAttribute('content', post.shortDescription);
    
    if (post.featuredImage) {
        document.querySelector('meta[property="twitter:image"]').setAttribute('content', `https://helloemily.dev/${post.featuredImage}`);
    }
}

/**
 * Displays an error message
 * @param {string} message - Error message to display
 */
function displayError(message) {
    const container = document.querySelector('.blog-post-content-container');
    
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 50px 20px;">
                <h2 style="color: #ff6b6b; margin-bottom: 20px;">Oops! Something went wrong</h2>
                <p>${message}</p>
                <p style="margin-top: 30px;">
                    <a href="blog-archive.html" class="btn">View All Blog Posts</a>
                </p>
            </div>
        `;
    }
    
    // Update document title
    document.title = 'Blog Post Not Found | Emily Anderson';
}