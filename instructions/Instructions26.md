# Instructions 26: Expanding the Projects Section

## Task
Make the projects section more expandable by:
1. Keeping the top 3 projects on the main site
2. Building a new page to display more projects
3. Adding a 'more' link in the current projects section
4. Organizing each project in its own folder within the projects directory

## Implementation Steps

### 1. Created a dedicated projects page
- Created `projects.html` with the same styling and navigation as the main page
- Added a projects header section with title and description
- Implemented a project filtering system with buttons for "All Projects" and "Featured"
- Added a back-to-home link for easy navigation

### 2. Created a JavaScript file for the projects page
- Created `js/projects-page.js` to handle loading and displaying all projects
- Implemented functionality to display all projects from projects-data.json
- Added filtering capability based on featured status and technologies
- Ensured proper sorting of projects (featured first, then by completion date)

### 3. Modified the main page projects section
- Updated `js/projects.js` to only display the top 3 projects on the main page
- Added sorting logic to prioritize featured projects and then sort by completion date
- Added a "View More Projects" link at the bottom of the projects section
- Ensured the link points to the new projects.html page

### 4. Organized project assets into dedicated folders
- Created individual folders for each project in the projects directory:
  - `projects/io-puzzle-2025/`
  - `projects/sean-cameron-website/`
  - `projects/personal-website/`
- Moved all project-related assets to their respective folders:
  - Moved images from images/projects/ to the appropriate project folders
  - Moved project-specific files (like io-puzzle-2025.md) to their project folders
  - Moved screenshots and other assets to their respective project folders

### 5. Updated file paths in projects-data.json
- Updated all image paths in projects-data.json to reflect the new folder structure
- Ensured all paths are relative to the root directory for proper loading

## Testing
- Verified that the top 3 projects display correctly on the main page
- Confirmed the "View More Projects" link appears and works properly
- Tested the projects.html page to ensure all projects are displayed
- Verified that the filtering functionality works as expected
- Confirmed all images and assets load correctly with the new paths

## Results
- Main page now shows only the top 3 projects with a link to see more
- New projects page displays all projects with filtering options
- Project assets are now organized in a more maintainable folder structure
- Website navigation is improved with dedicated projects page