/**
 * Centralized Error Handler for HelloEmily.dev
 * Provides consistent error handling, logging, and user feedback
 * Follows functional programming principles
 * 
 * @module error-handler
 */

import { escapeHtml } from './security.js';

/**
 * Error severity levels
 */
export const ErrorSeverity = Object.freeze({
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
});

/**
 * Error context types for categorization
 */
export const ErrorContext = Object.freeze({
  FETCH: 'fetch',
  RENDER: 'render',
  PARSE: 'parse',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
});

/**
 * Pure function to format error message
 * 
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @returns {string} - Formatted error message
 */
const formatErrorMessage = (error, context) => {
  const timestamp = new Date().toISOString();
  const message = error?.message || 'Unknown error';
  const stack = error?.stack || 'No stack trace available';
  
  return `[${timestamp}] [${context}] ${message}\n${stack}`;
};

/**
 * Pure function to create user-friendly error message
 * 
 * @param {string} context - Error context
 * @returns {string} - User-friendly message
 */
const getUserFriendlyMessage = (context) => {
  const messages = {
    [ErrorContext.FETCH]: 'Unable to load content. Please check your connection and try again.',
    [ErrorContext.RENDER]: 'Unable to display content. Please refresh the page.',
    [ErrorContext.PARSE]: 'Unable to process content. The data may be corrupted.',
    [ErrorContext.VALIDATION]: 'Invalid data provided. Please check your input.',
    [ErrorContext.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };
  
  return messages[context] || messages[ErrorContext.UNKNOWN];
};

/**
 * Logs error to console with formatting
 * Side effect: console.error
 * 
 * @param {Error} error - Error object
 * @param {string} context - Error context
 * @param {string} severity - Error severity
 */
const logError = (error, context, severity) => {
  const formattedMessage = formatErrorMessage(error, context);
  
  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(formattedMessage);
      break;
    case ErrorSeverity.WARNING:
      console.warn(formattedMessage);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
  
  // TODO: Send to error reporting service (e.g., Sentry) for production
  // if (severity === ErrorSeverity.CRITICAL) {
  //   sendToErrorReportingService(error, context);
  // }
};

/**
 * Creates HTML for error display
 * Pure function
 * 
 * @param {string} message - Error message to display
 * @param {boolean} showRetry - Whether to show retry button
 * @returns {string} - HTML string
 */
const createErrorHTML = (message, showRetry = true) => {
  const retryButton = showRetry 
    ? '<button class="btn error-retry-btn" onclick="location.reload()">Retry</button>'
    : '';
  
  return `
    <div class="error-message" role="alert">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>${escapeHtml(message)}</p>
      ${retryButton}
    </div>
  `;
};

/**
 * Displays error message in a container
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement|null} container - Container element
 * @param {string} message - Error message
 * @param {boolean} showRetry - Whether to show retry button
 */
const displayError = (container, message, showRetry = true) => {
  if (!container) {
    console.warn('Cannot display error: container not found');
    return;
  }
  
  container.innerHTML = createErrorHTML(message, showRetry);
  container.classList.add('has-error');
};

/**
 * Main error handler class
 * Provides static methods for error handling
 */
export class ErrorHandler {
  /**
   * Logs an error with context
   * 
   * @param {Error} error - Error object
   * @param {string} context - Error context
   * @param {string} severity - Error severity
   */
  static log(error, context = ErrorContext.UNKNOWN, severity = ErrorSeverity.ERROR) {
    logError(error, context, severity);
  }
  
  /**
   * Displays user-friendly error message
   * 
   * @param {HTMLElement|null} container - Container element
   * @param {string} message - Custom message (optional)
   * @param {boolean} showRetry - Whether to show retry button
   */
  static displayUserError(container, message = null, showRetry = true) {
    const displayMessage = message || getUserFriendlyMessage(ErrorContext.UNKNOWN);
    displayError(container, displayMessage, showRetry);
  }
  
  /**
   * Handles async operation with error handling
   * Higher-order function that wraps async operations
   * 
   * @param {Function} fn - Async function to execute
   * @param {string} context - Error context
   * @param {string} errorMessage - Custom error message
   * @returns {Promise} - Promise that resolves with result or rejects with error
   * 
   * @example
   * await ErrorHandler.handleAsync(
   *   async () => {
   *     const response = await fetch('/api/data');
   *     return response.json();
   *   },
   *   ErrorContext.FETCH,
   *   'Failed to load data'
   * );
   */
  static async handleAsync(fn, context = ErrorContext.UNKNOWN, errorMessage = null) {
    try {
      return await fn();
    } catch (error) {
      this.log(error, context, ErrorSeverity.ERROR);
      const message = errorMessage || getUserFriendlyMessage(context);
      throw new Error(message);
    }
  }
  
  /**
   * Wraps a function with error handling
   * Returns a new function that handles errors
   * 
   * @param {Function} fn - Function to wrap
   * @param {string} context - Error context
   * @returns {Function} - Wrapped function
   * 
   * @example
   * const safeFetch = ErrorHandler.wrap(
   *   async (url) => {
   *     const response = await fetch(url);
   *     return response.json();
   *   },
   *   ErrorContext.FETCH
   * );
   */
  static wrap(fn, context = ErrorContext.UNKNOWN) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.log(error, context, ErrorSeverity.ERROR);
        throw error;
      }
    };
  }
  
  /**
   * Creates an error boundary for a container
   * Returns a function that handles errors for that container
   * 
   * @param {HTMLElement|string} containerOrSelector - Container element or selector
   * @param {string} context - Error context
   * @returns {Function} - Error handler function
   * 
   * @example
   * const handleBlogError = ErrorHandler.createBoundary('.blog-grid', ErrorContext.FETCH);
   * 
   * try {
   *   await loadBlogPosts();
   * } catch (error) {
   *   handleBlogError(error);
   * }
   */
  static createBoundary(containerOrSelector, context = ErrorContext.UNKNOWN) {
    const container = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : containerOrSelector;
    
    return (error, customMessage = null) => {
      this.log(error, context, ErrorSeverity.ERROR);
      const message = customMessage || getUserFriendlyMessage(context);
      displayError(container, message);
    };
  }
}

/**
 * Functional error handling utilities
 */

/**
 * Creates a Result type for functional error handling
 * Inspired by Rust's Result<T, E>
 * 
 * @param {boolean} isOk - Whether the result is successful
 * @param {*} value - Success value or error
 * @returns {Object} - Result object
 */
export const Result = {
  /**
   * Creates a successful result
   * @param {*} value - Success value
   * @returns {Object} - Ok result
   */
  ok: (value) => ({ isOk: true, value, error: null }),
  
  /**
   * Creates an error result
   * @param {Error} error - Error object
   * @returns {Object} - Err result
   */
  err: (error) => ({ isOk: false, value: null, error }),
  
  /**
   * Maps a successful result
   * @param {Object} result - Result object
   * @param {Function} fn - Mapping function
   * @returns {Object} - New result
   */
  map: (result, fn) => {
    return result.isOk ? Result.ok(fn(result.value)) : result;
  },
  
  /**
   * Unwraps a result or returns default value
   * @param {Object} result - Result object
   * @param {*} defaultValue - Default value if error
   * @returns {*} - Unwrapped value
   */
  unwrapOr: (result, defaultValue) => {
    return result.isOk ? result.value : defaultValue;
  }
};

/**
 * Wraps a function to return a Result instead of throwing
 * 
 * @param {Function} fn - Function to wrap
 * @returns {Function} - Function that returns Result
 * 
 * @example
 * const safeParse = toResult(JSON.parse);
 * const result = safeParse('{"valid": "json"}');
 * if (result.isOk) {
 *   console.log(result.value);
 * }
 */
export const toResult = (fn) => {
  return (...args) => {
    try {
      return Result.ok(fn(...args));
    } catch (error) {
      return Result.err(error);
    }
  };
};

// Export default for convenience
export default ErrorHandler;

