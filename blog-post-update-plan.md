# Blog-Post.html Update Plan

## Current Issues
- The blog-post.html file currently contains Twitter meta tags that need to be removed
- Need to ensure Facebook Open Graph tags are properly configured
- Need to add placeholders for Bluesky meta tags

## Planned Changes

### 1. Remove Twitter Meta Tags
Remove the following lines from blog-post.html:
```html
<!-- Twitter - Will be dynamically updated by JavaScript -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://helloemily.dev/blog-post.html">
<meta property="twitter:title" content="Blog Post | Emily Anderson">
<meta property="twitter:description" content="Blog post by Emily Anderson, Innovation Engineer & Creative Problem Solver">
<meta property="twitter:image" content="https://helloemily.dev/images/site-preview.jpg">
```

### 2. Ensure Facebook Open Graph Tags
Verify and update the Facebook Open Graph tags:
```html
<!-- Open Graph / Facebook - Will be dynamically updated by JavaScript -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://helloemily.dev/blog-post.html">
<meta property="og:title" content="Blog Post | Emily Anderson">
<meta property="og:description" content="Blog post by Emily Anderson, Innovation Engineer & Creative Problem Solver">
<meta property="og:image" content="https://helloemily.dev/images/site-preview.jpg">
```

### 3. Add Bluesky Meta Tags Placeholder
Add placeholder for Bluesky meta tags (when they become standardized):
```html
<!-- Bluesky - Will be updated when standards are established -->
<!-- Placeholder for future Bluesky integration -->
```

### 4. Update JavaScript Files
Check and update any JavaScript files that might be dynamically updating the meta tags:
- js/blog-content-parser.js
- js/blog-post.js

## Implementation Notes
- These changes should be implemented by the Code mode
- Ensure all references to Twitter are removed from the JavaScript files as well
- Test the sharing functionality after implementation