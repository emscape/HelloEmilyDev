/**
 * Projects loader script for HelloEmily.dev
 * Dynamically loads and displays project data from JSON
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load projects data from JSON file
  fetch('./projects/projects-data.json')
    .then(response => response.json())
    .then(data => {
      displayProjects(data.projects);
    })
    .catch(error => {
      console.error('Error loading projects data:', error);
      displayFallbackProjects();
    });
});

/**
 * Displays projects in the project grid
 * @param {Array} projects - Array of project objects
 */
function displayProjects(projects) {
  const projectsContainer = document.querySelector('.project-grid');
  
  // Clear any existing content
  if (projectsContainer) {
    projectsContainer.innerHTML = '';
    
    // Sort projects to show featured ones first
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
    
    // Create and append project cards
    sortedProjects.forEach(project => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      
      // Create tags HTML
      const tagsHTML = project.technologies
        .map(tech => `<span>${tech}</span>`)
        .join('');
      
      // Build card HTML
      projectCard.innerHTML = `
        ${project.featuredImage ? `<div class="project-image"><img src="${project.featuredImage}" alt="${project.title}"></div>` : ''}
        <div class="project-card-content">
          <h3>${project.title}</h3>
          <p>${project.shortDescription}</p>
          <div class="project-tags">
            ${tagsHTML}
          </div>
          <div class="project-links">
            ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn" target="_blank">View Project</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">View Source</a>` : ''}
          </div>
        </div>
      `;
      
      projectsContainer.appendChild(projectCard);
    });
  }
}

/**
 * Displays fallback projects if JSON loading fails
 */
function displayFallbackProjects() {
  const projectsContainer = document.querySelector('.project-grid');
  
  if (projectsContainer) {
    // Keep any existing content as fallback
    if (projectsContainer.children.length === 0) {
      projectsContainer.innerHTML = `
        <div class="project-card">
          <div class="project-card-content">
            <h3>HelloEmily.dev Website</h3>
            <p>My personal portfolio website built with HTML, CSS, and JavaScript. Hosted on GitHub Pages with a custom domain.</p>
            <div class="project-tags">
              <span>HTML</span>
              <span>CSS</span>
              <span>JavaScript</span>
              <span>GitHub Pages</span>
            </div>
            <div class="project-links">
              <a href="https://helloemily.dev" class="btn" target="_blank">View Project</a>
              <a href="https://github.com/emscape/HelloEmilyDev" class="btn btn-secondary" target="_blank">View Source</a>
            </div>
          </div>
        </div>
      `;
    }
  }
}