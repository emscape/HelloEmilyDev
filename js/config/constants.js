/**
 * Configuration Constants for HelloEmily.dev
 * Centralized configuration values and magic numbers
 * 
 * @module constants
 */

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = Object.freeze({
  // Layout and rendering
  LAYOUT_CALCULATION_DELAY: 0,
  DEBOUNCE_DELAY: 250,
  THROTTLE_DELAY: 100,
  
  // Animations
  ANIMATION_DURATION: 800,
  ANIMATION_STAGGER_DELAY: 150,
  TRANSITION_DURATION: 300,
  
  // User interactions
  DOUBLE_CLICK_THRESHOLD: 300,
  LONG_PRESS_DURATION: 500,
  TOOLTIP_DELAY: 500,
  
  // Network
  FETCH_TIMEOUT: 10000,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 300000 // 5 minutes
});

/**
 * DOM selectors
 */
export const SELECTORS = Object.freeze({
  // Blog
  BLOG_GRID: '.blog-grid',
  BLOG_CARD: '.blog-card',
  BLOG_TAG: '.blog-tag',
  BLOG_POST_CONTAINER: '.blog-post-content-container',
  BLOG_FILTER_TAGS: '.blog-filter-tags',
  TAG_FILTER: '.tag-filter',
  
  // Projects
  PROJECT_GRID: '.project-grid',
  PROJECT_CARD: '.project-card',
  PROJECT_TAGS: '.project-tags',
  
  // Presentations
  PRESENTATIONS_LIST: '#presentations-list',
  PRESENTATION_ITEM: '.presentation-item',
  
  // Navigation
  HEADER_PLACEHOLDER: '#header-placeholder',
  NAV_MENU: 'nav ul',
  
  // Common
  CONTAINER: '.container',
  ERROR_MESSAGE: '.error-message',
  LOADING_SPINNER: '.loading-spinner'
});

/**
 * CSS class names
 */
export const CLASSES = Object.freeze({
  // State classes
  ACTIVE: 'active',
  HIDDEN: 'hidden',
  VISIBLE: 'visible',
  LOADING: 'loading',
  ERROR: 'has-error',
  SUCCESS: 'success',
  DISABLED: 'disabled',
  
  // Animation classes
  FADE_IN: 'fade-in',
  FADE_OUT: 'fade-out',
  SLIDE_IN: 'slide-in',
  SLIDE_OUT: 'slide-out',
  
  // Component classes
  FEATURED: 'featured',
  CARD: 'card',
  BUTTON: 'btn',
  TAG: 'tag'
});

/**
 * API endpoints and paths
 */
export const PATHS = Object.freeze({
  // Data files
  BLOG_INDEX: './blog-index.json',
  PROJECTS_DATA: './projects/projects-data.json',
  PRESENTATIONS_DATA: '../presentations/presentations-data.json',
  HEADER: '/header.html',
  
  // Directories
  BLOG_DIR: './blog',
  PROJECTS_DIR: './projects',
  IMAGES_DIR: './images',
  
  // Base URLs
  SITE_BASE_URL: 'https://helloemily.dev',
  CDN_BASE_URL: 'https://cdnjs.cloudflare.com'
});

/**
 * Breakpoints for responsive design (in pixels)
 */
export const BREAKPOINTS = Object.freeze({
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1200
});

/**
 * Image configuration
 */
export const IMAGES = Object.freeze({
  // Supported formats
  FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  
  // Default images
  DEFAULT_FEATURED: '/images/site-preview.jpg',
  DEFAULT_PROFILE: '/images/profile.jpg',
  DEFAULT_PLACEHOLDER: '/images/profile-placeholder.svg',
  
  // Loading strategy
  LAZY_LOADING: true,
  DECODE_ASYNC: true,
  
  // Sizes
  MAX_WIDTH: 1200,
  THUMBNAIL_SIZE: 300
});

/**
 * Pagination and limits
 */
export const LIMITS = Object.freeze({
  // Display limits
  FEATURED_PROJECTS_COUNT: 3,
  BLOG_POSTS_PER_PAGE: 10,
  PROJECTS_PER_PAGE: 12,
  
  // Tag limits
  VISIBLE_TAGS_ROWS: 2,
  MAX_TAGS_DISPLAY: 20,
  
  // Content limits
  SHORT_DESCRIPTION_LENGTH: 150,
  EXCERPT_LENGTH: 200
});

/**
 * Date and time formats
 */
export const DATE_FORMATS = Object.freeze({
  DISPLAY: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  SHORT: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  MONTH_YEAR: {
    year: 'numeric',
    month: 'long'
  },
  ISO: 'YYYY-MM-DD'
});

/**
 * Validation rules
 */
export const VALIDATION = Object.freeze({
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL
  URL_REGEX: /^https?:\/\/.+/,
  
  // Safe identifier (alphanumeric, dash, underscore)
  SAFE_IDENTIFIER_REGEX: /^[a-zA-Z0-9_-]+$/,
  
  // Slug
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // Lengths
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500
});

/**
 * Error messages
 */
export const ERROR_MESSAGES = Object.freeze({
  // Network errors
  FETCH_FAILED: 'Failed to load content. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  NOT_FOUND: 'Content not found.',
  
  // Validation errors
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_URL: 'Please enter a valid URL.',
  REQUIRED_FIELD: 'This field is required.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  PARSE_ERROR: 'Failed to process data.',
  RENDER_ERROR: 'Failed to display content.'
});

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = Object.freeze({
  FORM_SUBMITTED: 'Form submitted successfully!',
  DATA_SAVED: 'Data saved successfully!',
  CONTENT_LOADED: 'Content loaded successfully!'
});

/**
 * Feature flags
 */
export const FEATURES = Object.freeze({
  // Enabled features
  LAZY_LOADING: true,
  ANIMATIONS: true,
  DARK_MODE: false, // TODO: Implement dark mode
  COMMENTS: false, // Disqus disabled
  ANALYTICS: false, // TODO: Add analytics
  
  // Experimental features
  VIRTUAL_SCROLLING: false,
  SERVICE_WORKER: false,
  OFFLINE_MODE: false
});

/**
 * Social media links
 */
export const SOCIAL = Object.freeze({
  GITHUB: 'https://github.com/emscape',
  LINKEDIN: 'https://linkedin.com/in/emily-anderson',
  BLUESKY: 'https://bsky.app',
  FACEBOOK: 'https://facebook.com',
  
  // Share URLs
  SHARE_URLS: {
    BLUESKY: (text, url) => `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`,
    FACEBOOK: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    LINKEDIN: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    TWITTER: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  }
});

/**
 * Scroll behavior configuration
 */
export const SCROLL = Object.freeze({
  SMOOTH_SCROLL: true,
  SCROLL_OFFSET: 80, // Header height
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '0px 0px -100px 0px'
});

/**
 * Local storage keys
 */
export const STORAGE_KEYS = Object.freeze({
  THEME: 'helloemily_theme',
  CACHE_PREFIX: 'helloemily_cache_',
  USER_PREFERENCES: 'helloemily_preferences'
});

// Export all constants as default
export default {
  TIMING,
  SELECTORS,
  CLASSES,
  PATHS,
  BREAKPOINTS,
  IMAGES,
  LIMITS,
  DATE_FORMATS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES,
  SOCIAL,
  SCROLL,
  STORAGE_KEYS
};

