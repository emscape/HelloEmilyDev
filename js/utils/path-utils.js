/**
 * Path Utilities for HelloEmily.dev
 * Pure functions for path manipulation and normalization
 * Follows functional programming principles
 * 
 * @module path-utils
 */

/**
 * Checks if a path is an absolute URL
 * Pure function
 * 
 * @param {string} path - Path to check
 * @returns {boolean} - True if absolute URL
 * 
 * @example
 * isAbsoluteUrl('https://example.com/image.jpg')
 * // Returns: true
 * 
 * isAbsoluteUrl('/images/photo.jpg')
 * // Returns: false
 */
export const isAbsoluteUrl = (path) => {
  if (typeof path !== 'string') return false;
  return /^(https?:)?\/\//i.test(path);
};

/**
 * Checks if a path is root-relative (starts with /)
 * Pure function
 * 
 * @param {string} path - Path to check
 * @returns {boolean} - True if root-relative
 */
export const isRootRelative = (path) => {
  if (typeof path !== 'string') return false;
  return path.startsWith('/') && !path.startsWith('//');
};

/**
 * Converts a path to root-relative format
 * Pure function
 * 
 * @param {string} path - Path to normalize
 * @returns {string} - Root-relative path
 * 
 * @example
 * makePathRootRelative('./images/photo.jpg')
 * // Returns: '/images/photo.jpg'
 * 
 * makePathRootRelative('https://example.com/image.jpg')
 * // Returns: 'https://example.com/image.jpg' (unchanged)
 */
export const makePathRootRelative = (path) => {
  if (!path || typeof path !== 'string') return '';
  
  // If it's an absolute URL, return as is
  if (isAbsoluteUrl(path)) {
    return path;
  }
  
  // If already root-relative, return as is
  if (isRootRelative(path)) {
    return path;
  }
  
  // Remove leading slashes and "./"
  const cleanPath = path.replace(/^\/+/, '').replace(/^\.\//, '');
  
  // Add a leading slash to make it root-relative
  return '/' + cleanPath;
};

/**
 * Removes duplicate slashes from a URL or path
 * Preserves protocol slashes (http://)
 * Pure function
 * 
 * @param {string} url - URL to clean
 * @returns {string} - Cleaned URL
 * 
 * @example
 * removeDuplicateSlashes('https://example.com//path///to//file.jpg')
 * // Returns: 'https://example.com/path/to/file.jpg'
 */
export const removeDuplicateSlashes = (url) => {
  if (typeof url !== 'string') return '';
  
  // Replace multiple slashes with single slash, but preserve protocol slashes
  return url.replace(/([^:]\/)\/+/g, '$1');
};

/**
 * Joins path segments with proper slash handling
 * Pure function
 * 
 * @param {...string} segments - Path segments to join
 * @returns {string} - Joined path
 * 
 * @example
 * joinPaths('/images', 'blog', 'photo.jpg')
 * // Returns: '/images/blog/photo.jpg'
 */
export const joinPaths = (...segments) => {
  if (segments.length === 0) return '';
  
  const joined = segments
    .filter(segment => segment && typeof segment === 'string')
    .map((segment, index) => {
      // Remove leading slash from all but first segment
      if (index > 0) {
        segment = segment.replace(/^\/+/, '');
      }
      // Remove trailing slash from all but last segment
      if (index < segments.length - 1) {
        segment = segment.replace(/\/+$/, '');
      }
      return segment;
    })
    .join('/');
  
  return removeDuplicateSlashes(joined);
};

/**
 * Gets the file extension from a path
 * Pure function
 * 
 * @param {string} path - File path
 * @returns {string} - File extension (without dot) or empty string
 * 
 * @example
 * getExtension('/images/photo.jpg')
 * // Returns: 'jpg'
 */
export const getExtension = (path) => {
  if (typeof path !== 'string') return '';
  
  const match = path.match(/\.([^.\/\\]+)$/);
  return match ? match[1].toLowerCase() : '';
};

/**
 * Replaces the file extension
 * Pure function
 * 
 * @param {string} path - File path
 * @param {string} newExtension - New extension (with or without dot)
 * @returns {string} - Path with new extension
 * 
 * @example
 * replaceExtension('/images/photo.jpg', 'webp')
 * // Returns: '/images/photo.webp'
 */
export const replaceExtension = (path, newExtension) => {
  if (typeof path !== 'string') return '';
  if (typeof newExtension !== 'string') return path;
  
  // Remove leading dot from extension if present
  const ext = newExtension.startsWith('.') ? newExtension.slice(1) : newExtension;
  
  // Remove existing extension and add new one
  return path.replace(/\.[^.\/\\]+$/, `.${ext}`);
};

/**
 * Gets the filename from a path (without extension)
 * Pure function
 * 
 * @param {string} path - File path
 * @returns {string} - Filename without extension
 * 
 * @example
 * getFilename('/images/blog/photo.jpg')
 * // Returns: 'photo'
 */
export const getFilename = (path) => {
  if (typeof path !== 'string') return '';
  
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^.]+$/, '');
};

/**
 * Gets the directory path from a file path
 * Pure function
 * 
 * @param {string} path - File path
 * @returns {string} - Directory path
 * 
 * @example
 * getDirectory('/images/blog/photo.jpg')
 * // Returns: '/images/blog'
 */
export const getDirectory = (path) => {
  if (typeof path !== 'string') return '';
  
  const parts = path.split('/');
  parts.pop(); // Remove filename
  return parts.join('/') || '/';
};

/**
 * Converts a relative path to absolute URL
 * Pure function
 * 
 * @param {string} path - Relative path
 * @param {string} baseUrl - Base URL (default: current origin)
 * @returns {string} - Absolute URL
 * 
 * @example
 * toAbsoluteUrl('/images/photo.jpg', 'https://helloemily.dev')
 * // Returns: 'https://helloemily.dev/images/photo.jpg'
 */
export const toAbsoluteUrl = (path, baseUrl = window.location.origin) => {
  if (typeof path !== 'string') return '';
  
  // If already absolute, return as is
  if (isAbsoluteUrl(path)) {
    return path;
  }
  
  // Ensure base URL doesn't end with slash
  const base = baseUrl.replace(/\/+$/, '');
  
  // Ensure path starts with slash
  const normalizedPath = makePathRootRelative(path);
  
  return removeDuplicateSlashes(`${base}${normalizedPath}`);
};

/**
 * Generates a slug from a string (for URLs)
 * Pure function
 * 
 * @param {string} text - Text to slugify
 * @returns {string} - URL-safe slug
 * 
 * @example
 * slugify('Hello World! This is a Test')
 * // Returns: 'hello-world-this-is-a-test'
 */
export const slugify = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Checks if a path points to an image file
 * Pure function
 * 
 * @param {string} path - File path
 * @returns {boolean} - True if image file
 */
export const isImagePath = (path) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const ext = getExtension(path);
  return imageExtensions.includes(ext);
};

/**
 * Generates WebP path from image path
 * Pure function
 * 
 * @param {string} path - Original image path
 * @returns {string} - WebP path or empty string if not an image
 * 
 * @example
 * toWebPPath('/images/photo.jpg')
 * // Returns: '/images/photo.webp'
 */
export const toWebPPath = (path) => {
  if (!isImagePath(path)) return '';
  
  // Don't convert SVG to WebP
  if (getExtension(path) === 'svg') return '';
  
  return replaceExtension(path, 'webp');
};

/**
 * Higher-order function to create a path normalizer with base URL
 * 
 * @param {string} baseUrl - Base URL for normalization
 * @returns {Function} - Path normalizer function
 * 
 * @example
 * const normalize = createPathNormalizer('https://helloemily.dev');
 * normalize('./images/photo.jpg')
 * // Returns: 'https://helloemily.dev/images/photo.jpg'
 */
export const createPathNormalizer = (baseUrl) => {
  return (path) => toAbsoluteUrl(path, baseUrl);
};

// Export all utilities as default
export default {
  isAbsoluteUrl,
  isRootRelative,
  makePathRootRelative,
  removeDuplicateSlashes,
  joinPaths,
  getExtension,
  replaceExtension,
  getFilename,
  getDirectory,
  toAbsoluteUrl,
  slugify,
  isImagePath,
  toWebPPath,
  createPathNormalizer
};

