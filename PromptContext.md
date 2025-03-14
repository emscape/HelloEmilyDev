# HelloEmily.dev - Essential Project Info

## Core Details
- Domain: HelloEmily.dev (Namecheap)
- GitHub: emscape/HelloEmilyDev
- Email: emily@theDapperFoxes.com
- Location: Los Angeles, CA

## Current Status
- Website: Live on GitHub Pages with custom domain
- Content: Professional information from bold.pro profile integrated
- Structure: Organized repository with instruction files moved to dedicated folder
- Deployment: Manual GitHub Pages (GitHub Actions removed)
- Design: Modern design with vibrant turquoise palette, SVG patterns, and enhanced visual elements
- Images: All project images displaying correctly with fixed paths
- Blog: Functional with sample posts and organized image folder structure
- Git Status: All changes pushed to GitHub (project organization, resume page, projects page, blog post pages)
- Design Resources: Analyzed design inspiration images and documented suggestions
- Projects: Expanded with dedicated projects page and organized project assets
- Social Sharing: Added Open Graph and Twitter Card meta tags for improved social media previews
- Presentations: Created presentations folder for storing PowerPoint/Google Slides

## Latest Updates
- Pushed all recent changes to GitHub including blog image enhancements and multiple image support (Instructions50.md)
- Added support for multiple images in blog posts with additionalImages array and gallery display (Instructions49.md)
- Ensured all blog posts have featured images (Instructions49.md)
- Standardized image naming in personal-ai and panel-facilitation folders to follow consistent naming convention (Instructions48.md)
- Fixed broken images on 9/6/23 blog post and changed date to 9/8/23 (Instructions47.md)
- Enhanced "Getting Started with AI" blog post with detailed content from GDG Twin Cities presentation (Instructions46.md)

## Project Structure
```json
{
  "website_status": "live",
  "deployment": {"method": "manual_github_pages"},
  "key_files": {
    "content": ["index.html", "styles.css", "js/site-config.js", "projects.html", "resume/resume.html", "contact.html", "blog-archive.html", "blog-post.html"],
    "data": ["projects/projects-data.json", "blog/blog-data.json"],
    "scripts": ["js/projects.js", "js/blog.js", "js/projects-page.js", "js/md-to-blog.js", "js/blog-archive.js", "js/blog-post.js"]
  },
  "features": {
    "blog": {
      "status": "implemented",
      "sample_posts": 6,
      "main_page_count": 3,
      "archive_page": true,
      "individual_pages": true,
      "markdown_drafts": true,
      "image_support": true,
      "image_organization": "post_specific_folders"
    },
    "projects": {"status": "expanded", "main_page_count": 3, "dedicated_page": true},
    "resume": {"status": "implemented", "dedicated_page": true},
    "easter_egg": {"status": "implemented", "type": "contact_page", "social_links": ["LinkedIn", "BlueSky", "Instagram", "LibraryThing", "Ravelry", "GitHub"]}
  },
  "next_tasks": {
    "current": ["add_more_social_links", "implement_dark_mode"],
    "future": ["create_custom_logo", "enhance_project_details", "implement_blog_search", "add_more_blog_drafts"]
  },
  "images": {
    "status": {
      "profile_photo": "implemented",
      "background_image": "implemented",
      "project_screenshots": "implemented",
      "blog_images": "organized_by_post",
      "design_inspiration": "analyzed"
    }
  },
  "repository": {
    "organization": {
      "instructions_folder": "created",
      "design_inspiration_folder": "created",
      "project_folders": "organized",
      "resume_folder": "created",
      "blog_drafts_folder": "created",
      "blog_image_folders": "organized_by_post"
    },
    "git": {
      "last_push": "2025-03-14",
      "commit_message": "Add multiple images support to blog posts and update blog image organization",
      "branches": ["main", "design-update", "update-prompt-and-blog-data"]
    }
  }
}