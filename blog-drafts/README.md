# Blog Drafts

This folder contains markdown files that will be converted into blog posts for the HelloEmily.dev website.

## How to Use

1. Create a new markdown file in this folder with a descriptive name (e.g., `ai-ethics.md`)
2. Create a folder for your blog post images in `images/blog/` with a matching name (e.g., `images/blog/ai-ethics/`)
3. Use the following format for your blog post:

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
Your full blog post content goes here. You can use markdown formatting:

### Subheadings

- Bullet points
- Another point

**Bold text** and *italic text*

[Links](https://example.com)

And more...
```

4. Place all images for your blog post in the dedicated folder you created in step 2
5. Once your draft is ready, it can be converted to the JSON format required by the blog system.

## Image Organization and Naming Convention

Each blog post should have its own dedicated folder for images in the `images/blog/` directory:

- `images/blog/your-post-folder/` - Create a folder with a name that matches your blog post topic
- Place all images for that post in the folder

### Naming Convention

All blog images must follow this strict naming convention:

1. **Featured Image**: Each blog post folder must have one featured image named:
   - `[folder-name]-featured.jpg` (e.g., `ai-ethics-featured.jpg`)
   - In your markdown, reference it as: `images/blog/your-post-folder/your-post-folder-featured.jpg`

2. **Additional Images**: Any additional images in the folder should be named:
   - `[folder-name]-1.jpg`, `[folder-name]-2.jpg`, etc.
   - Example: `gen-ai-enterprise-1.jpg`, `gen-ai-enterprise-2.jpg`
   - In your markdown, reference them as: `images/blog/your-post-folder/your-post-folder-1.jpg`

This naming convention ensures consistency across the blog and makes it easier to manage images.

## Converting to Blog Posts

The markdown files in this folder can be converted to the JSON format required by the blog system using the blog conversion script.

## Alternative Format

In addition to the structured format above, you can also use a more natural markdown format:

```markdown
# Title of Your Blog Post

Introduction paragraph that will be used as the short description.

![Featured Image](images/blog/your-post-folder/your-image-filename.jpg)

## Section Heading

Your content here with **bold text**, *italic text*, and [links](https://example.com).

### Subsection

More content...
```

The system will automatically:
- Use the first paragraph as the short description
- Extract metadata from the content
- Convert the markdown to the appropriate block format

### Supported Image Formats

The following image formats are supported:
- JPG/JPEG
- PNG
- WebP

Images should be placed in a dedicated folder in the `images/blog/` directory following the naming conventions described above.

## Publishing Blog Posts

### Automated Publishing Process

The blog system now includes an automated publishing process that makes it easy to publish new blog posts. When you have one or more new blog posts ready to publish:

1. Simply run one of the publishing scripts in this folder:
   - **Windows**: Double-click on `publish-new-posts.bat`
   - **PowerShell**: Right-click on `publish-new-posts.ps1` and select "Run with PowerShell"

The automated process will:
1. Find all markdown files in this folder (excluding README.md and template.md)
2. Convert them to the block-based JSON format
3. Add them to the blog-data.json file
4. Move the published files to the Posted folder

This eliminates the need to manually run conversion scripts for each blog post.

### Manual Publishing (Alternative)

If you prefer to publish posts manually, you can still use the individual scripts:

To move a file to the Posted folder after publishing:

```powershell
.\js\move-to-posted.ps1 -File your-article.md
```

## Block-Based Format

The blog system now supports a block-based content format, which provides more flexibility and better structure for blog posts. To convert a markdown file to the block-based format, use the `test-md-to-blocks.ps1` script:

```powershell
.\js\test-md-to-blocks.ps1
```

This will convert the saving-sparky.md file to block format as an example. You can modify the script to convert other files.