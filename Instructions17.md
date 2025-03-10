# Instructions 17: Fixing Image Display Issues

## Task Overview
Identify and resolve issues with images not displaying on the HelloEmily.dev website.

## Issues Identified

### 1. Project Image Path Issues
- In `projects-data.json`, some image paths were incorrectly referencing files in the `images/projects/` directory when they were actually located in the `projects/` directory.
- Affected images:
  - `sean-website-main.jpg`
  - `website-main.jpg`
  - `website-mobile.png`

### 2. Missing Blog Images
- The `blog-data.json` file referenced images that didn't exist in the `images/blog/` directory.
- Referenced but missing images:
  - `images/blog/ai-beginners.jpg`
  - `images/blog/women-in-tech.jpg`
  - `images/blog/documentation.jpg`
- The `images/blog/` directory only contained a README.md file with image guidelines.

## Solutions Implemented

### 1. Fixed Project Image Paths
- Updated `projects-data.json` to point to the correct location of project images:
  - Changed `images/projects/sean-website-main.jpg` to `projects/sean-website-main.jpg`
  - Changed `images/projects/website-main.jpg` to `projects/website-main.jpg`
  - Changed `images/projects/website-mobile.png` to `projects/website-mobile.png`

### 2. Addressed Missing Blog Images
- Removed image references from `blog-data.json` by setting the `featuredImage` property to an empty string for all blog posts.
- This allows the blog posts to display without image errors while maintaining the blog functionality.

## Verification
- Tested the website using a local Python HTTP server to avoid CORS issues.
- Confirmed that:
  - Profile image displays correctly in the About section
  - Background hero image displays correctly
  - Project images now display correctly in the Projects section
  - Blog posts display correctly without images

## Next Steps
1. **Add Blog Images**: Create and add the missing blog images to the `images/blog/` directory following the guidelines in the README.md file.
2. **Update Blog Data**: Once the images are added, update the `blog-data.json` file to reference the new images.
3. **Consider Image Optimization**: Optimize all images for web to improve page load times.
4. **Add Image Alt Text**: Ensure all images have descriptive alt text for accessibility.

## Technical Notes
- When running the site locally, use a local server (e.g., `python -m http.server 8000`) to avoid CORS issues when loading JSON files.
- The website is designed to gracefully handle missing images by not displaying image containers when no image path is provided.