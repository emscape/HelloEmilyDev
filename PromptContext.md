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
- Git Status: Image path fixes implemented but not yet pushed to GitHub

## Latest Updates
- Fixed project image paths in projects-data.json (Instructions17.md)
- Removed blog image references temporarily (Instructions17.md)
- Created mobile optimization and social links plan (Instructions18.md)

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
    "blog": {"status": "implemented", "sample_posts": 3},
    "projects": {"status": "implemented", "count": 3}
  },
  "next_tasks": {
    "current": ["optimize_for_mobile", "add_more_social_links"],
    "future": ["enhance_project_details", "add_real_blog_content", "implement_blog_pagination"]
  },
  "images": {
    "status": {
      "profile_photo": "implemented",
      "background_image": "implemented",
      "project_screenshots": "fixed_paths",
      "blog_images": "pending"
    }
  }
}