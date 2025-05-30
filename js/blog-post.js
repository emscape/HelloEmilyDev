/**
 * Blog post script for HelloEmily.dev
 * Loads and displays a single blog post based on URL parameters
 * Uses BlogContentParser for rendering content blocks
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get post slug from URL path, e.g., /blog/my-post-slug/
    const pathname = window.location.pathname;
    // Remove leading/trailing slashes, then split. Expected: "blog/my-post-slug"
    const cleanedPath = pathname.replace(/^\/+|\/+$/g, '');
    const pathParts = cleanedPath.split('/');
    let postSlug = null;

    if (pathParts.length === 2 && pathParts[0] === 'blog') {
        postSlug = pathParts[1];
    }

    if (!postSlug) {
        displayError('Could not determine blog post slug from URL.');
        return;
    }

    // Construct the path to the individual post JSON file
    // Construct the path to the individual post JSON file.
    // Assuming blog-post.html (or the page running this script) is at the site root
    // and needs to fetch /blog/slug-name/post-data.json
    const postJsonPath = `./post-data.json`; // Fetch from the current directory

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

// Helper function to ensure image paths are root-relative or absolute
function makePathRootRelative(path) {
    if (!path || typeof path !== 'string') return '';
    // If it's an absolute URL (starts with http/https) or already root-relative (starts with /), return as is.
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('/')) {
        return path;
    }
    // Otherwise, make it root-relative.
    return '/' + path.replace(/^\.\//, ''); // Remove leading ./ if present
}

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

    // No banner image needed

    // --- NEW: Prepare Inline Featured Image Source ---
    let inlineImageSrc = '';
    if (post.featuredImage && post.featuredImage.trim() !== '') {
        inlineImageSrc = makePathRootRelative(post.featuredImage);
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

    // Dynamically create and append share buttons HTML
    const articleElement = container.querySelector('article.blog-post');
    if (articleElement) {
        const shareButtonsHTML = `
            <div class="share-buttons-container">
                <a href="#" class="share-button bluesky" aria-label="Share on Bluesky" target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><title>Bluesky</title><path fill="#0285FF" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>
                    <span>Bluesky</span>
                </a>
                <a href="#" class="share-button facebook" aria-label="Share on Facebook" target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 408.788 408.788" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path style="fill:#475993;" d="M353.701,0H55.087C24.665,0,0.002,24.662,0.002,55.085v298.616c0,30.423,24.662,55.085,55.085,55.085 h147.275l0.251-146.078h-37.951c-4.932,0-8.935-3.988-8.954-8.92l-0.182-47.087c-0.019-4.959,3.996-8.989,8.955-8.989h37.882 v-45.498c0-52.8,32.247-81.55,79.348-81.55h38.65c4.945,0,8.955,4.009,8.955,8.955v39.704c0,4.944-4.007,8.952-8.95,8.955 l-23.719,0.011c-25.615,0-30.575,12.172-30.575,30.035v39.389h56.285c5.363,0,9.524,4.683,8.892,10.009l-5.581,47.087 c-0.534,4.506-4.355,7.901-8.892,7.901h-50.453l-0.251,146.078h87.631c30.422,0,55.084-24.662,55.084-55.084V55.085 C408.786,24.662,384.124,0,353.701,0z"/></svg>
                    <span>Facebook</span>
                </a>
                <a href="#" class="share-button linkedin" aria-label="Share on LinkedIn" target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 382 382" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path style="fill:#0077B7;" d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z"/></svg>
                    <span>LinkedIn</span>
                </a>
            </div>
        `;
        articleElement.insertAdjacentHTML('beforeend', shareButtonsHTML);
    } else {
        console.error('Article element not found for appending share buttons.');
    }

    // Call addSharingButtons to populate hrefs
    addSharingButtons(post);

    // Add Disqus comments section
    // addDisqusComments(post); // Disqus functionality commented out

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

    const imagesHtml = images.map((img, index) => {
        const imgSrc = makePathRootRelative(img);
        return `<div class="gallery-item">
            <img src="${imgSrc}" alt="${postTitle} - Image ${index + 1}" class="gallery-image">
        </div>`;
    }).join('');

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
    // Set canonical URL using the new clean structure
    // post.id is the clean slug (e.g., "my-post-slug")
    const canonicalURL = `https://helloemily.dev/blog/${post.id}/`;
    const siteBaseUrl = 'https://helloemily.dev/'; // Define base URL

    // Determine the image to use for social sharing (prioritize featured)
    let socialImage = post.featuredImage && post.featuredImage.trim() !== ''
        ? post.featuredImage
        : 'images/site-preview.jpg'; // Fallback directly to default if no featured image

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
 * Adds social sharing buttons to the blog post
 * @param {Object} post - Blog post object
 */
function addSharingButtons(post) {
    const blueskyButton = document.querySelector('.share-button.bluesky');
    const facebookButton = document.querySelector('.share-button.facebook');
    const linkedinButton = document.querySelector('.share-button.linkedin');

    if (!blueskyButton || !facebookButton || !linkedinButton) {
        console.error('One or more share buttons not found in the DOM.');
        return;
    }

    // Use the canonical URL for sharing
    const canonicalURL = `https://helloemily.dev/blog/${post.id}/`;
    const postTitleEncoded = encodeURIComponent(post.title);
    const postUrlEncoded = encodeURIComponent(canonicalURL);

    // Set Bluesky share URL
    blueskyButton.href = `https://bsky.app/intent/compose?text=${postTitleEncoded}%20${postUrlEncoded}`;

    // Set Facebook share URL
    facebookButton.href = `https://www.facebook.com/sharer/sharer.php?u=${postUrlEncoded}`;

    // Set LinkedIn share URL
    linkedinButton.href = `https://www.linkedin.com/sharing/share-offsite/?url=${postUrlEncoded}`;
}

/**
 * Adds Disqus comments section to the blog post
 * @param {Object} post - Blog post object
 */
/* // Disqus functionality commented out
function addDisqusComments(post) {
    const articleElement = document.querySelector('.blog-post-content-container article.blog-post');
    if (!articleElement) {
        console.error('Blog post article element not found for Disqus.');
        return;
    }

    const disqusHtml = `
        <div id="disqus_thread" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;"></div>
    `;
    articleElement.insertAdjacentHTML('beforeend', disqusHtml);

    // Disqus configuration
    var disqus_config = function () {
        this.page.url = window.location.href;  // Replace PAGE_URL with your page's canonical URL variable
        this.page.identifier = post.id; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };

    (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.src = 'https://YOUR_DISQUS_SHORTNAME.disqus.com/embed.js'; // IMPORTANT: Replace YOUR_DISQUS_SHORTNAME
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
}
*/

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