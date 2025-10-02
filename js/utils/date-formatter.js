/**
 * Date Formatting Utilities for HelloEmily.dev
 * Pure functions for date manipulation and formatting
 * Follows functional programming principles
 * 
 * @module date-formatter
 */

/**
 * Default locale for date formatting
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * Common date format options
 */
export const DateFormats = Object.freeze({
  FULL: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  },
  LONG: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  MEDIUM: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  SHORT: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  },
  MONTH_YEAR: {
    year: 'numeric',
    month: 'long'
  },
  YEAR_ONLY: {
    year: 'numeric'
  }
});

/**
 * Validates if a value is a valid date
 * Pure function
 * 
 * @param {*} value - Value to validate
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (value) => {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  
  return false;
};

/**
 * Safely creates a Date object
 * Pure function that returns null on invalid input
 * For ISO date strings (YYYY-MM-DD), treats them as local dates to avoid timezone issues
 *
 * @param {string|number|Date} input - Date input
 * @returns {Date|null} - Date object or null
 */
export const safeDate = (input) => {
  // Explicitly reject null and undefined
  if (input == null) {
    return null;
  }

  if (input instanceof Date) {
    return isValidDate(input) ? input : null;
  }

  try {
    // Handle ISO date strings (YYYY-MM-DD) specially to avoid timezone issues
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
      const [year, month, day] = input.trim().split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return isValidDate(date) ? date : null;
    }

    // Handle YYYY-MM format for month/year dates
    if (typeof input === 'string' && /^\d{4}-\d{2}$/.test(input.trim())) {
      const [year, month] = input.trim().split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return isValidDate(date) ? date : null;
    }

    const date = new Date(input);
    return isValidDate(date) ? date : null;
  } catch {
    return null;
  }
};

/**
 * Formats a date string to a readable format
 * Pure function with fallback for invalid dates
 * 
 * @param {string|number|Date} dateInput - Date to format
 * @param {string} locale - Locale code (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date or fallback message
 * 
 * @example
 * formatDate('2025-01-15')
 * // Returns: 'January 15, 2025'
 * 
 * formatDate('2025-01-15', 'en-US', DateFormats.SHORT)
 * // Returns: '1/15/2025'
 */
export const formatDate = (
  dateInput,
  locale = DEFAULT_LOCALE,
  options = DateFormats.LONG
) => {
  const date = safeDate(dateInput);

  if (!date) {
    return 'Invalid Date';
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date string to ISO format (YYYY-MM-DD)
 * Pure function
 * 
 * @param {string|number|Date} dateInput - Date to format
 * @returns {string} - ISO date string or empty string
 * 
 * @example
 * toISODate('January 15, 2025')
 * // Returns: '2025-01-15'
 */
export const toISODate = (dateInput) => {
  const date = safeDate(dateInput);
  
  if (!date) {
    return '';
  }
  
  try {
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Formats a date to ISO 8601 format with time
 * Pure function
 * 
 * @param {string|number|Date} dateInput - Date to format
 * @returns {string} - ISO 8601 string or empty string
 * 
 * @example
 * toISODateTime(new Date())
 * // Returns: '2025-01-15T10:30:00.000Z'
 */
export const toISODateTime = (dateInput) => {
  const date = safeDate(dateInput);
  
  if (!date) {
    return '';
  }
  
  try {
    return date.toISOString();
  } catch {
    return '';
  }
};

/**
 * Gets relative time string (e.g., "2 days ago")
 * Pure function
 * 
 * @param {string|number|Date} dateInput - Date to compare
 * @param {string|number|Date} baseDate - Base date for comparison (default: now)
 * @returns {string} - Relative time string
 * 
 * @example
 * getRelativeTime('2025-01-13')
 * // Returns: '2 days ago' (if today is 2025-01-15)
 */
export const getRelativeTime = (dateInput, baseDate = new Date()) => {
  const date = safeDate(dateInput);
  const base = safeDate(baseDate);
  
  if (!date || !base) {
    return 'Invalid date';
  }
  
  const diffMs = base.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  } else if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Parses a date string in YYYY-MM format
 * Commonly used for completion dates
 * 
 * @param {string} dateString - Date string in YYYY-MM format
 * @returns {Date|null} - Date object or null
 * 
 * @example
 * parseYearMonth('2025-01')
 * // Returns: Date object for January 1, 2025
 */
export const parseYearMonth = (dateString) => {
  if (typeof dateString !== 'string') {
    return null;
  }
  
  const match = dateString.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }
  
  const [, year, month] = match;
  return safeDate(`${year}-${month}-01`);
};

/**
 * Formats a YYYY-MM date string to readable format
 * 
 * @param {string} dateString - Date string in YYYY-MM format
 * @param {string} locale - Locale code
 * @returns {string} - Formatted date
 * 
 * @example
 * formatYearMonth('2025-01')
 * // Returns: 'January 2025'
 */
export const formatYearMonth = (dateString, locale = DEFAULT_LOCALE) => {
  const date = parseYearMonth(dateString);

  if (!date) {
    return 'Invalid Date';
  }

  return formatDate(date, locale, DateFormats.MONTH_YEAR);
};

/**
 * Higher-order function to create a date formatter with preset options
 * 
 * @param {string} locale - Locale code
 * @param {Object} options - Format options
 * @returns {Function} - Date formatter function
 * 
 * @example
 * const formatUSDate = createFormatter('en-US', DateFormats.LONG);
 * formatUSDate('2025-01-15')
 * // Returns: 'January 15, 2025'
 */
export const createFormatter = (locale = DEFAULT_LOCALE, options = DateFormats.LONG) => {
  return (dateInput) => formatDate(dateInput, locale, options);
};

/**
 * Compares two dates
 * Pure function
 * Invalid dates are sorted to the end
 *
 * @param {string|number|Date} date1 - First date
 * @param {string|number|Date} date2 - Second date
 * @returns {number} - -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (date1, date2) => {
  const d1 = safeDate(date1);
  const d2 = safeDate(date2);

  // Handle invalid dates - sort them to the end
  if (!d1 && !d2) return 0;
  if (!d1) return 1;  // d1 is invalid, sort it after d2
  if (!d2) return -1; // d2 is invalid, sort it after d1

  const time1 = d1.getTime();
  const time2 = d2.getTime();

  if (time1 < time2) return -1;
  if (time1 > time2) return 1;
  return 0;
};

/**
 * Sorts an array of objects by date property
 * Pure function - returns new array
 * Invalid dates are always sorted to the end regardless of sort order
 *
 * @param {Array} items - Array of objects
 * @param {string} dateKey - Property name containing date
 * @param {boolean} ascending - Sort order (default: false = newest first)
 * @returns {Array} - Sorted array
 *
 * @example
 * const posts = [
 *   { date: '2025-01-10', title: 'Post 1' },
 *   { date: '2025-01-15', title: 'Post 2' }
 * ];
 * sortByDate(posts, 'date')
 * // Returns: [Post 1, Post 2] (newest first)
 */
export const sortByDate = (items, dateKey = 'date', ascending = false) => {
  return [...items].sort((a, b) => {
    const d1 = safeDate(a[dateKey]);
    const d2 = safeDate(b[dateKey]);

    // Invalid dates always go to the end
    if (!d1 && !d2) return 0;
    if (!d1) return 1;  // a is invalid, sort it after b
    if (!d2) return -1; // b is invalid, sort it after a

    // Both dates are valid, compare them
    const time1 = d1.getTime();
    const time2 = d2.getTime();

    if (ascending) {
      return time1 - time2;
    } else {
      return time2 - time1;
    }
  });
};

// Export all utilities as default
export default {
  DateFormats,
  isValidDate,
  safeDate,
  formatDate,
  toISODate,
  toISODateTime,
  getRelativeTime,
  parseYearMonth,
  formatYearMonth,
  createFormatter,
  compareDates,
  sortByDate
};

