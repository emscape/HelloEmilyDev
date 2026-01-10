/**
 * Blog post script for HelloEmily.dev - REFACTORED
 * Functional programming approach with pure functions
 * Loads and displays a single blog post based on URL parameters
 */

import { escapeHtml, sanitizeUrl } from './utils/security.js';
import { ErrorHandler, ErrorContext } from './utils/error-handler.js';
import { formatDate } from './utils/date-formatter.js';
import { makePathRootRelative } from './utils/path-utils.js';

// ============================================================================
// PURE FUNCTIONS - Data Transformation
// ============================================================================

/**
 * Extracts post slug from URL pathname
 * Pure function
 * 
 * @param {string} pathname - URL pathname
 * @returns {string|null} - Post slug or null
 */
const extractPostSlug = (pathname) => {
  const cleanedPath = pathname.replace(/^\/+|\/+$/g, '');
  const pathParts = cleanedPath.split('/');
  
  if (pathParts.length === 2 && pathParts[0] === 'blog') {
    return pathParts[1];
  }
  
  return null;
};

/**
 * Formats post data for display
 * Pure function
 * 
 * @param {Object} post - Raw post data
 * @returns {Object} - Formatted post data
 */
const formatPostData = (post) => ({
  ...post,
  formattedDate: formatDate(post.date),
  inlineImageSrc: post.featuredImage && post.featuredImage.trim() !== ''
    ? makePathRootRelative(post.featuredImage)
    : null
});

/**
 * Generates tags HTML
 * Pure function
 * 
 * @param {Array<string>} tags - Array of tag strings
 * @returns {string} - HTML string for tags
 */
const generateTagsHTML = (tags) => {
  if (!tags || !Array.isArray(tags)) return '';
  
  return tags
    .map(tag => `<span class="blog-tag">${escapeHtml(tag)}</span>`)
    .join('');
};

/**
 * Generates additional images gallery HTML
 * Pure function
 * 
 * @param {Array<string>} images - Array of image paths
 * @param {string} postTitle - Post title for alt text
 * @returns {string} - HTML string for gallery
 */
const generateGalleryHTML = (images, postTitle) => {
  if (!images || images.length === 0) return '';

  const imagesHtml = images.map((img, index) => {
    const imgSrc = sanitizeUrl(makePathRootRelative(img));
    const altText = escapeHtml(`${postTitle} - Image ${index + 1}`);
    return `<div class="gallery-item">
      <img src="${imgSrc}" alt="${altText}" class="gallery-image" loading="lazy">
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
};

/**
 * Parses post content based on format
 * Pure function (delegates to BlogContentParser)
 * 
 * @param {*} content - Post content (array or string)
 * @param {Object} contentParser - BlogContentParser instance
 * @returns {string} - Parsed HTML content
 */
const parsePostContent = (content, contentParser) => {
  if (content && Array.isArray(content)) {
    // New format: content is stored as an array of blocks
    return contentParser.parseBlocks(content);
  } else if (typeof content === 'string') {
    // Legacy format: content is stored as HTML string
    const legacyBlocks = contentParser.parseLegacyContent(content);
    return contentParser.parseBlocks(legacyBlocks);
  } else {
    // Handle cases where content is missing
    return '<p>No content available</p>';
  }
};

/**
 * Generates main blog post HTML
 * Pure function
 * 
 * @param {Object} formattedPost - Formatted post data
 * @param {string} parsedContent - Parsed content HTML
 * @param {string} tagsHTML - Tags HTML
 * @param {string} galleryHTML - Gallery HTML
 * @returns {string} - Complete post HTML
 */
const generatePostHTML = (formattedPost, parsedContent, tagsHTML, galleryHTML) => {
  return `
    <article class="blog-post">
      <div class="blog-post-header">
        <h2>${escapeHtml(formattedPost.title)}</h2>
        <div class="blog-meta">
          <span class="blog-date">${escapeHtml(formattedPost.formattedDate)}</span>
          <span class="blog-author">By ${escapeHtml(formattedPost.author)}</span>
        </div>
        <div class="blog-tags">
          ${tagsHTML}
        </div>
      </div>
      <div class="blog-post-content">
        ${parsedContent}
      </div>
      ${galleryHTML}
    </article>
  `;
};

/**
 * Generates share buttons HTML
 * Pure function
 * 
 * @returns {string} - Share buttons HTML
 */
const generateShareButtonsHTML = () => {
  return `
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
};

/**
 * Generates share URLs for social platforms
 * Pure function
 * 
 * @param {Object} post - Post data
 * @returns {Object} - Share URLs for each platform
 */
const generateShareUrls = (post) => {
  const canonicalURL = `https://helloemily.dev/blog/${post.id}/`;
  const postTitleEncoded = encodeURIComponent(post.title);
  const postUrlEncoded = encodeURIComponent(canonicalURL);

  return {
    bluesky: `https://bsky.app/intent/compose?text=${postTitleEncoded}%20${postUrlEncoded}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${postUrlEncoded}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${postUrlEncoded}`
  };
};

/**
 * Generates meta tag updates
 * Pure function
 * 
 * @param {Object} post - Post data
 * @returns {Object} - Meta tag values
 */
const generateMetaTagValues = (post) => {
  const canonicalURL = sanitizeUrl(`https://helloemily.dev/blog/${escapeHtml(post.id)}/`);
  const siteBaseUrl = 'https://helloemily.dev/';

  let featuredImage = post.featuredImage && post.featuredImage.trim() !== ''
    ? makePathRootRelative(post.featuredImage)
    : 'images/site-preview.jpg';

  if (!featuredImage.startsWith('http')) {
    featuredImage = siteBaseUrl + featuredImage;
  }

  featuredImage = featuredImage.replace(/([^:]\/)\/+/g, '$1');
  featuredImage = sanitizeUrl(featuredImage);

  return {
    url: canonicalURL,
    title: escapeHtml(post.title),
    description: escapeHtml(post.shortDescription || 'Read this blog post by Emily Anderson.'),
    image: featuredImage,
    documentTitle: `${escapeHtml(post.title)} | Emily Anderson`
  };
};

// ============================================================================
// IMPURE FUNCTIONS - Side Effects (DOM Manipulation)
// ============================================================================

/**
 * Injects inline featured image into content
 * Impure function - DOM manipulation
 * 
 * @param {HTMLElement} contentDiv - Content container
 * @param {string} imageSrc - Image source URL
 * @param {string} altText - Alt text for image
 */
const injectInlineImage = (contentDiv, imageSrc, altText) => {
  if (!contentDiv || !imageSrc) return;

  const firstBlockElement = contentDiv.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, table, blockquote, pre, div');

  const imgElement = document.createElement('img');
  imgElement.src = imageSrc;
  imgElement.alt = altText;
  imgElement.classList.add('blog-post-inline-image');
  imgElement.loading = 'lazy';

  if (firstBlockElement) {
    firstBlockElement.parentNode.insertBefore(imgElement, firstBlockElement);
  } else {
    contentDiv.insertBefore(imgElement, contentDiv.firstChild);
  }
};

/**
 * Updates share button hrefs in engagement section
 * Impure function - DOM manipulation
 * 
 * @param {Object} shareUrls - Share URLs object
 */
const updateEngagementShareButtons = (shareUrls) => {
  // Update Bluesky button in engagement section
  const blueskyButton = document.querySelector('.engagement-section .share-button[aria-label*="Bluesky"]');
  if (blueskyButton) {
    blueskyButton.href = shareUrls.bluesky;
  }
  
  // Update Facebook button in engagement section
  const facebookButton = document.querySelector('.engagement-section .share-button[aria-label*="Facebook"]');
  if (facebookButton) {
    facebookButton.href = shareUrls.facebook;
  }
  
  // Update LinkedIn button in engagement section
  const linkedinButton = document.querySelector('.engagement-section .share-button[aria-label*="LinkedIn"]');
  if (linkedinButton) {
    linkedinButton.href = shareUrls.linkedin;
  }
};

/**
 * Updates share button hrefs
 * Impure function - DOM manipulation
 * 
 * @param {Object} shareUrls - Share URLs object
 */
const updateShareButtons = (shareUrls) => {
  const blueskyButton = document.querySelector('.share-button.bluesky');
  const facebookButton = document.querySelector('.share-button.facebook');
  const linkedinButton = document.querySelector('.share-button.linkedin');

  if (blueskyButton) blueskyButton.href = shareUrls.bluesky;
  if (facebookButton) facebookButton.href = shareUrls.facebook;
  if (linkedinButton) linkedinButton.href = shareUrls.linkedin;
};

/**
 * Updates meta tags in document head
 * Impure function - DOM manipulation
 * 
 * @param {Object} metaValues - Meta tag values
 */
const updateMetaTags = (metaValues) => {
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');

  if (ogUrl) ogUrl.setAttribute('content', metaValues.url);
  if (ogTitle) ogTitle.setAttribute('content', metaValues.title);
  if (ogDescription) ogDescription.setAttribute('content', metaValues.description);
  if (ogImage) ogImage.setAttribute('content', metaValues.image);

  document.title = metaValues.documentTitle;
};

/**
 * Renders blog post to container
 * Impure function - DOM manipulation
 * Orchestrates pure functions and side effects
 * 
 * @param {HTMLElement} container - Container element
 * @param {Object} post - Post data
 * @param {Object} contentParser - BlogContentParser instance
 */
const renderBlogPost = (container, post, contentParser) => {
  // Pure transformations
  const formattedPost = formatPostData(post);
  const tagsHTML = generateTagsHTML(post.tags);
  const parsedContent = parsePostContent(post.content, contentParser);
  const galleryHTML = generateGalleryHTML(post.additionalImages, post.title);
  const postHTML = generatePostHTML(formattedPost, parsedContent, tagsHTML, galleryHTML);
  
  // Side effect: Update DOM
  container.innerHTML = postHTML;
  
  // Side effect: Inject inline image
  if (formattedPost.inlineImageSrc) {
    const contentDiv = container.querySelector('.blog-post-content');
    injectInlineImage(contentDiv, formattedPost.inlineImageSrc, post.title);
  }
  
  // Side effect: Update share buttons (now in engagement section HTML)
  const shareUrls = generateShareUrls(post);
  updateEngagementShareButtons(shareUrls);
  
  // Side effect: Update meta tags
  const metaValues = generateMetaTagValues(post);
  updateMetaTags(metaValues);
};

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  const postSlug = extractPostSlug(window.location.pathname);
  
  if (!postSlug) {
    const container = document.querySelector('.blog-post-content-container');
    const handleError = ErrorHandler.createBoundary(container, ErrorContext.FETCH);
    handleError(new Error('Invalid URL'), 'Could not determine blog post from URL.');
    return;
  }

  const postJsonPath = `/blog/${postSlug}/post-data.json`;
  const container = document.querySelector('.blog-post-content-container');
  const handleError = ErrorHandler.createBoundary(container, ErrorContext.FETCH);
  
  // Store postSlug globally for comments system
  window.currentPostId = postSlug;
  
  fetch(postJsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(post => {
      if (!post) {
        throw new Error('Blog post data is invalid');
      }

      const contentParser = new BlogContentParser();
      renderBlogPost(container, post, contentParser);
      
      // Initialize comments system after post is rendered
      if (typeof initBlogComments === 'function') {
        initBlogComments(postSlug);
      }
    })
    .catch(error => {
      ErrorHandler.log(error, ErrorContext.FETCH);
      handleError(error, `Unable to load blog post: ${escapeHtml(postSlug)}`);
    });
});

