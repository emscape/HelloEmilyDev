# Blog Post Publishing Automation

This document explains the automated blog post publishing system for HelloEmily.dev. The system is designed to make it easy to publish new blog posts with minimal manual intervention.

## Overview

The blog post publishing automation system consists of several components:

1. **Blog Drafts Directory**: Where new blog posts are created as markdown files
2. **Publishing Scripts**: Automated scripts that handle the conversion and publishing process
3. **Conversion Scripts**: Scripts that convert markdown to JSON format
4. **Posted Directory**: Where published blog posts are stored

## How It Works

### The Publishing Process

When you have one or more new blog posts ready to publish:

1. Create your blog post as a markdown file in the `blog-drafts` directory
2. Ensure any images are placed in the appropriate folder in `images/blog/`
3. Run the publishing script:
   - Windows: Double-click on `blog-drafts/publish-new-posts.bat`
   - PowerShell: Right-click on `blog-drafts/publish-new-posts.ps1` and select "Run with PowerShell"

The automated process will:
1. Find all markdown files in the blog-drafts folder (excluding README.md and template.md)
2. Convert them to the block-based JSON format
3. Add them to the blog-data.json file
4. Move the published files to the Posted folder

### Components

#### 1. Publishing Scripts

- **publish-new-posts.bat**: Windows batch file for easy execution
- **publish-new-posts.ps1**: PowerShell version of the publishing script
- Both scripts call the main `publish-new-blog-posts.ps1` script

#### 2. Main Publishing Script

- **js/publish-new-blog-posts.ps1**: The main script that handles the publishing process
- Finds all markdown files in the blog-drafts directory
- Calls the conversion script for each file
- Moves published files to the Posted folder

#### 3. Conversion Scripts

- **js/md-to-blog.ps1**: Converts markdown files to JSON format
- **js/md-to-blocks.js**: JavaScript module for converting markdown to block format
- **js/blog-content-parser.js**: JavaScript module for parsing blog content

#### 4. Display Scripts

- **js/blog-post.js**: Loads and displays a single blog post
- **js/blog.js**: Loads and displays blog posts on the main page
- **js/blog-archive.js**: Loads and displays all blog posts in the archive

## Markdown Format

Blog posts can be written in two formats:

### 1. Structured Format

```markdown
# Title of Your Blog Post

## Metadata
- Author: Your Name
- Date: YYYY-MM-DD
- Tags: tag1, tag2, tag3
- Featured: true/false
- FeaturedImage: images/blog/your-post-folder/your-image-filename.jpg

## Short Description
A brief one or two sentence description of your blog post.

## Content
Your full blog post content goes here. You can use markdown formatting...
```

### 2. Natural Format

```markdown
# Title of Your Blog Post

Introduction paragraph that will be used as the short description.

![Featured Image](images/blog/your-post-folder/your-image-filename.jpg)

## Section Heading

Your content here with **bold text**, *italic text*, and [links](https://example.com).
```

The system will automatically extract metadata and convert the content to the appropriate format.

## Image Organization

Each blog post should have its own dedicated folder for images in the `images/blog/` directory:

- `images/blog/your-post-folder/` - Create a folder with a name that matches your blog post topic
- Place all images for that post in the folder

### Naming Convention

All blog images must follow this naming convention:

1. **Featured Image**: `[folder-name]-featured.jpg` (e.g., `ai-ethics-featured.jpg`)
2. **Additional Images**: `[folder-name]-1.jpg`, `[folder-name]-2.jpg`, etc.

## Maintenance

### Adding New Features

If you need to add new features to the blog system:

1. **New Metadata Fields**: Update the `Parse-MarkdownFile` function in `js/md-to-blog.ps1`
2. **New Content Types**: Update the `BlogContentParser` class in `js/blog-content-parser.js`
3. **New Display Features**: Update the display logic in `js/blog-post.js`

### Troubleshooting

If you encounter issues with the publishing process:

1. **Check Markdown Format**: Ensure your markdown file follows one of the supported formats
2. **Check Image Paths**: Ensure image paths are correct and images exist
3. **Check Console Errors**: Look for error messages in the console when running the scripts
4. **Manual Conversion**: Try running the conversion script manually for a specific file:
   ```powershell
   .\js\md-to-blog.ps1 -File your-post.md -UseBlocks
   ```

## Future Enhancements

Potential future enhancements to the blog system:

1. **Scheduled Publishing**: Add the ability to schedule posts for future publication
2. **Draft Preview**: Add the ability to preview drafts before publishing
3. **Categories**: Add support for categorizing blog posts
4. **Search**: Add search functionality to the blog
5. **Comments**: Add a commenting system