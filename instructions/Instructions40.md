# Instructions 40: Update Social Media Preview Image

## Task
Update all HTML files to use site-preview.jpg instead of profile.jpg for social media preview images in Open Graph and Twitter Card meta tags.

## Steps Taken

1. Examined the current project context by reading PromptContext.md
2. Verified that site-preview.jpg exists in the images directory
3. Checked all main HTML files to identify which ones needed updates:
   - index.html
   - projects.html
   - contact.html
   - blog-archive.html
   - resume/resume.html

4. Updated each HTML file to use site-preview.jpg instead of profile.jpg:
   - Modified the Open Graph meta tag: `<meta property="og:image" content="https://helloemily.dev/images/site-preview.jpg">`
   - Modified the Twitter Card meta tag: `<meta property="twitter:image" content="https://helloemily.dev/images/site-preview.jpg">`

5. Verified all changes were successfully applied

## Files Modified
- index.html
- projects.html
- contact.html
- blog-archive.html
- resume/resume.html

## Result
All pages now use the site-preview.jpg image for social media sharing, providing a consistent and professional appearance when links are shared on platforms like Facebook, Twitter, LinkedIn, etc.

## Benefits
- Improved social media presence with a consistent preview image across all pages
- Better branding and recognition when links are shared
- Professional appearance on social platforms