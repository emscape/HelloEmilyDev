/**
 * Blog Post Validation Utilities (CommonJS version for Node.js scripts)
 * Ensures blog posts have valid JSON and required fields
 */

/**
 * Validates a blog post JSON structure
 * @param {Object} postData - The parsed blog post data
 * @param {string} postId - The post ID for error reporting
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateBlogPost = (postData, postId) => {
  const errors = [];
  
  // Required fields
  const requiredFields = ['id', 'title', 'author', 'date', 'content'];
  
  for (const field of requiredFields) {
    if (!postData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate specific field formats
  if (postData.id && postData.id !== postId) {
    errors.push(`Post ID mismatch: expected "${postId}", got "${postData.id}"`);
  }
  
  if (postData.date && !isValidDate(postData.date)) {
    errors.push(`Invalid date format: ${postData.date}. Expected YYYY-MM-DD`);
  }
  
  if (postData.title && hasInvalidCharacters(postData.title)) {
    errors.push(`Title contains invalid characters that may break HTML: ${postData.title}`);
  }
  
  if (postData.tags && !Array.isArray(postData.tags)) {
    errors.push(`Tags must be an array, got: ${typeof postData.tags}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates JSON syntax by attempting to parse
 * @param {string} jsonString - The JSON string to validate
 * @returns {Object} - { isValid: boolean, error: string|null, data: Object|null }
 */
const validateJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    return { isValid: true, error: null, data };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.message,
      data: null 
    };
  }
};

/**
 * Checks if a date string is in valid YYYY-MM-DD format
 * @param {string} dateString - Date to validate
 * @returns {boolean}
 */
const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Checks for characters that could break HTML when unescaped
 * @param {string} text - Text to check
 * @returns {boolean}
 */
const hasInvalidCharacters = (text) => {
  // Check for smart quotes and curly apostrophes (Unicode characters that break JSON/HTML)
  // U+201C (") U+201D (") U+2018 (') U+2019 (')
  const smartQuotes = /[\u201C\u201D\u2018\u2019]/;

  // Check for unescaped HTML entities (but allow common punctuation)
  const unescapedEntities = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/;

  return smartQuotes.test(text) || unescapedEntities.test(text);
};

/**
 * Sanitizes title for safe HTML usage
 * @param {string} title - Title to sanitize
 * @returns {string} - Sanitized title
 */
const sanitizeTitle = (title) => {
  return title
    // Replace smart quotes with regular quotes (Unicode)
    .replace(/[\u201C\u201D]/g, '"')  // " and "
    // Replace smart apostrophes with regular apostrophes (Unicode)
    .replace(/[\u2018\u2019]/g, "'")  // ' and '
    // Escape unescaped ampersands
    .replace(/&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
};

module.exports = {
  validateBlogPost,
  validateJSON,
  sanitizeTitle,
  isValidDate,
  hasInvalidCharacters
};
