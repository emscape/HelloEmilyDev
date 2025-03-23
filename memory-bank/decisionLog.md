# Decision Log

This file records architectural and implementation decisions using a list format.
2025-03-22 20:39:00 - Log of updates made.

*

## Decision

* Create a separate site for EmscapeForge.com rather than just rebranding the projects page
* Maintain HelloEmily.Dev as the personal portfolio site with a link to EmscapeForge.com
* Use GitHub API for automatic repository data retrieval
* Include Facebook and Bluesky integration while excluding Twitter
* Implement project categorization for different types of projects (Games, Apps, AI Experiments, etc.)

## Rationale 

* Separating the sites allows for distinct branding and focus for each purpose
* Maintaining HelloEmily.Dev preserves the established personal brand
* GitHub API integration reduces manual work in keeping project information up-to-date
* Facebook and Bluesky align with current social media preferences
* Project categorization improves user experience and makes it easier to find specific types of projects

## Implementation Details

* Update CNAME file for the new domain
* Create new HTML, CSS, and JavaScript files for EmscapeForge.com
* Implement GitHub API calls with appropriate caching to avoid rate limits
* Design a modern, developer-focused layout with filtering and search capabilities
* Create detailed project pages with goals, challenges, and solutions
* Implement block-based content structure for blog posts
* Create tools for converting markdown to block format

## Additional Decisions

* [2025-03-22 23:30:00] - **Implement Block-Based Content Structure for Blog Posts**
  * **Decision**: Transition from HTML string content to structured block-based content for blog posts
  * **Rationale**: Provides more flexibility, better content organization, and easier maintenance
* [2025-03-23 00:45:00] - **Automate Blog Post Publishing Process**
  * **Decision**: Create an automated system for publishing new blog posts
  * **Rationale**: Simplify the workflow for publishing new blog posts, reducing manual steps and potential errors
  * **Implementation**: 
    * Created publish-new-blog-posts.ps1 script to automatically process all new markdown files in blog-drafts
    * Added batch and PowerShell wrapper scripts for easy execution
    * Updated documentation to explain the new automated process
    * Maintained backward compatibility with existing manual processes

  * **Implementation**: Created md-to-blocks.js converter, updated blog-post.js to handle blocks, and added scripts for testing and managing blog posts