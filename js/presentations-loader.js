/**
 * Presentations Loader for HelloEmily.dev - REFACTORED
 * Functional programming approach with pure functions
 * Loads and displays presentations from presentations-data.json
 */

import { escapeHtml, sanitizeUrl } from './utils/security.js';
import { ErrorHandler, ErrorContext } from './utils/error-handler.js';

// ============================================================================
// PURE FUNCTIONS - Page Detection and Limiting
// ============================================================================

/**
 * Checks if current page is the index/main page
 * Pure function
 *
 * @param {string} pathname - Window location pathname
 * @returns {boolean} - True if index page
 */
const isIndexPage = (pathname) => {
  const cleanedPath = pathname.replace(/^\/+|\/+$/g, '');
  return cleanedPath === '' || cleanedPath === 'index.html';
};

/**
 * Limits presentations for display based on page type
 * Pure function
 *
 * @param {Array<Object>} presentations - Sorted presentations
 * @param {string} pathname - Window location pathname
 * @returns {Array<Object>} - Presentations to display
 */
const limitPresentationsForPage = (presentations, pathname) => {
  return isIndexPage(pathname) ? presentations.slice(0, 3) : presentations;
};

// ============================================================================
// PURE FUNCTIONS - Path Adjustment
// ============================================================================

/**
 * Adjusts path based on current page location
 * Pure function
 *
 * @param {string} path - Original path
 * @returns {string} - Adjusted path
 */
const adjustPath = (path) => {
  if (!path) return '';

  // If we're in the /pages/ directory, go up one level
  const isInPagesDirectory = window.location.pathname.includes('/pages/');
  return isInPagesDirectory ? `../${path}` : path;
};

// ============================================================================
// PURE FUNCTIONS - Frontmatter Parsing
// ============================================================================

/**
 * Extracts frontmatter from markdown text
 * Pure function
 *
 * @param {string} mdText - Markdown text with frontmatter
 * @returns {Object} - Object with frontmatter and body
 */
const parseFrontmatterAndBody = (mdText) => {
  const frontmatter = {};
  let body = mdText.trim();

  const frontmatterMatch = mdText.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

  if (frontmatterMatch && frontmatterMatch[1]) {
    const fmText = frontmatterMatch[1].trim();
    body = frontmatterMatch[2] ? frontmatterMatch[2].trim() : '';

    const lines = fmText.split('\n');
    lines.forEach(line => {
      const titleMatch = line.match(/^title:\s*["']?(.*?)["']?\s*$/);
      if (titleMatch) frontmatter.title = titleMatch[1];

      const tagsMatch = line.match(/^tags:\s*\[(.*?)\]\s*$/);
      if (tagsMatch && tagsMatch[1]) {
        frontmatter.tags = tagsMatch[1]
          .split(',')
          .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
          .filter(tag => tag);
      }
    });
  }

  return { frontmatter, body };
};

/**
 * Validates presentation data
 * Pure function
 * 
 * @param {Object} presentation - Presentation object
 * @returns {boolean} - Whether presentation is valid
 */
const isValidPresentation = (presentation) => {
  return !!(
    presentation.longDescriptionMarkdown &&
    presentation.pdfPath &&
    presentation.thumbnail &&
    typeof presentation.longDescriptionMarkdown === 'string'
  );
};

/**
 * Parses presentation data
 * Pure function
 *
 * @param {Object} presentation - Raw presentation object
 * @returns {Object|null} - Parsed presentation or null if invalid
 */
const parsePresentation = (presentation) => {
  if (!isValidPresentation(presentation)) {
    console.error('Skipping invalid presentation:', presentation.title || 'Unknown');
    return null;
  }

  try {
    const parsed = parseFrontmatterAndBody(presentation.longDescriptionMarkdown);

    return {
      title: parsed.frontmatter.title || 'Untitled Presentation',
      descriptionHTML: parsed.body || '<p>Description not available.</p>',
      tags: parsed.frontmatter.tags || [],
      thumbnail: adjustPath(presentation.thumbnail),
      pdfPath: adjustPath(presentation.pdfPath),
      relatedBlogPostUrl: presentation.relatedBlogPostUrl,
      order: presentation.order
    };
  } catch (error) {
    console.error(`Error parsing presentation (${presentation.title || 'N/A'}):`, error);
    return null;
  }
};

/**
 * Parses all presentations
 * Pure function
 * 
 * @param {Array<Object>} presentations - Array of raw presentations
 * @returns {Array<Object>} - Array of parsed presentations (sorted by order field)
 */
const parsePresentations = (presentations) => {
  return presentations
    .map(parsePresentation)
    .filter(p => p !== null)
    .sort((a, b) => {
      // Sort by order field if present, otherwise maintain insertion order
      const aOrder = a.order !== undefined ? a.order : Infinity;
      const bOrder = b.order !== undefined ? b.order : Infinity;
      return aOrder - bOrder;
    });
};

// ============================================================================
// PURE FUNCTIONS - HTML Generation
// ============================================================================

/**
 * Generates tags HTML
 * Pure function
 * 
 * @param {Array<string>} tags - Array of tag strings
 * @returns {string} - HTML for tags
 */
const generateTagsHTML = (tags) => {
  if (!tags || !tags.length) return '';

  return tags
    .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('');
};

/**
 * Generates PDF link HTML
 * Pure function
 * 
 * @param {string} pdfPath - PDF file path
 * @returns {string} - HTML for PDF link
 */
const generatePDFLinkHTML = (pdfPath) => {
  return `
    <a href="${sanitizeUrl(pdfPath)}" 
       class="presentation-link" 
       target="_blank" 
       rel="noopener noreferrer">
      View/Download PDF
    </a>
  `;
};

/**
 * Generates blog post link HTML
 * Pure function
 * 
 * @param {string|null} blogPostUrl - Blog post URL
 * @returns {string} - HTML for blog post link
 */
const generateBlogPostLinkHTML = (blogPostUrl) => {
  if (!blogPostUrl || blogPostUrl.trim() === '') return '';

  return `
    <a href="${sanitizeUrl(blogPostUrl)}" 
       class="btn blog-post-btn" 
       target="_blank" 
       rel="noopener noreferrer">
      Read Blog Post
    </a>
  `;
};

/**
 * Generates presentation content HTML
 * Pure function
 * 
 * @param {Object} presentation - Presentation object
 * @returns {string} - HTML for presentation content
 */
const generatePresentationContentHTML = (presentation) => {
  const tagsHTML = generateTagsHTML(presentation.tags);
  const pdfLinkHTML = generatePDFLinkHTML(presentation.pdfPath);
  const blogPostLinkHTML = generateBlogPostLinkHTML(presentation.relatedBlogPostUrl);

  return `
    <div class="presentation-item-content">
      <h3>${escapeHtml(presentation.title)}</h3>
      <div class="presentation-description">
        ${presentation.descriptionHTML}
      </div>
      ${tagsHTML ? `<div class="presentation-tags">${tagsHTML}</div>` : ''}
      ${pdfLinkHTML}
      ${blogPostLinkHTML}
    </div>
  `;
};

/**
 * Generates thumbnail HTML
 * Pure function
 * 
 * @param {string} thumbnail - Thumbnail URL
 * @param {string} title - Presentation title
 * @returns {string} - HTML for thumbnail
 */
const generateThumbnailHTML = (thumbnail, title) => {
  return `
    <img src="${sanitizeUrl(thumbnail)}" 
         alt="${escapeHtml(`Thumbnail for ${title}`)}" 
         class="presentation-thumbnail" 
         loading="lazy">
  `;
};

/**
 * Generates complete presentation item HTML
 * Pure function
 * 
 * @param {Object} presentation - Presentation object
 * @returns {string} - HTML for presentation item
 */
const generatePresentationItemHTML = (presentation) => {
  const thumbnailHTML = generateThumbnailHTML(presentation.thumbnail, presentation.title);
  const contentHTML = generatePresentationContentHTML(presentation);

  return `
    <div class="presentation-item">
      ${thumbnailHTML}
      ${contentHTML}
    </div>
  `;
};

// ============================================================================
// IMPURE FUNCTIONS - Side Effects (DOM Manipulation)
// ============================================================================

/**
 * Creates a presentation item DOM element
 * Impure function - DOM creation
 * 
 * @param {Object} presentation - Presentation object
 * @returns {HTMLElement} - Presentation item element
 */
const createPresentationItem = (presentation) => {
  const div = document.createElement('div');
  div.innerHTML = generatePresentationItemHTML(presentation);
  return div.firstElementChild;
};

/**
 * Renders presentations to container
 * Impure function - DOM manipulation
 * 
 * @param {HTMLElement} container - Container element
 * @param {Array<Object>} presentations - Array of presentation objects
 */
const renderPresentations = (container, presentations) => {
  if (presentations.length === 0) {
    container.innerHTML = '<p>No presentations found or failed to load all presentations.</p>';
    return;
  }

  container.innerHTML = '';

  presentations.forEach(presentation => {
    const presentationItem = createPresentationItem(presentation);
    container.appendChild(presentationItem);
  });
};

/**
 * Fetches presentation data from JSON
 * Impure function - Network I/O
 *
 * @returns {Promise<Array<Object>>} - Promise resolving to presentations array
 */
const fetchPresentationData = async () => {
  const dataPath = adjustPath('presentations/presentations-data.json');
  const response = await fetch(dataPath);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Presentation data is not an array');
  }

  return data;
};

/**
 * Loads and displays presentations
 * Impure function - Orchestration
 */
const loadPresentations = async () => {
  const presentationsList = document.getElementById('presentations-list');

  if (!presentationsList) {
    console.error('Error: Element with ID "presentations-list" not found.');
    return;
  }

  const handleError = ErrorHandler.createBoundary(presentationsList, ErrorContext.FETCH);

  try {
    // Fetch data
    const data = await fetchPresentationData();

    // Parse presentations
    const validPresentations = parsePresentations(data);

    // Limit presentations based on page type
    const limitedPresentations = limitPresentationsForPage(validPresentations, window.location.pathname);

    // Render presentations
    renderPresentations(presentationsList, limitedPresentations);

  } catch (error) {
    ErrorHandler.log(error, ErrorContext.FETCH);
    handleError(error, 'Unable to load presentations. Please try again later.');
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', loadPresentations);

// ============================================================================
// EXPORTS
// ============================================================================

export {
  isIndexPage,
  limitPresentationsForPage,
  parseFrontmatterAndBody,
  isValidPresentation,
  parsePresentation,
  parsePresentations,
  generateTagsHTML,
  generatePDFLinkHTML,
  generateBlogPostLinkHTML,
  generatePresentationContentHTML,
  generateThumbnailHTML,
  generatePresentationItemHTML,
  createPresentationItem,
  renderPresentations,
  loadPresentations
};

