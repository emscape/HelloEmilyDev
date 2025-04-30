/**
 * Project Loader Module for HelloEmily.dev
 * 
 * This module provides a standardized way to load and display projects
 * from the projects-data.json file. It handles fetching the data,
 * error handling, and generating consistent HTML for project cards.
 */

/**
 * Loads projects from JSON and displays them in the specified container
 * 
 * @param {string} containerId - The ID of the HTML element where project cards should be inserted
 * @returns {Promise} - A promise that resolves when projects are loaded and displayed
 */
export async function loadProjects(containerId) {
  try {
    // Get the container element
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }
    
    // Fetch project data
    const response = await fetch('./projects/projects-data.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Clear existing content
    container.innerHTML = '';
    
    // Sort projects by featured status and completion date
    const sortedProjects = [...data.projects].sort((a, b) => {
      // First sort by featured status
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then sort by completion date (newest first)
      const dateA = new Date(a.completionDate);
      const dateB = new Date(b.completionDate);
      return dateB - dateA;
    });
    
    // Create and append project cards
    sortedProjects.forEach(project => {
      const projectCard = createProjectCard(project);
      container.appendChild(projectCard);
    });
    
    // Return the loaded projects data for potential further use
    return data.projects;
    
  } catch (error) {
    console.error('Error loading projects:', error);
    
    // Display error message in the container
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h3>Unable to load projects</h3>
          <p>Please try again later or contact me for more information.</p>
        </div>
      `;
    }
    
    return null;
  }
}

/**
 * Creates a standardized project card element
 * 
 * @param {Object} project - Project data object
 * @returns {HTMLElement} - Project card DOM element
 */
function createProjectCard(project) {
  const projectCard = document.createElement('div');
  projectCard.className = 'project-card';
  
  // Add data attributes for potential filtering
  projectCard.dataset.id = project.id;
  if (project.featured) {
    projectCard.dataset.featured = project.featured;
  }
  
  // Add technology tags as data attributes for filtering
  if (project.technologies && project.technologies.length) {
    project.technologies.forEach(tech => {
      projectCard.dataset[`tech${tech.toLowerCase().replace(/\s+/g, '')}`] = true;
    });
  }
  
  // Create tags HTML
  const tagsHTML = project.technologies
    ? project.technologies.map(tech => `<span>${tech}</span>`).join('')
    : '';
  
  // Build card HTML with standardized buttons
  projectCard.innerHTML = `
    ${project.featuredImage ? `<div class="project-image"><img src="${project.featuredImage}" alt="${project.title}"></div>` : ''}
    <div class="project-card-content">
      <h3>${project.title}</h3>
      <p>${project.shortDescription || ''}</p>
      <div class="project-tags">
        ${tagsHTML}
      </div>
      <div class="project-links">
        ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn" target="_blank">View Project</a>` : ''}
        ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">GitHub Repo</a>` : ''}
        ${project.blogPostUrl ? `<a href="${project.blogPostUrl}" class="btn btn-secondary">Read Blog Post</a>` : ''}
      </div>
    </div>
  `;
  
  return projectCard;
}

// Export additional utility functions if needed
export const ProjectLoader = {
  loadProjects,
  createProjectCard
};