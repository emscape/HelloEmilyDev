# HelloEmily.dev - Essential Project Info

## Core Details
- Domain: HelloEmily.dev (Namecheap)
- GitHub: emscape/HelloEmilyDev
- Email: emily@theDapperFoxes.com
- Location: Los Angeles, CA

## Current Status
- Website: Live on GitHub Pages with custom domain
- Content: Professional information from bold.pro profile integrated
- Structure: All content files properly linked
- Deployment: Manual GitHub Pages (GitHub Actions removed)
- Design: Teal-based color palette implemented
- Images: All project images displaying correctly with fixed paths
- Blog: Functional with sample posts (no images currently)
- Git Status: All changes pushed to GitHub (I/O puzzle fixes, all screenshots added)

## Latest Updates
- Fixed I/O puzzle project link to point to emilysueanderson.com, removed Source button, added all screenshots (Instructions21.md)
- Added "author" before Sean Cameron's name and fixed I/O puzzle links (Instructions20.md)
- Added new blog post about solving Google I/O 2025 puzzles dated 2.11.25 (Instructions20.md)
- Pushed all changes to GitHub including blog functionality and image path fixes (Instructions19.md)

## Project Structure
```json
{
  "website_status": "live",
  "deployment": {"method": "manual_github_pages"},
  "key_files": {
    "content": ["index.html", "styles.css", "js/site-config.js"],
    "data": ["projects/projects-data.json", "blog/blog-data.json"],
    "scripts": ["js/projects.js", "js/blog.js"]
  },
  "features": {
    "blog": {"status": "implemented", "sample_posts": 4},
    "projects": {"status": "implemented", "count": 3}
  },
  "next_tasks": {
    "current": ["implement_mobile_optimization", "add_more_social_links", "add_blog_images"],
    "future": ["enhance_project_details", "implement_blog_pagination", "improve_seo"]
  },
  "images": {
    "status": {
      "profile_photo": "implemented",
      "background_image": "implemented",
      "project_screenshots": "implemented",
      "blog_images": "pending"
    }
  }
}