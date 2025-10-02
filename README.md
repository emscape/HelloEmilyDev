# Emily's Personal Website

This repository contains the source code for my personal website hosted at [HelloEmily.dev](https://HelloEmily.dev).

## Overview

A personal portfolio website showcasing projects, presentations, and blog posts. Built with vanilla HTML, CSS, and JavaScript following functional programming principles.

## Features

- 📱 Responsive design
- 👤 About section with profile
- 💼 Projects showcase with filtering
- 🎤 Presentations section
- 📝 Blog with markdown support
- 🏷️ Tag-based filtering
- 🔒 Security-first approach (XSS protection)
- ♿ Accessibility compliant (WCAG 2.1 AA)
- 🎨 GSAP scroll animations

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Markdown:** Marked.js for blog content
- **Animations:** GSAP (GreenSock Animation Platform)
- **Hosting:** GitHub Pages
- **Domain:** Custom domain via GitHub Pages

## Project Structure

```
HelloEmilyDev/
├── js/
│   ├── config/
│   │   └── constants.js          # Configuration constants
│   ├── utils/
│   │   ├── security.js           # XSS protection utilities
│   │   ├── error-handler.js      # Centralized error handling
│   │   ├── date-formatter.js     # Date formatting utilities
│   │   ├── path-utils.js         # Path manipulation utilities
│   │   ├── dom-utils.js          # DOM helper functions
│   │   └── index.js              # Barrel export
│   ├── blog-post.js              # Blog post rendering
│   ├── blog-archive.js           # Blog archive and filtering
│   ├── blog-content-parser.js    # Markdown content parser
│   ├── project-loader.js         # Project showcase loader
│   ├── presentations-loader.js   # Presentations loader
│   └── scroll-animations.js      # GSAP scroll animations
├── scripts/
│   ├── process-blog-draft.js     # Blog publishing workflow (NEW!)
│   ├── optimize-images.js        # Image optimization utility
│   ├── validate-blog-post.js     # Blog post validator
│   ├── rebuild-blog-index.js     # Rebuild blog index
│   └── add_new_project.py        # Project metadata manager
├── blog/                         # Blog posts (markdown)
├── projects/                     # Project data and images
├── presentations/                # Presentation data
├── images/                       # Site images
├── CODE_QUALITY_ANALYSIS.md      # Comprehensive code analysis
├── QUICK_FIXES_CHECKLIST.md      # Implementation checklist
├── CODING_STANDARDS.md           # Coding standards and best practices
└── ARCHITECTURE_DECISIONS.md     # Architecture decision records
```

## Development Setup

### Prerequisites

- Node.js 16+ (for development tools)
- Git
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/emscape/HelloEmilyDev.git
cd HelloEmilyDev

# Install development dependencies (when available)
npm install

# Start local development server
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js http-server
npx http-server -p 8000

# Visit http://localhost:8000
```

### Development Workflow

1. **Read the Standards**
   - Review `CODING_STANDARDS.md` for coding guidelines
   - Check `ARCHITECTURE_DECISIONS.md` for architectural patterns
   - Consult `CODE_QUALITY_ANALYSIS.md` for known issues

2. **Make Changes**
   - Follow functional programming principles
   - Write pure functions when possible
   - Separate side effects from business logic
   - Use utility functions from `js/utils/`

3. **Security First**
   - Always use `escapeHtml()` for user input
   - Sanitize URLs with `sanitizeUrl()`
   - Never use `innerHTML` with unsanitized data

4. **Test Your Changes**
   - Write tests for new utilities
   - Run existing tests: `npm test`
   - Test in multiple browsers

5. **Document Your Code**
   - Add JSDoc comments to all functions
   - Update README if adding features
   - Create ADR for significant decisions

## Blog Publishing Workflow

### Publishing a New Blog Post

1. **Create Markdown File**
   ```bash
   # Create file in blog-drafts/new/
   # Include YAML frontmatter with title, date, tags, etc.
   ```

2. **Process the Draft**
   ```bash
   node scripts/process-blog-draft.js your-post.md
   ```

   This automatically:
   - ✅ Validates frontmatter and content
   - ✅ Converts markdown to HTML
   - ✅ Optimizes images (90%+ reduction)
   - ✅ Generates WebP versions
   - ✅ Updates blog index
   - ✅ Moves to processed folder

3. **Verify**
   - Check `/blog/your-post/` loads correctly
   - Verify image displays
   - Test on localhost

**See [BLOG_WORKFLOW.md](BLOG_WORKFLOW.md) for complete documentation.**

### Utility Scripts

```bash
# Optimize images
node scripts/optimize-images.js images/blog/my-post/

# Validate post
node scripts/validate-blog-post.js blog-drafts/new/my-post.md

# Rebuild blog index
node scripts/rebuild-blog-index.js
```

## Coding Standards

### Functional Programming Principles

This project follows functional programming principles:

1. **Pure Functions First**
   ```javascript
   // ✅ GOOD: Pure function
   const formatDate = (date) => new Date(date).toLocaleDateString();

   // ❌ BAD: Impure function with side effects
   let formattedDate;
   const formatDate = (date) => {
     formattedDate = new Date(date).toLocaleDateString();
   };
   ```

2. **Immutability**
   ```javascript
   // ✅ GOOD: Immutable operations
   const addProject = (projects, newProject) => [...projects, newProject];

   // ❌ BAD: Mutation
   const addProject = (projects, newProject) => {
     projects.push(newProject);
     return projects;
   };
   ```

3. **Function Composition**
   ```javascript
   // ✅ GOOD: Composed functions
   const processPost = pipe(
     parseMarkdown,
     sanitizeHtml,
     formatContent
   );
   ```

4. **Separate Side Effects**
   ```javascript
   // Pure functions
   const formatData = (data) => ({ ...data, formatted: true });
   const generateHTML = (data) => `<div>${data.content}</div>`;

   // Impure function (clearly marked)
   const render = (container, html) => {
     container.innerHTML = html; // Side effect
   };
   ```

See `CODING_STANDARDS.md` for complete guidelines.

## Security

### XSS Protection

All user input is sanitized using utilities from `js/utils/security.js`:

```javascript
import { escapeHtml, sanitizeUrl } from './utils/security.js';

// Escape HTML content
container.innerHTML = `<h2>${escapeHtml(userInput)}</h2>`;

// Sanitize URLs
link.href = sanitizeUrl(userProvidedUrl);
```

### Content Security Policy

Implement CSP headers to prevent XSS attacks. See `ARCHITECTURE_DECISIONS.md` ADR-003.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```javascript
import { describe, it, expect } from 'vitest';
import { formatDate } from '../date-formatter.js';

describe('formatDate', () => {
  it('formats valid date correctly', () => {
    const result = formatDate('2025-01-15');
    expect(result).toBe('January 15, 2025');
  });
});
```

## Deployment

### GitHub Pages

This site is automatically deployed via GitHub Pages:

1. Push changes to `main` branch
2. GitHub Actions builds and deploys
3. Changes live at https://HelloEmily.dev

### Custom Domain

Custom domain configured in repository settings:
- Domain: HelloEmily.dev
- DNS: CNAME record pointing to `emscape.github.io`
- HTTPS: Enforced via GitHub Pages

## Contributing

### For AI Agents

When working on this codebase:

1. **Consult Documentation First**
   - Read `CODING_STANDARDS.md`
   - Review `ARCHITECTURE_DECISIONS.md`
   - Check `CODE_QUALITY_ANALYSIS.md` for known issues

2. **Follow Functional Programming**
   - Write pure functions
   - Avoid mutations
   - Separate side effects

3. **Security First**
   - Use `escapeHtml()` for all user input
   - Validate URLs with `sanitizeUrl()`
   - Never trust user data

4. **Document Decisions**
   - Add ADRs for significant changes
   - Update README for new features
   - Write JSDoc comments

5. **Test Everything**
   - Write tests for new utilities
   - Ensure existing tests pass
   - Test edge cases

### For Humans

1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Write tests
5. Submit a pull request

## Roadmap

See `CODE_QUALITY_ANALYSIS.md` for detailed improvement plan.

### Phase 1: Critical Security & Foundation ✅
- [x] Create XSS protection utilities
- [x] Create error handler utility
- [x] Create date formatter utility
- [x] Create path utilities
- [x] Create DOM utilities
- [x] Extract configuration constants
- [x] Create coding standards document
- [x] Create architecture decision records

### Phase 2: Fix XSS Vulnerabilities (In Progress)
- [ ] Fix blog-post.js XSS issues
- [ ] Fix blog-archive.js XSS issues
- [ ] Fix project-loader.js XSS issues
- [ ] Fix presentations-loader.js XSS issues
- [ ] Update all fetch operations with error handling

### Phase 3: Refactor to Functional Programming
- [ ] Refactor blog-post.js to pure functions
- [ ] Refactor blog-archive.js to pure functions
- [ ] Refactor BlogContentParser to functional
- [ ] Refactor project-loader.js to pure functions

### Phase 4: Testing Infrastructure
- [ ] Install and configure Vitest
- [ ] Write tests for security utils
- [ ] Write tests for date formatter
- [ ] Write tests for path utils
- [ ] Write tests for DOM utils

### Phase 5: Documentation & Polish
- [ ] Update all JSDoc comments
- [ ] Create developer guide
- [ ] Add code examples
- [ ] Performance optimization

## Resources

- [Coding Standards](./CODING_STANDARDS.md)
- [Architecture Decisions](./ARCHITECTURE_DECISIONS.md)
- [Code Quality Analysis](./CODE_QUALITY_ANALYSIS.md)
- [Quick Fixes Checklist](./QUICK_FIXES_CHECKLIST.md)

## License

© 2025 Emily Anderson. All rights reserved.

## Contact

- **Email:** [emily@theDapperFoxes.com](mailto:emily@theDapperFoxes.com)
- **GitHub:** [@emscape](https://github.com/emscape)
- **Website:** [HelloEmily.dev](https://HelloEmily.dev)