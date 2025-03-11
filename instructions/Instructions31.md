# Instructions 31: Blog Post Markdown System

## Task Overview
Create a structured system for managing blog post drafts in markdown format and converting them to the JSON format required by the blog system.

## Steps Completed

1. **Created blog-drafts folder**
   - Created a dedicated folder for storing markdown blog post drafts
   - Added a README.md file explaining the purpose and usage of the folder

2. **Created markdown template and examples**
   - Added template.md as a starting point for new blog posts
   - Converted existing blog post drafts to the new format:
     - Ethics & AI blog post → ethics-and-ai.md
     - Sean website blog post → sean-website-case-study.md

3. **Developed markdown to JSON converters**
   - Created js/md-to-blog.js script (Node.js version)
   - Created js/md-to-blog.ps1 script (PowerShell version for Windows)
   - Both scripts can process a single file or all files in the blog-drafts folder
   - Features include:
     - Metadata extraction (author, date, tags, featured status)
     - Markdown to HTML conversion
     - ID generation from title
     - Integration with existing blog-data.json

## How to Use

### Creating a New Blog Post

1. Copy the template from blog-drafts/template.md
2. Fill in your content following the format:
   - Title at the top
   - Metadata section with author, date, tags, and featured status
   - Short description for the blog card preview
   - Full content in markdown format

### Converting to JSON

#### Option 1: Using PowerShell (Windows)

Run the PowerShell script to convert markdown files to JSON:

```powershell
# Convert all markdown files in blog-drafts folder
.\js\md-to-blog.ps1

# Convert a specific file
.\js\md-to-blog.ps1 -File filename.md
```

#### Option 2: Using Node.js (Cross-platform)

If you have Node.js installed, you can use the JavaScript version:

```bash
# Convert all markdown files in blog-drafts folder
node js/md-to-blog.js

# Convert a specific file
node js/md-to-blog.js filename.md
```

#### Option 3: Manual Conversion

If neither PowerShell nor Node.js is available, you can manually convert markdown files to JSON:

1. Open the markdown file and extract the metadata, short description, and content
2. Open blog/blog-data.json
3. Add a new entry to the "posts" array following the existing format:
   ```json
   {
     "id": "your-post-title-in-kebab-case",
     "title": "Your Post Title",
     "shortDescription": "Your short description",
     "content": "<p>Your HTML content</p>",
     "author": "Your Name",
     "date": "YYYY-MM-DD",
     "tags": ["Tag1", "Tag2"],
     "featuredImage": "",
     "featured": true/false
   }
   ```

### Viewing the Blog

After converting the markdown files to JSON, view the blog on the website to see your new posts.

## Future Improvements

Potential enhancements for the blog system:
- Add support for image uploads in the markdown files
- Implement a more robust markdown parser
- Create a preview feature to see how posts will look before publishing
- Add pagination for the blog page as the number of posts grows