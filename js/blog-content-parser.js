/**
 * Blog Content Parser for HelloEmily.dev - REFACTORED
 * Functional programming approach with pure functions
 * Parses block-based content structure and renders different block types
 */

import { escapeHtml, sanitizeUrl } from './utils/security.js';

// ============================================================================
// PURE FUNCTIONS - WebP Image Handling
// ============================================================================

/**
 * Derives WebP source from image source
 * Pure function
 * 
 * @param {string} baseSrc - Original image source
 * @param {string|null} webpSrc - Explicit WebP source (optional)
 * @returns {string|null} - WebP source or null
 */
const deriveWebPSource = (baseSrc, webpSrc = null) => {
  if (webpSrc) return webpSrc;
  if (!baseSrc) return null;
  
  // Only derive if baseSrc ends with .jpg, .jpeg, or .png
  if (/\.(jpe?g|png)$/i.test(baseSrc)) {
    return baseSrc.replace(/\.(jpe?g|png)$/i, '.webp');
  }
  
  return null;
};

/**
 * Generates WebP source HTML
 * Pure function
 * 
 * @param {string|null} webpSrc - WebP source URL
 * @returns {string} - HTML for WebP source tag
 */
const generateWebPSourceHTML = (webpSrc) => {
  return webpSrc 
    ? `<source srcset="${sanitizeUrl(webpSrc)}" type="image/webp">` 
    : '';
};

/**
 * Generates picture element HTML with WebP fallback
 * Pure function
 * 
 * @param {string} baseSrc - Original image source
 * @param {string} altText - Alt text for image
 * @param {string|null} webpSrc - WebP source (optional)
 * @returns {string} - HTML for picture element
 */
const generatePictureHTML = (baseSrc, altText, webpSrc = null) => {
  const derivedWebP = deriveWebPSource(baseSrc, webpSrc);
  const webpSourceHTML = generateWebPSourceHTML(derivedWebP);
  
  return `
    <picture>
      ${webpSourceHTML}
      <img src="${sanitizeUrl(baseSrc)}" alt="${escapeHtml(altText)}" loading="lazy">
    </picture>
  `;
};

// ============================================================================
// PURE FUNCTIONS - Block Renderers
// ============================================================================

/**
 * Renders a text block
 * Pure function
 * 
 * @param {Object} block - Text block data
 * @returns {string} - HTML content
 */
const renderTextBlock = (block) => {
  return `<div class="blog-text-block" data-animation="fade-up">${block.content}</div>`;
};

/**
 * Renders an HTML block
 * Pure function
 * 
 * @param {Object} block - HTML block data
 * @returns {string} - HTML content
 */
const renderHtmlBlock = (block) => {
  return `<div class="blog-html-block" data-animation="fade-up">${block.content}</div>`;
};

/**
 * Generates CSS classes for image block
 * Pure function
 * 
 * @param {Object} block - Image block data
 * @returns {Object} - Object with sizeClass and positionClass
 */
const generateImageClasses = (block) => ({
  sizeClass: block.size ? `image-size-${block.size}` : 'image-size-medium',
  positionClass: block.position ? `image-position-${block.position}` : 'image-position-center'
});

/**
 * Generates caption HTML
 * Pure function
 * 
 * @param {string|null} caption - Caption text
 * @returns {string} - HTML for caption
 */
const generateCaptionHTML = (caption) => {
  return caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '';
};

/**
 * Renders an image block
 * Pure function
 * 
 * @param {Object} block - Image block data
 * @returns {string} - HTML content
 */
const renderImageBlock = (block) => {
  const { sizeClass, positionClass } = generateImageClasses(block);
  const captionHTML = generateCaptionHTML(block.caption);
  const altText = block.alt || '';
  const pictureHTML = generatePictureHTML(block.src, altText, block.webpSrc);
  
  return `
    <figure class="blog-image-block ${sizeClass} ${positionClass}" data-animation="fade-in">
      ${pictureHTML}
      ${captionHTML}
    </figure>
  `;
};

/**
 * Renders a single grid item
 * Pure function
 * 
 * @param {Object} image - Image data
 * @param {number} index - Image index for animation delay
 * @returns {string} - HTML for grid item
 */
const renderGridItem = (image, index) => {
  const captionHTML = generateCaptionHTML(image.caption);
  const altText = image.alt || '';
  const pictureHTML = generatePictureHTML(image.src, altText, image.webpSrc);
  const animationDelay = index * 150;
  
  return `
    <figure class="grid-item" data-animation="fade-in" data-animation-delay="${animationDelay}">
      ${pictureHTML}
      ${captionHTML}
    </figure>
  `;
};

/**
 * Renders an image grid block
 * Pure function
 * 
 * @param {Object} block - Image grid block data
 * @returns {string} - HTML content
 */
const renderImageGridBlock = (block) => {
  if (!block.images || !block.images.length) {
    return '';
  }

  const layoutClass = block.layout ? `grid-layout-${block.layout}` : 'grid-layout-2-column';
  const imagesHTML = block.images.map(renderGridItem).join('');

  return `
    <div class="blog-image-grid ${layoutClass}" data-animation="fade-in">
      ${imagesHTML}
    </div>
  `;
};

/**
 * Renders a quote block
 * Pure function
 * 
 * @param {Object} block - Quote block data
 * @returns {string} - HTML content
 */
const renderQuoteBlock = (block) => {
  const attributionHTML = block.attribution 
    ? `<cite>${escapeHtml(block.attribution)}</cite>` 
    : '';
  
  return `
    <blockquote class="blog-quote-block" data-animation="fade-in">
      <p>${block.content}</p>
      ${attributionHTML}
    </blockquote>
  `;
};

/**
 * Renders a code block
 * Pure function
 * 
 * @param {Object} block - Code block data
 * @returns {string} - HTML content
 */
const renderCodeBlock = (block) => {
  const language = block.language || 'javascript';
  const escapedCode = escapeHtml(block.content);
  
  return `
    <div class="blog-code-block" data-animation="fade-in">
      <pre><code class="language-${escapeHtml(language)}">${escapedCode}</code></pre>
    </div>
  `;
};

/**
 * Renders an embedded video
 * Pure function
 * 
 * @param {string} embedUrl - Video embed URL
 * @param {string|null} caption - Video caption
 * @returns {string} - HTML content
 */
const renderEmbeddedVideo = (embedUrl, caption) => {
  const captionHTML = caption ? `<p class="video-caption">${escapeHtml(caption)}</p>` : '';
  
  return `
    <div class="blog-video-block" data-animation="fade-in">
      <div class="video-container">
        <iframe src="${sanitizeUrl(embedUrl)}" frameborder="0" allowfullscreen></iframe>
      </div>
      ${captionHTML}
    </div>
  `;
};

/**
 * Renders a native video
 * Pure function
 * 
 * @param {string} videoUrl - Video URL
 * @param {string|null} poster - Poster image URL
 * @param {string} videoType - Video MIME type
 * @param {string|null} caption - Video caption
 * @returns {string} - HTML content
 */
const renderNativeVideo = (videoUrl, poster, videoType, caption) => {
  const posterAttr = poster ? `poster="${sanitizeUrl(poster)}"` : '';
  const captionHTML = caption ? `<p class="video-caption">${escapeHtml(caption)}</p>` : '';
  
  return `
    <div class="blog-video-block" data-animation="fade-in">
      <video controls ${posterAttr}>
        <source src="${sanitizeUrl(videoUrl)}" type="${escapeHtml(videoType || 'video/mp4')}">
        Your browser does not support the video tag.
      </video>
      ${captionHTML}
    </div>
  `;
};

/**
 * Renders a video block
 * Pure function
 * 
 * @param {Object} block - Video block data
 * @returns {string} - HTML content
 */
const renderVideoBlock = (block) => {
  if (block.embedUrl) {
    return renderEmbeddedVideo(block.embedUrl, block.caption);
  } else if (block.videoUrl) {
    return renderNativeVideo(block.videoUrl, block.poster, block.videoType, block.caption);
  }
  
  return '';
};

// ============================================================================
// PURE FUNCTIONS - Block Parsing
// ============================================================================

/**
 * Block renderer registry
 * Pure object (frozen)
 */
const BLOCK_RENDERERS = Object.freeze({
  'text': renderTextBlock,
  'html': renderHtmlBlock,
  'image': renderImageBlock,
  'image-grid': renderImageGridBlock,
  'quote': renderQuoteBlock,
  'code': renderCodeBlock,
  'video': renderVideoBlock
});

/**
 * Renders a single block
 * Pure function
 * 
 * @param {Object} block - Block data
 * @returns {string} - HTML content
 */
const renderBlock = (block) => {
  const renderer = BLOCK_RENDERERS[block.type];
  
  if (renderer) {
    return renderer(block);
  } else {
    console.warn(`Unknown block type: ${block.type}`);
    return '';
  }
};

/**
 * Parses and renders content blocks
 * Pure function
 * 
 * @param {Array<Object>} blocks - Array of content blocks
 * @returns {string} - HTML content
 */
const parseBlocks = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) {
    return '<p>No content available</p>';
  }

  return blocks.map(renderBlock).join('');
};

/**
 * Parses legacy content format
 * Pure function
 * 
 * @param {string} content - HTML content string
 * @returns {Array<Object>} - Array of content blocks
 */
const parseLegacyContent = (content) => {
  return [
    {
      type: 'text',
      content: content
    }
  ];
};

// ============================================================================
// CLASS WRAPPER (For Backward Compatibility)
// ============================================================================

/**
 * BlogContentParser class
 * Wrapper around pure functions for backward compatibility
 */
class BlogContentParser {
  constructor() {
    // No state needed - all functions are pure
  }

  parseBlocks(blocks) {
    return parseBlocks(blocks);
  }

  parseLegacyContent(content) {
    return parseLegacyContent(content);
  }

  // Legacy method - delegates to utility
  escapeHtml(html) {
    return escapeHtml(html);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export class for backward compatibility
window.BlogContentParser = BlogContentParser;

// Export pure functions for direct use
export {
  parseBlocks,
  parseLegacyContent,
  renderBlock,
  renderTextBlock,
  renderHtmlBlock,
  renderImageBlock,
  renderImageGridBlock,
  renderQuoteBlock,
  renderCodeBlock,
  renderVideoBlock,
  BLOCK_RENDERERS
};

