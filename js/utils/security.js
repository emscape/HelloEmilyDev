/**
 * XSS Protection Utilities for HelloEmily.dev
 * Follows functional programming principles with comprehensive security measures
 * 
 * @module security
 */

// HTML entity mapping for consistent escaping
const HTML_ENTITIES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
});

/**
 * Pure function to escape HTML special characters
 * Avoids DOM manipulation for better performance and SSR compatibility
 * 
 * @param {unknown} input - Input to escape
 * @returns {string} - Escaped text
 * 
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export const escapeHtml = (input) => {
  // Type guard and validation
  if (input == null) return '';
  
  const text = String(input);
  
  // Use regex replacement instead of DOM manipulation
  return text.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match]);
};

/**
 * Escapes HTML attributes with additional security measures
 * More restrictive than escapeHtml for use in HTML attributes
 * 
 * @param {unknown} input - Attribute value to escape
 * @returns {string} - Escaped attribute value
 * 
 * @example
 * escapeHtmlAttribute('value with spaces')
 * // Returns: 'value&#32;with&#32;spaces'
 */
export const escapeHtmlAttribute = (input) => {
  if (input == null) return '';
  
  const text = String(input);
  
  // More restrictive escaping for attributes
  return text
    .replace(/[&<>"'`=\/\s]/g, (match) => {
      if (match === ' ') return '&#32;';
      return HTML_ENTITIES[match] || match;
    });
};

/**
 * Whitelist of safe HTML tags for portfolio content
 */
const ALLOWED_TAGS = Object.freeze([
  'p', 'br', 'strong', 'em', 'i', 'b', 'u', 
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th'
]);

/**
 * Whitelist of safe HTML attributes
 */
const ALLOWED_ATTRIBUTES = Object.freeze([
  'class', 'id', 'title', 'href', 'src', 'alt', 'loading'
]);

/**
 * Simple HTML sanitizer using whitelist approach
 * For production with user-generated content, consider using DOMPurify
 * 
 * @param {unknown} input - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 * 
 * @example
 * sanitizeHtml('<p>Safe content</p><script>alert("xss")</script>')
 * // Returns: '&lt;p&gt;Safe content&lt;/p&gt;'
 */
export const sanitizeHtml = (input) => {
  if (input == null) return '';
  
  const html = String(input);
  
  // Strip all script tags and their content
  const noScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous protocols from any remaining content
  const noDangerousProtocols = noScripts.replace(
    /(?:javascript|vbscript|data|about):/gi,
    ''
  );
  
  // Remove event handlers (onclick, onerror, etc.)
  const noEventHandlers = noDangerousProtocols.replace(
    /\s*on\w+\s*=\s*["'][^"']*["']/gi,
    ''
  );
  
  // For basic sanitization, escape everything
  // In production with complex HTML, implement proper tag/attribute whitelisting
  return escapeHtml(noEventHandlers);
};

/**
 * Validates and sanitizes URL for safe use in href attributes
 * Only allows safe protocols and relative URLs
 * Returns the URL unchanged if safe, or 'about:blank' if dangerous
 *
 * @param {unknown} input - URL to validate
 * @returns {string} - Safe URL or 'about:blank'
 *
 * @example
 * sanitizeUrl('https://example.com')
 * // Returns: 'https://example.com'
 *
 * sanitizeUrl('javascript:alert("xss")')
 * // Returns: 'about:blank'
 */
export const sanitizeUrl = (input) => {
  if (input == null) return '';

  const url = String(input).trim();

  if (url === '') return '';

  // Decode URL to catch encoded attacks
  let decodedUrl = url;
  try {
    decodedUrl = decodeURIComponent(url);
  } catch (e) {
    // If decoding fails, use original
  }

  // Check for dangerous protocols (case-insensitive)
  const dangerousProtocolRegex = /^[\s]*(?:javascript|data|vbscript|file):/i;
  if (dangerousProtocolRegex.test(decodedUrl)) {
    return 'about:blank';
  }

  // Allow safe protocols and relative URLs
  const safeProtocolRegex = /^(?:https?|mailto|tel):/i;
  const relativeUrlRegex = /^[\.\/]|^#|^[^:]+$/;

  if (safeProtocolRegex.test(url) || relativeUrlRegex.test(url)) {
    return url; // Return unchanged - escaping happens when inserted into HTML
  }

  return 'about:blank';
};

/**
 * Higher-order function for creating safe template literals
 * Automatically escapes all interpolated values
 * 
 * @param {Array<string>} strings - Template literal strings
 * @param {...unknown} values - Template literal values
 * @returns {string} - Safe HTML string
 * 
 * @example
 * const userInput = '<script>alert("xss")</script>';
 * const html = safeHtml`<div>${userInput}</div>`;
 * // Returns: '<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>'
 */
export const safeHtml = (strings, ...values) => {
  return strings.reduce((result, string, i) => {
    const value = values[i] != null ? escapeHtml(values[i]) : '';
    return result + string + value;
  }, '');
};

/**
 * Creates a safe HTML builder function with automatic escaping
 * 
 * @param {string} tag - HTML tag name
 * @returns {Function} - Function that creates safe HTML elements
 * 
 * @example
 * const div = createSafeElement('div');
 * const html = div({ class: 'container' }, 'User content: ', userInput);
 */
export const createSafeElement = (tag) => {
  return (attrs = {}, ...children) => {
    const attrString = Object.entries(attrs)
      .map(([key, value]) => `${key}="${escapeHtmlAttribute(value)}"`)
      .join(' ');
    
    const childrenString = children
      .map(child => typeof child === 'string' ? escapeHtml(child) : child)
      .join('');
    
    return `<${tag}${attrString ? ' ' + attrString : ''}>${childrenString}</${tag}>`;
  };
};

/**
 * Content Security Policy helpers
 */
export const cspHelpers = Object.freeze({
  /**
   * Generates a random nonce for CSP
   * @returns {string} - Random nonce
   */
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Creates CSP header value for portfolio site
   * @param {string} nonce - Nonce for inline scripts
   * @returns {string} - CSP header value
   */
  getCSPHeader: (nonce = '') => {
    const nonceDirective = nonce ? `'nonce-${nonce}'` : '';
    return [
      "default-src 'self'",
      `script-src 'self' ${nonceDirective} 'strict-dynamic' https://cdnjs.cloudflare.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
});

/**
 * Validates that a string contains only safe characters
 * Useful for IDs, class names, etc.
 * 
 * @param {string} input - String to validate
 * @returns {boolean} - True if safe
 */
export const isSafeIdentifier = (input) => {
  if (typeof input !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(input);
};

/**
 * Sanitizes a string for use as a CSS class name
 * 
 * @param {unknown} input - Input to sanitize
 * @returns {string} - Safe class name
 */
export const sanitizeClassName = (input) => {
  if (input == null) return '';
  return String(input)
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
};

// Export all utilities as a namespace for convenience
export default {
  escapeHtml,
  escapeHtmlAttribute,
  sanitizeHtml,
  sanitizeUrl,
  safeHtml,
  createSafeElement,
  cspHelpers,
  isSafeIdentifier,
  sanitizeClassName
};

