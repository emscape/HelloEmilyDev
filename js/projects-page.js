/**
 * Projects page script for HelloEmily.dev
 * Loads and displays all projects with filtering capabilities
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load projects data from JSON file
  fetch('../projects/projects-data.json')
    .then(response => response.json())
    .then(data => {
      displayAllProjects(data.projects);
      setupFilters(data.projects);
    })
    .catch(error => {
      console.error('Error loading projects data:', error);
      document.querySelector('.project-grid').innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h3>Unable to load projects</h3>
          <p>Please try again later or contact me for more information.</p>
        </div>
      `;
    });
});

/**
 * Displays all projects in the project grid
 * @param {Array} projects - Array of project objects
 */
function displayAllProjects(projects) {
  const projectsContainer = document.querySelector('.project-grid');
  
  if (projectsContainer) {
    projectsContainer.innerHTML = '';
    
    // Sort projects by completion date (newest first)
    const sortedProjects = [...projects].sort((a, b) => {
      // First sort by featured status
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then sort by completion date
      const dateA = new Date(a.completionDate);
      const dateB = new Date(b.completionDate);
      return dateB - dateA;
    });
    
    // Create and append project cards
    sortedProjects.forEach(project => {
      const projectCard = createProjectCard(project);
      projectsContainer.appendChild(projectCard);
    });
  }
}

/**
 * Creates a project card element
 * @param {Object} project - Project data object
 * @returns {HTMLElement} - Project card DOM element
 */
function createProjectCard(project) {
  const projectCard = document.createElement('div');
  projectCard.className = 'project-card';
  projectCard.dataset.id = project.id;
  projectCard.dataset.featured = project.featured;
  
  // Add technology tags as data attributes for filtering
  if (project.technologies && project.technologies.length) {
    project.technologies.forEach(tech => {
      projectCard.dataset[`tech${tech.toLowerCase().replace(/\s+/g, '')}`] = true;
    });
  }
  
  // Create tags HTML
  const tagsHTML = project.technologies
    .map(tech => `<span>${tech}</span>`)
    .join('');
  
  // Build card HTML
  projectCard.innerHTML = `
    ${project.featuredImage ? `<div class="project-image"><img src="../${project.featuredImage}" alt="${project.title}"></div>` : ''}
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
  
  return projectCard;
}

/**
 * Sets up project filtering functionality
 * @param {Array} projects - Array of project objects
 */
function setupFilters(projects) {
  const filterContainer = document.querySelector('.project-filters');
  const projectCards = document.querySelectorAll('.project-card');
  
  // Extract unique technologies from all projects
  const allTechnologies = new Set();
  projects.forEach(project => {
    if (project.technologies && project.technologies.length) {
      project.technologies.forEach(tech => allTechnologies.add(tech));
    }
  });
  
  // Add technology filters (limit to common ones to avoid too many filters)
  const techArray = Array.from(allTechnologies);
  const commonTechs = techArray.filter(tech => {
    // Count how many projects use this technology
    const count = projects.filter(p => 
      p.technologies && p.technologies.includes(tech)
    ).length;
    
    // Only include technologies used in multiple projects
    return count > 1;
  });
  
  // Add technology filter buttons
  commonTechs.forEach(tech => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = tech;
    btn.dataset.filter = `tech${tech.toLowerCase().replace(/\s+/g, '')}`;
    filterContainer.appendChild(btn);
  });
  
  // Add event listeners to filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.dataset.filter;
      
      // Show/hide projects based on filter
      projectCards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === 'featured') {
          card.style.display = card.dataset.featured === 'true' ? 'flex' : 'none';
        } else {
          card.style.display = card.dataset[filter] ? 'flex' : 'none';
        }
      });
    });
  });
}