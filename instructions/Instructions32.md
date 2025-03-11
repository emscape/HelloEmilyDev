# Instructions 32: Adding Image Support to Blog Posts

## Overview
This task involved adding support for images in blog posts, including creating the necessary structure, updating templates, and adding sample images to existing blog posts.

## Steps Taken

### 1. Created Sample Blog Images
- Copied relevant images from the project folders to the images/blog folder:
  - Copied `projects/sean-cameron-website/sean-website-main.jpg` to `images/blog/sean-website-featured.jpg` for the Sean's Website blog post
  - Copied `projects/io-puzzle-2025/io-puzzle-1.jpeg` to `images/blog/io-puzzle-featured.jpg` for the Google I/O Puzzles blog post
  - Copied `images/design-inspiration/image_fx_.jpg` to `images/blog/ai-ethics-featured.jpg` for the AI Ethics blog post

### 2. Updated Blog Data with Image Paths
- Modified `blog/blog-data.json` to include image paths for the selected blog posts:
  - Added `"featuredImage": "images/blog/sean-website-featured.jpg"` to the Sean's Website blog post
  - Added `"featuredImage": "images/blog/ai-ethics-featured.jpg"` to the AI Ethics blog post
  - Added `"featuredImage": "images/blog/io-puzzle-featured.jpg"` to the Google I/O Puzzles blog post

### 3. Updated Blog Post Template
- Modified `blog-drafts/template.md` to include a FeaturedImage field in the metadata section:
```markdown
# Your Blog Post Title Here

## Metadata
- Author: Your Name
- Date: YYYY-MM-DD
- Tags: tag1, tag2, tag3
- Featured: false
- FeaturedImage: images/blog/your-image-filename.jpg

## Short Description
Write a brief one or two sentence description of your blog post here. This will appear in the blog card preview.

## Content
```

### 4. Updated Markdown to JSON Conversion Scripts
- Modified `js/md-to-blog.js` to handle the featuredImage field with case insensitivity:
```javascript
featuredImage: metadata.featuredimage || metadata.featuredImage || '',
```

- Modified `js/md-to-blog.ps1` to handle both case variations of the featuredImage field:
```powershell
featuredImage = if ($metadata.ContainsKey('featuredimage')) { $metadata['featuredimage'] } elseif ($metadata.ContainsKey('featuredImage')) { $metadata['featuredImage'] } else { '' }
```

### 5. Tested Image Display
- Set up a local HTTP server using Python's built-in server to test the changes:
```
python -m http.server 8000
```
- Verified that images are displayed correctly in both the blog card view and the full blog post view

## Results
- Successfully added image support to the blog system
- Added sample images to three blog posts (Sean's Website, AI Ethics, and Google I/O Puzzles)
- Updated the blog post template to include instructions for adding images
- Updated the markdown to JSON conversion scripts to handle the featuredImage field properly
- Verified that images are displayed correctly in the blog

## Next Steps
- Consider adding support for inline images within blog post content
- Implement image optimization for better performance
- Add more blog posts with images to showcase the new feature