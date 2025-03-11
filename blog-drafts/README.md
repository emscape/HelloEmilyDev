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

## Image Organization

Each blog post should have its own dedicated folder for images in the `images/blog/` directory:

- `images/blog/your-post-folder/` - Create a folder with a name that matches your blog post topic
- Place all images for that post in the folder
- Reference images using the path: `images/blog/your-post-folder/image-name.jpg`

## Converting to Blog Posts

The markdown files in this folder can be converted to the JSON format required by the blog system using the blog conversion script.