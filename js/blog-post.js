/**
 * Blog post script for HelloEmily.dev
 * Loads and displays a single blog post based on URL parameters
 * Uses BlogContentParser for rendering content blocks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get post slug from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('slug'); // Changed 'id' to 'slug'

    if (!postSlug) {
        displayError('No blog post slug specified'); // Updated error message
        return;
    }

    // Construct the path to the individual post JSON file
    const postJsonPath = `./blog-data/${postSlug}.json`;

    // Load specific post data from its JSON file
    fetch(postJsonPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(post => { // The fetched data is the post object directly
            if (!post) { // Basic check if JSON is empty/invalid
                displayError('Blog post data is invalid');
                return;
            }

            displayBlogPost(post);
            updateMetaTags(post);
        })
        .catch(error => {
            console.error('Error loading blog post data:', error);
            displayError(`Error loading blog post: ${postSlug}`); // Updated error message
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

    // --- NEW: Prepare Banner Image HTML ---
    let bannerImageHtml = '';
    if (post.bannerImage && post.bannerImage.trim() !== '') {
        bannerImageHtml = `<div class="blog-post-banner"><img src="${post.bannerImage}" alt="${post.title} Banner"></div>`;
    } else {
        // Optional: Add a default banner or leave empty
        console.warn(`No banner image found for post: ${post.id}`);
        // bannerImageHtml = `<div class="blog-post-banner blog-post-banner-default"></div>`; // Example default
    }

    // --- NEW: Prepare Inline Featured Image Source ---
    let inlineImageSrc = '';
    if (post.featuredImage && post.featuredImage.trim() !== '') {
        inlineImageSrc = post.featuredImage;
        // We'll create the element later for DOM insertion
    } else {
        console.warn(`No featured image found for inline placement for post: ${post.id}`);
    }

    // Parse content based on format
    let parsedContent;
    if (post.content && Array.isArray(post.content)) {
        // New format: content is stored as an array of blocks
        parsedContent = contentParser.parseBlocks(post.content);
    } else if (typeof post.content === 'string') {
        // Legacy format: content is stored as HTML string
        const legacyBlocks = contentParser.parseLegacyContent(post.content);
        parsedContent = contentParser.parseBlocks(legacyBlocks);
    } else {
        // Handle cases where content is missing or neither format
        parsedContent = '<p>No content available</p>';
    }

    // Build initial post HTML (without inline image yet)
    container.innerHTML = `
        <article class="blog-post">
            ${bannerImageHtml}
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

    // --- NEW: Inject Inline Featured Image using DOM manipulation ---
    if (inlineImageSrc) {
        const contentDiv = container.querySelector('.blog-post-content');
        if (contentDiv) {
            // Find the first element node (paragraph, heading, etc.) to insert before
            const firstBlockElement = contentDiv.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre, div');

            if (firstBlockElement) {
                const imgElement = document.createElement('img');
                imgElement.src = inlineImageSrc;
                imgElement.alt = post.title; // Use post title for alt text, or could be more specific
                imgElement.classList.add('blog-post-inline-image'); // Add class for styling
                // Insert the image before the first block element
                firstBlockElement.parentNode.insertBefore(imgElement, firstBlockElement);
            } else {
                 // Fallback: If no block element found, prepend to the content div itself
                 const imgElement = document.createElement('img');
                 imgElement.src = inlineImageSrc;
                 imgElement.alt = post.title;
                 imgElement.classList.add('blog-post-inline-image');
                 contentDiv.insertBefore(imgElement, contentDiv.firstChild);
            }
        }
    }


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
    // Set canonical URL using slug
    const canonicalURL = `https://helloemily.dev/blog-post.html?slug=${post.id}`; // Use post.id which is the slug here
    const siteBaseUrl = 'https://helloemily.dev/'; // Define base URL

    // Determine the image to use for social sharing (prioritize banner)
    let socialImage = post.bannerImage && post.bannerImage.trim() !== ''
        ? post.bannerImage
        : (post.featuredImage && post.featuredImage.trim() !== '' ? post.featuredImage : 'images/site-preview.jpg'); // Fallback to featured, then default

    // Ensure the social image URL is absolute
    if (!socialImage.startsWith('http')) {
        socialImage = siteBaseUrl + socialImage;
    }


    // Update Open Graph meta tags
    document.querySelector('meta[property="og:url"]').setAttribute('content', canonicalURL);
    document.querySelector('meta[property="og:title"]').setAttribute('content', post.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', post.shortDescription || 'Read this blog post by Emily Anderson.'); // Provide a fallback description
    document.querySelector('meta[property="og:image"]').setAttribute('content', socialImage);


    // Update Twitter meta tags
    document.querySelector('meta[property="twitter:url"]').setAttribute('content', canonicalURL);
    document.querySelector('meta[property="twitter:title"]').setAttribute('content', post.title);
    document.querySelector('meta[property="twitter:description"]').setAttribute('content', post.shortDescription || 'Read this blog post by Emily Anderson.'); // Provide a fallback description
    document.querySelector('meta[property="twitter:image"]').setAttribute('content', socialImage);

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