/**
 * DOM Utilities for HelloEmily.dev
 * Pure and impure functions for DOM manipulation
 * Follows functional programming principles where possible
 * 
 * @module dom-utils
 */

import { escapeHtml, escapeHtmlAttribute } from './security.js';

/**
 * Safely queries a DOM element
 * Returns null instead of throwing on invalid selector
 * 
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} - Found element or null
 * 
 * @example
 * const container = safeQuerySelector('.blog-grid');
 */
export const safeQuerySelector = (selector, parent = document) => {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return null;
  }
};

/**
 * Safely queries all matching DOM elements
 * Returns empty array instead of throwing on invalid selector
 * 
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Array<Element>} - Array of found elements
 */
export const safeQuerySelectorAll = (selector, parent = document) => {
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch (error) {
    console.error(`Invalid selector: ${selector}`, error);
    return [];
  }
};

/**
 * Creates an element with attributes and children
 * Pure function that returns element configuration
 * 
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Element attributes
 * @param {Array|string} children - Child elements or text
 * @returns {HTMLElement} - Created element
 * 
 * @example
 * const div = createElement('div', { class: 'container' }, 'Hello World');
 */
export const createElement = (tag, attrs = {}, children = []) => {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        element.style[styleKey] = styleValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Event listeners
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach((child) => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    } else if (child != null) {
      element.appendChild(document.createTextNode(String(child)));
    }
  });
  
  return element;
};

/**
 * Creates a safe HTML element with automatic escaping
 * 
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Element attributes (will be escaped)
 * @param {...string} children - Child text content (will be escaped)
 * @returns {HTMLElement} - Created element
 * 
 * @example
 * const div = createSafeElement('div', { class: 'user-content' }, userInput);
 */
export const createSafeElement = (tag, attrs = {}, ...children) => {
  const element = document.createElement(tag);
  
  // Set attributes with escaping
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else {
      element.setAttribute(key, escapeHtmlAttribute(value));
    }
  });
  
  // Add children with escaping
  children.forEach((child) => {
    if (typeof child === 'string') {
      element.textContent += child; // textContent automatically escapes
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });
  
  return element;
};

/**
 * Removes all children from an element
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} element - Element to clear
 */
export const clearElement = (element) => {
  if (element instanceof HTMLElement) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
};

/**
 * Appends multiple children to an element
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} parent - Parent element
 * @param {Array<HTMLElement|string>} children - Children to append
 */
export const appendChildren = (parent, children) => {
  if (!(parent instanceof HTMLElement)) return;
  
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach((child) => {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      parent.appendChild(child);
    }
  });
};

/**
 * Replaces element content with new children
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} element - Element to update
 * @param {Array<HTMLElement|string>} children - New children
 */
export const replaceChildren = (element, children) => {
  clearElement(element);
  appendChildren(element, children);
};

/**
 * Adds CSS classes to an element
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} element - Element to update
 * @param {...string} classNames - Class names to add
 */
export const addClass = (element, ...classNames) => {
  if (element instanceof HTMLElement) {
    element.classList.add(...classNames);
  }
};

/**
 * Removes CSS classes from an element
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} element - Element to update
 * @param {...string} classNames - Class names to remove
 */
export const removeClass = (element, ...classNames) => {
  if (element instanceof HTMLElement) {
    element.classList.remove(...classNames);
  }
};

/**
 * Toggles CSS classes on an element
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} element - Element to update
 * @param {...string} classNames - Class names to toggle
 */
export const toggleClass = (element, ...classNames) => {
  if (element instanceof HTMLElement) {
    classNames.forEach(className => element.classList.toggle(className));
  }
};

/**
 * Checks if element has a CSS class
 * Pure function
 * 
 * @param {HTMLElement} element - Element to check
 * @param {string} className - Class name to check
 * @returns {boolean} - True if element has class
 */
export const hasClass = (element, className) => {
  return element instanceof HTMLElement && element.classList.contains(className);
};

/**
 * Sets multiple attributes on an element
 * Side effect: DOM manipulation
 * 
 * @param {HTMLElement} element - Element to update
 * @param {Object} attrs - Attributes to set
 */
export const setAttributes = (element, attrs) => {
  if (!(element instanceof HTMLElement)) return;
  
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

/**
 * Gets element's offset position relative to document
 * Pure function
 * 
 * @param {HTMLElement} element - Element to measure
 * @returns {Object} - {top, left, width, height}
 */
export const getOffset = (element) => {
  if (!(element instanceof HTMLElement)) {
    return { top: 0, left: 0, width: 0, height: 0 };
  }
  
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
    width: rect.width,
    height: rect.height
  };
};

/**
 * Checks if element is in viewport
 * Pure function
 * 
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Percentage of element that must be visible (0-1)
 * @returns {boolean} - True if in viewport
 */
export const isInViewport = (element, threshold = 0) => {
  if (!(element instanceof HTMLElement)) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
  
  if (threshold === 0) {
    return vertInView && horInView;
  }
  
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
  const visibleArea = visibleHeight * visibleWidth;
  const totalArea = rect.height * rect.width;
  
  return (visibleArea / totalArea) >= threshold;
};

/**
 * Waits for DOM to be ready
 * Returns a promise that resolves when DOM is ready
 * 
 * @returns {Promise} - Promise that resolves when DOM is ready
 */
export const domReady = () => {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      resolve();
    }
  });
};

/**
 * Delegates event handling to a parent element
 * Returns a cleanup function
 * 
 * @param {HTMLElement} parent - Parent element
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {string} selector - Child selector
 * @param {Function} handler - Event handler
 * @returns {Function} - Cleanup function
 * 
 * @example
 * const cleanup = delegate(document.body, 'click', '.btn', (e) => {
 *   console.log('Button clicked:', e.target);
 * });
 * // Later: cleanup();
 */
export const delegate = (parent, eventType, selector, handler) => {
  const listener = (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event);
    }
  };
  
  parent.addEventListener(eventType, listener);
  
  // Return cleanup function
  return () => parent.removeEventListener(eventType, listener);
};

// Export all utilities as default
export default {
  safeQuerySelector,
  safeQuerySelectorAll,
  createElement,
  createSafeElement,
  clearElement,
  appendChildren,
  replaceChildren,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setAttributes,
  getOffset,
  isInViewport,
  domReady,
  delegate
};

