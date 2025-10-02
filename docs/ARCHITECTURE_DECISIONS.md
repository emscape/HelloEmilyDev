# Architecture Decision Records (ADR)

This document records significant architectural decisions made for the HelloEmily.dev project.

---

## ADR-001: Adopt Functional Programming Principles

**Date:** 2025-09-30  
**Status:** Accepted  
**Decision Makers:** Development Team

### Context

The codebase was originally written in an imperative style with heavy DOM manipulation, mutable state, and mixed concerns. This led to:
- Difficult-to-test code
- Unpredictable behavior
- High coupling between components
- Security vulnerabilities (XSS)

### Decision

Adopt functional programming principles as the primary paradigm:
1. Pure functions for business logic
2. Immutable data structures
3. Function composition over inheritance
4. Explicit side effect management

### Consequences

**Positive:**
- Easier to test (pure functions)
- More predictable behavior
- Better code reusability
- Reduced bugs from mutation

**Negative:**
- Learning curve for team members
- More verbose in some cases
- Requires discipline to maintain

**Mitigation:**
- Comprehensive coding standards document
- Code review checklist
- Training materials and examples

---

## ADR-002: Centralize Utility Functions

**Date:** 2025-09-30  
**Status:** Accepted

### Context

Code duplication was rampant across the codebase:
- Date formatting logic repeated in 3+ files
- Path normalization duplicated
- No consistent error handling

### Decision

Create centralized utility modules:
- `js/utils/security.js` - XSS protection
- `js/utils/error-handler.js` - Error handling
- `js/utils/date-formatter.js` - Date operations
- `js/utils/path-utils.js` - Path manipulation
- `js/utils/dom-utils.js` - DOM operations

### Consequences

**Positive:**
- DRY principle enforced
- Single source of truth
- Easier to maintain and test
- Consistent behavior across app

**Negative:**
- Initial refactoring effort
- Need to update imports

---

## ADR-003: Implement XSS Protection Layer

**Date:** 2025-09-30  
**Status:** Accepted  
**Priority:** CRITICAL

### Context

Multiple XSS vulnerabilities identified:
- Direct `innerHTML` assignment with user data
- No input sanitization
- Potential for script injection

### Decision

Implement comprehensive XSS protection:
1. `escapeHtml()` function for all user input
2. `sanitizeUrl()` for link validation
3. `safeHtml` template literal tag
4. Mandatory code review for `innerHTML` usage

### Consequences

**Positive:**
- Eliminates XSS vulnerabilities
- Security-first approach
- Consistent sanitization

**Negative:**
- Requires updating all existing code
- Slight performance overhead
- Must remember to use utilities

**Mitigation:**
- Linting rules to catch unsafe patterns
- Code review checklist
- Automated tests for sanitization

---

## ADR-004: Use Result Type for Error Handling

**Date:** 2025-09-30  
**Status:** Accepted

### Context

Error handling was inconsistent:
- Mix of try-catch and callbacks
- Silent failures
- No standard error reporting

### Decision

Implement Result type pattern (inspired by Rust):
```javascript
const result = parseJSON(data);
if (result.isOk) {
  // Handle success
} else {
  // Handle error
}
```

### Consequences

**Positive:**
- Explicit error handling
- No hidden exceptions
- Functional approach
- Type-safe (with TypeScript later)

**Negative:**
- More verbose than try-catch
- Requires discipline

---

## ADR-005: Extract Configuration Constants

**Date:** 2025-09-30  
**Status:** Accepted

### Context

Magic numbers and strings scattered throughout:
- Hardcoded delays (250ms, 0ms)
- Repeated selectors ('.blog-grid')
- No central configuration

### Decision

Create `js/config/constants.js` with:
- TIMING constants
- SELECTORS
- PATHS
- VALIDATION rules
- ERROR_MESSAGES

### Consequences

**Positive:**
- Easy to modify configuration
- Self-documenting code
- Consistent values
- Single source of truth

**Negative:**
- Need to import constants
- Slightly more verbose

---

## ADR-006: Separate Pure and Impure Functions

**Date:** 2025-09-30  
**Status:** Accepted

### Context

Functions mixed business logic with side effects:
- Hard to test
- Unpredictable behavior
- Difficult to reason about

### Decision

Enforce separation:
1. Pure functions for data transformation
2. Impure functions for I/O and DOM
3. Clear naming conventions
4. Orchestration functions to combine

Example:
```javascript
// Pure
const formatPostData = (post) => ({ ...post, date: formatDate(post.date) });
const generateHTML = (post) => `<article>...</article>`;

// Impure (clearly marked)
const renderPost = (container, html) => {
  container.innerHTML = html; // Side effect
};

// Orchestration
const displayPost = (post) => {
  const formatted = formatPostData(post);
  const html = generateHTML(formatted);
  const container = document.querySelector('.post');
  renderPost(container, html);
};
```

### Consequences

**Positive:**
- Testable pure functions
- Clear side effect boundaries
- Better code organization

**Negative:**
- More functions to manage
- Requires discipline

---

## ADR-007: No Class-Based Components (Prefer Functions)

**Date:** 2025-09-30  
**Status:** Accepted

### Context

Existing classes (`BlogContentParser`, `ScrollAnimations`) have:
- Mutable state
- Complex this binding
- Harder to test

### Decision

Prefer pure functions over classes:
- Use closures for state when needed
- Higher-order functions for configuration
- Plain objects for data

### Consequences

**Positive:**
- Simpler mental model
- Easier to test
- Better composition
- No this binding issues

**Negative:**
- May need more functions
- Less familiar to OOP developers

---

## ADR-008: Implement Layered Architecture

**Date:** 2025-09-30  
**Status:** Proposed

### Context

Current architecture mixes concerns:
- Data fetching in UI code
- Business logic in rendering
- No clear boundaries

### Decision

Implement three-layer architecture:

```
┌─────────────────────────────┐
│     UI Layer (Presentation) │
│  - Rendering                │
│  - User interactions        │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│   Domain Layer (Business)   │
│  - Business logic           │
│  - Data transformation      │
│  - Validation               │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│     Data Layer (Access)     │
│  - API calls                │
│  - Caching                  │
│  - Data fetching            │
└─────────────────────────────┘
```

### Consequences

**Positive:**
- Clear separation of concerns
- Easier to test each layer
- Better maintainability
- Can swap implementations

**Negative:**
- More files and structure
- Initial refactoring effort
- May be overkill for small site

**Status:** Proposed for Phase 3

---

## ADR-009: Use Vitest for Testing

**Date:** 2025-09-30  
**Status:** Accepted

### Context

No testing framework in place. Need to add automated tests.

### Decision

Use Vitest because:
- Fast (Vite-powered)
- Jest-compatible API
- ESM support out of the box
- Great DX with watch mode

### Consequences

**Positive:**
- Fast test execution
- Modern tooling
- Good documentation
- Active community

**Negative:**
- Newer than Jest (less mature)
- Smaller ecosystem

---

## ADR-010: Defer Build Process Implementation

**Date:** 2025-09-30  
**Status:** Accepted

### Context

No build process currently. Using vanilla JS with ES modules.

### Decision

Defer Vite/Webpack implementation until:
1. Core refactoring complete
2. Tests in place
3. Clear need for transpilation

### Rationale

- Modern browsers support ES modules
- No TypeScript yet (no transpilation needed)
- Keep it simple for now
- Can add later without major changes

### Consequences

**Positive:**
- Simpler development setup
- No build step delays
- Easier debugging

**Negative:**
- No code splitting
- No tree shaking
- No minification
- Manual script loading

**Review Date:** After Phase 3 completion

---

## Decision Process

### How to Propose an ADR

1. Create a new ADR section
2. Fill in Context, Decision, Consequences
3. Discuss with team
4. Update Status (Proposed → Accepted/Rejected)

### ADR Statuses

- **Proposed:** Under consideration
- **Accepted:** Approved and being implemented
- **Rejected:** Considered but not adopted
- **Deprecated:** No longer applicable
- **Superseded:** Replaced by another ADR

---

## Future Considerations

### Under Discussion

1. **TypeScript Migration**
   - Pros: Type safety, better IDE support
   - Cons: Build step required, learning curve
   - Status: Deferred to Phase 5

2. **State Management Library**
   - Pros: Centralized state, predictable updates
   - Cons: May be overkill for static site
   - Status: Not needed currently

3. **Component Framework (React/Vue)**
   - Pros: Better component model, ecosystem
   - Cons: Major rewrite, added complexity
   - Status: Not planned

---

**Last Updated:** 2025-09-30  
**Next Review:** After Phase 3 completion


