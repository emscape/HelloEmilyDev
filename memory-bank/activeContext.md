# Active Context

This file tracks the project's current status, including recent changes, current goals, and open questions.
2025-03-22 20:38:00 - Log of updates made.

*

## Current Focus

* Rebranding the projects page to emscapeforge.com
* Setting up GitHub integration to showcase projects directly from repositories
* Adding QuizInMyApp and SkolVikings projects from GitHub
* Updating social media integration to include Facebook and Bluesky while removing Twitter

## Recent Changes

* Created emscapeforge-rebranding-plan.md with detailed implementation plan
* Created blog-post-update-plan.md for removing Twitter meta tags and adding Facebook/Bluesky
* Initialized Memory Bank to track project progress
* [2025-03-22 21:00:00] - Prepared to begin implementation but switching to a new task
* [2025-03-22 23:30:00] - Implemented Phase 3 of blog structure update plan:
  * Removed Twitter meta tags from blog-post.html
  * Added Bluesky meta tag placeholders
  * Updated blog-post.js to remove Twitter meta tag updates
  * Enhanced md-to-blog.ps1 to support block-based format
  * Created scripts for testing block conversion and moving posts to Posted folder
* [2025-03-23 00:50:00] - Implemented blog post publishing automation:
  * Created publish-new-blog-posts.ps1 script to automate the blog publishing workflow
  * Added user-friendly batch and PowerShell wrapper scripts in blog-drafts folder
  * Updated blog-drafts/README.md with instructions for the new automated process
  * Created comprehensive documentation in blog-post-automation-docs.md

  * Updated blog-drafts/README.md with documentation for the new format

## Open Questions/Issues

* How will the navigation between HelloEmily.Dev and EmscapeForge.com work?
* What specific GitHub API endpoints will be needed for repository data?
* Will authentication be required for GitHub API integration?
* Are there any specific design preferences for the EmscapeForge site?
* How should project categories be structured and filtered?