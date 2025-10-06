/**
 * Blog Post Validation Utilities
 * Ensures blog posts have valid JSON and required fields
 */

/**
 * Validates a blog post JSON structure
 * @param {Object} postData - The parsed blog post data
 * @param {string} postId - The post ID for error reporting
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateBlogPost = (postData, postId) => {
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
export const validateJSON = (jsonString) => {
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
  // Check for smart quotes, unescaped HTML entities, etc.
  const problematicChars = /[""'']/; // Smart quotes
  const unescapedEntities = /&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-fA-F]+;)/; // Unescaped entities
  
  return problematicChars.test(text) || unescapedEntities.test(text);
};

/**
 * Sanitizes title for safe HTML usage
 * @param {string} title - Title to sanitize
 * @returns {string} - Sanitized title
 */
export const sanitizeTitle = (title) => {
  return title
    .replace(/[""]/g, '"')  // Replace smart quotes with regular quotes
    .replace(/['']/g, "'")  // Replace smart apostrophes
    .replace(/&(?!amp;|lt;|gt;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;'); // Escape unescaped ampersands
};

/**
 * Validates all blog posts in the blog directory
 * @param {string} blogDir - Path to blog directory
 * @returns {Promise<Object>} - { valid: string[], invalid: Object[] }
 */
export const validateAllBlogPosts = async (blogDir = './blog') => {
  const fs = await import('fs');
  const path = await import('path');
  
  const results = { valid: [], invalid: [] };
  
  try {
    const entries = fs.readdirSync(blogDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const postId = entry.name;
        const postDataPath = path.join(blogDir, postId, 'post-data.json');
        
        try {
          const jsonContent = fs.readFileSync(postDataPath, 'utf8');
          const jsonValidation = validateJSON(jsonContent);
          
          if (!jsonValidation.isValid) {
            results.invalid.push({
              postId,
              error: `JSON Parse Error: ${jsonValidation.error}`
            });
            continue;
          }
          
          const postValidation = validateBlogPost(jsonValidation.data, postId);
          
          if (postValidation.isValid) {
            results.valid.push(postId);
          } else {
            results.invalid.push({
              postId,
              errors: postValidation.errors
            });
          }
          
        } catch (error) {
          results.invalid.push({
            postId,
            error: `File Error: ${error.message}`
          });
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to read blog directory: ${error.message}`);
  }
  
  return results;
};
