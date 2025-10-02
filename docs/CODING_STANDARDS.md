# Coding Standards for HelloEmily.dev

**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Status:** Active

This document defines the coding standards and best practices for the HelloEmily.dev project. All code must adhere to these standards to ensure consistency, maintainability, and security.

---

## Table of Contents

1. [Functional Programming Principles](#functional-programming-principles)
2. [Code Organization](#code-organization)
3. [Security Guidelines](#security-guidelines)
4. [Error Handling](#error-handling)
5. [Testing Requirements](#testing-requirements)
6. [Documentation Standards](#documentation-standards)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility Requirements](#accessibility-requirements)

---

## Functional Programming Principles

### Core Principles

1. **Pure Functions First**
   - Functions should be pure whenever possible
   - No side effects in business logic
   - Deterministic outputs for given inputs

```javascript
// ✅ GOOD: Pure function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ❌ BAD: Impure function with side effects
let formattedDate;
const formatDate = (dateString) => {
  formattedDate = new Date(dateString).toLocaleDateString();
  console.log('Date formatted'); // Side effect
};
```

2. **Immutability**
   - Never mutate data structures
   - Use spread operators, map, filter, reduce
   - Freeze constants with `Object.freeze()`

```javascript
// ✅ GOOD: Immutable operations
const addProject = (projects, newProject) => [...projects, newProject];
const updateProject = (projects, id, updates) =>
  projects.map(p => p.id === id ? { ...p, ...updates } : p);

// ❌ BAD: Mutation
const addProject = (projects, newProject) => {
  projects.push(newProject); // Mutates array
  return projects;
};
```

3. **Function Composition**
   - Build complex operations from simple functions
   - Use higher-order functions
   - Leverage currying and partial application

```javascript
// ✅ GOOD: Function composition
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const processPost = pipe(
  parseMarkdown,
  sanitizeHtml,
  formatContent,
  addMetadata
);

// ❌ BAD: Procedural approach
const processPost = (post) => {
  const parsed = parseMarkdown(post);
  const sanitized = sanitizeHtml(parsed);
  const formatted = formatContent(sanitized);
  return addMetadata(formatted);
};
```

4. **Separate Side Effects**
   - Isolate side effects at boundaries
   - Pure functions for logic, impure for I/O
   - Clear separation between data and effects

```javascript
// ✅ GOOD: Separated concerns
// Pure functions
const formatPostData = (post) => ({ ...post, formattedDate: formatDate(post.date) });
const generatePostHTML = (post) => `<article>${post.content}</article>`;

// Impure function (clearly marked)
const renderPost = (container, html) => {
  container.innerHTML = html; // Side effect
};

// Orchestration
const displayPost = (post) => {
  const formatted = formatPostData(post);
  const html = generatePostHTML(formatted);
  const container = document.querySelector('.post-container');
  renderPost(container, html);
};
```

---

## Code Organization

### File Structure

```
js/
├── config/
│   └── constants.js       # Configuration constants
├── utils/
│   ├── security.js        # Security utilities
│   ├── error-handler.js   # Error handling
│   ├── date-formatter.js  # Date utilities
│   ├── path-utils.js      # Path utilities
│   ├── dom-utils.js       # DOM utilities
│   └── index.js           # Barrel export
├── data/
│   └── api.js             # Data fetching
├── domain/
│   ├── blog.js            # Blog business logic
│   └── projects.js        # Project business logic
└── ui/
    ├── blog-post.js       # Blog post rendering
    └── project-loader.js  # Project rendering
```

### Module Guidelines

1. **One Responsibility Per Module**
   - Each module should have a single, clear purpose
   - Maximum 300 lines per file
   - Break down large modules into smaller ones

2. **Explicit Exports**
   - Use named exports for functions
   - Export default for main module object
   - Provide barrel exports for convenience

```javascript
// ✅ GOOD: Clear exports
export const formatDate = (date) => { /* ... */ };
export const parseDate = (str) => { /* ... */ };

export default {
  formatDate,
  parseDate
};
```

3. **Import Organization**
   - Group imports: external, internal, relative
   - Use absolute imports when possible
   - Avoid circular dependencies

```javascript
// ✅ GOOD: Organized imports
// External dependencies
import { marked } from 'marked';

// Internal utilities
import { escapeHtml } from './utils/security.js';
import { formatDate } from './utils/date-formatter.js';

// Relative imports
import { parseContent } from './parser.js';
```

---

## Security Guidelines

### XSS Prevention

1. **Always Escape User Input**
   - Use `escapeHtml()` for all user-controlled data
   - Never use `innerHTML` with unsanitized data
   - Use `textContent` when possible

```javascript
// ✅ GOOD: Escaped content
import { escapeHtml } from './utils/security.js';
container.innerHTML = `<h2>${escapeHtml(post.title)}</h2>`;

// ❌ BAD: Unescaped content
container.innerHTML = `<h2>${post.title}</h2>`; // XSS vulnerability
```

2. **URL Sanitization**
   - Validate URLs before use
   - Only allow safe protocols (https, http, mailto, tel)
   - Use `sanitizeUrl()` utility

```javascript
// ✅ GOOD: Sanitized URL
import { sanitizeUrl } from './utils/security.js';
link.href = sanitizeUrl(userProvidedUrl);

// ❌ BAD: Unsanitized URL
link.href = userProvidedUrl; // Could be javascript:alert('xss')
```

3. **Content Security Policy**
   - Implement CSP headers
   - Use nonces for inline scripts
   - Avoid inline event handlers

---

## Error Handling

### Error Handling Patterns

1. **Use ErrorHandler Utility**
   - Centralized error logging
   - Consistent user feedback
   - Context-aware error messages

```javascript
// ✅ GOOD: Proper error handling
import { ErrorHandler, ErrorContext } from './utils/error-handler.js';

try {
  const data = await fetchBlogPosts();
  displayPosts(data);
} catch (error) {
  ErrorHandler.log(error, ErrorContext.FETCH);
  ErrorHandler.displayUserError(
    container,
    'Unable to load blog posts. Please try again later.'
  );
}
```

2. **Async Error Handling**
   - Always handle promise rejections
   - Use try-catch with async/await
   - Provide fallback behavior

```javascript
// ✅ GOOD: Comprehensive async error handling
const loadData = async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    ErrorHandler.log(error, ErrorContext.FETCH);
    return null; // Fallback
  }
};
```

3. **Result Type Pattern**
   - Use Result type for functional error handling
   - Avoid throwing in pure functions
   - Make errors explicit

```javascript
// ✅ GOOD: Result type
import { Result } from './utils/error-handler.js';

const parseJSON = (str) => {
  try {
    return Result.ok(JSON.parse(str));
  } catch (error) {
    return Result.err(error);
  }
};

const result = parseJSON(data);
if (result.isOk) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

---

## Testing Requirements

### Test Coverage

1. **Minimum Coverage: 60%**
   - All utility functions must have tests
   - Critical paths must be tested
   - Edge cases must be covered

2. **Test Structure**
   - Use Vitest for testing
   - Follow AAA pattern (Arrange, Act, Assert)
   - One assertion per test when possible

```javascript
// ✅ GOOD: Well-structured test
import { describe, it, expect } from 'vitest';
import { formatDate } from '../date-formatter.js';

describe('formatDate', () => {
  it('formats valid date correctly', () => {
    // Arrange
    const input = '2025-01-15';
    
    // Act
    const result = formatDate(input);
    
    // Assert
    expect(result).toBe('January 15, 2025');
  });
  
  it('handles invalid date gracefully', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid date');
  });
});
```

3. **Test Pure Functions First**
   - Pure functions are easiest to test
   - No mocking required
   - Deterministic results

---

## Documentation Standards

### JSDoc Comments

1. **All Public Functions Must Have JSDoc**
   - Description of purpose
   - Parameter types and descriptions
   - Return type and description
   - Examples when helpful

```javascript
/**
 * Formats a date string to a readable format
 * 
 * @param {string|Date} dateInput - Date to format
 * @param {string} locale - Locale code (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date or 'Invalid date'
 * 
 * @example
 * formatDate('2025-01-15')
 * // Returns: 'January 15, 2025'
 */
export const formatDate = (dateInput, locale = 'en-US', options = {}) => {
  // Implementation
};
```

2. **Module Documentation**
   - File-level JSDoc with @module
   - Brief description of module purpose
   - List of main exports

```javascript
/**
 * Date Formatting Utilities
 * Pure functions for date manipulation and formatting
 * 
 * @module date-formatter
 */
```

---

## Performance Guidelines

### Optimization Rules

1. **Avoid Premature Optimization**
   - Write clear code first
   - Measure before optimizing
   - Profile to find bottlenecks

2. **DOM Optimization**
   - Cache DOM queries
   - Batch DOM updates
   - Use event delegation

```javascript
// ✅ GOOD: Cached queries
const createBlogFilter = () => {
  const cards = Array.from(document.querySelectorAll('.blog-card'));
  
  return (tag) => {
    cards.forEach(card => {
      card.style.display = shouldShow(card, tag) ? 'block' : 'none';
    });
  };
};

// ❌ BAD: Repeated queries
const filterPosts = (tag) => {
  document.querySelectorAll('.blog-card').forEach(card => {
    // Re-queries every time
  });
};
```

3. **Lazy Loading**
   - Use `loading="lazy"` for images
   - Implement code splitting
   - Load resources on demand

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

1. **Semantic HTML**
   - Use proper heading hierarchy
   - Use semantic elements (nav, article, section)
   - Provide alt text for images

2. **ARIA Labels**
   - Add aria-label for icon buttons
   - Use role attributes appropriately
   - Provide aria-live regions for dynamic content

3. **Keyboard Navigation**
   - All interactive elements must be keyboard accessible
   - Visible focus indicators
   - Logical tab order

---

## Code Review Checklist

Before submitting code, ensure:

- [ ] All functions are pure where possible
- [ ] Side effects are isolated and clearly marked
- [ ] User input is properly escaped
- [ ] Errors are handled consistently
- [ ] Tests are written and passing
- [ ] JSDoc comments are complete
- [ ] No magic numbers or strings
- [ ] Code follows DRY principle
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed

---

**Remember:** These standards exist to maintain code quality and prevent technical debt. When in doubt, favor clarity and simplicity over cleverness.


