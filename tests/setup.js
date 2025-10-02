/**
 * Vitest Setup File
 * Global test configuration and utilities
 */

import { expect, afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Global test utilities
global.createMockElement = (tag, attributes = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  return element;
};

// Mock window.location
delete window.location;
window.location = {
  pathname: '/',
  href: 'http://localhost/',
  search: '',
  hash: ''
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn()
};

// Custom matchers
expect.extend({
  toBeValidHTML(received) {
    const div = document.createElement('div');
    try {
      div.innerHTML = received;
      return {
        pass: true,
        message: () => 'HTML is valid'
      };
    } catch (error) {
      return {
        pass: false,
        message: () => `HTML is invalid: ${error.message}`
      };
    }
  },
  
  toContainEscapedHTML(received, expected) {
    const escaped = expected
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    const pass = received.includes(escaped);
    
    return {
      pass,
      message: () => pass
        ? `Expected HTML not to contain escaped "${expected}"`
        : `Expected HTML to contain escaped "${expected}"`
    };
  }
});

