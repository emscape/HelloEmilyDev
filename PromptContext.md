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
- Design: Teal-based color palette with improved contrast on hero section
- Images: All project images displaying correctly with fixed paths
- Blog: Functional with sample posts and organized image folder structure
- Git Status: All changes pushed to GitHub (project organization, resume page, projects page)
- Design Resources: Analyzed design inspiration images and documented suggestions
- Projects: Expanded with dedicated projects page and organized project assets

## Latest Updates
- Reorganized blog images into post-specific folders for better organization (Instructions33.md)
- Updated blog templates and documentation to reflect the new image folder structure (Instructions33.md)
- Added image support for blog posts with sample images for three posts (Instructions32.md)
- Updated blog template and conversion scripts to support featured images (Instructions32.md)
- Created blog-drafts folder with markdown template for writing blog posts (Instructions31.md)

## Project Structure
```json
{
  "website_status": "live",
  "deployment": {"method": "manual_github_pages"},
  "key_files": {
    "content": ["index.html", "styles.css", "js/site-config.js", "projects.html", "resume/resume.html", "contact.html"],
    "data": ["projects/projects-data.json", "blog/blog-data.json"],
    "scripts": ["js/projects.js", "js/blog.js", "js/projects-page.js", "js/md-to-blog.js"]
  },
  "features": {
    "blog": {
      "status": "implemented",
      "sample_posts": 4,
      "markdown_drafts": true,
      "image_support": true,
      "image_organization": "post_specific_folders"
    },
    "projects": {"status": "expanded", "main_page_count": 3, "dedicated_page": true},
    "resume": {"status": "implemented", "dedicated_page": true},
    "easter_egg": {"status": "implemented", "type": "contact_page", "social_links": ["LinkedIn", "BlueSky", "Instagram", "LibraryThing", "Ravelry", "GitHub"]}
  },
  "next_tasks": {
    "current": ["implement_design_suggestions", "implement_mobile_optimization", "add_more_social_links"],
    "future": ["create_custom_logo", "enhance_project_details", "implement_blog_pagination"]
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
      "last_push": "2025-03-10",
      "commit_message": "Reorganize blog images into post-specific folders"
    }
  }
}