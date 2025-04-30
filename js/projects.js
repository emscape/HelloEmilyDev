/**
 * Projects loader script for HelloEmily.dev
 * Uses the shared project-loader module to display featured projects on the main page
 */

// Import the loadProjects function from the shared module
import { loadProjects } from './project-loader.js';

document.addEventListener('DOMContentLoaded', function() {
  // Get the project grid container
  const projectsContainer = document.querySelector('.project-grid');
  
  // Add an ID to the container if it doesn't have one
  if (projectsContainer && !projectsContainer.id) {
    projectsContainer.id = 'featured-projects-container';
  }
  
  // Use the shared loadProjects function to load and display projects
  if (projectsContainer) {
    loadProjects('featured-projects-container')
      .then(projects => {
        // Add "View More Projects" link after projects are loaded
        if (projects && projects.length > 0) {
          const viewMoreContainer = document.createElement('div');
          viewMoreContainer.className = 'view-more-container';
          viewMoreContainer.style.textAlign = 'center';
          viewMoreContainer.style.marginTop = '30px';
          viewMoreContainer.style.gridColumn = '1 / -1';
          
          const viewMoreLink = document.createElement('a');
          viewMoreLink.href = './projects.html';
          viewMoreLink.className = 'btn';
          viewMoreLink.textContent = 'View More Projects';
          
          viewMoreContainer.appendChild(viewMoreLink);
          projectsContainer.appendChild(viewMoreContainer);
        }
      })
      .catch(error => {
        console.error('Error in projects.js:', error);
      });
  }
});