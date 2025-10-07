/**
 * Project Loader Module for HelloEmily.dev - REFACTORED
 * Functional programming approach with pure functions
 * Loads and displays projects from projects-data.json
 */

import { escapeHtml, sanitizeUrl } from './utils/security.js';
import { ErrorHandler, ErrorContext } from './utils/error-handler.js';
import { formatYearMonth } from './utils/date-formatter.js';
import { sortByDate } from './utils/date-formatter.js';

// ============================================================================
// PURE FUNCTIONS - Data Transformation
// ============================================================================

/**
 * Sorts projects by featured status and completion date
 * Pure function
 * 
 * @param {Array<Object>} projects - Array of project objects
 * @returns {Array<Object>} - Sorted projects
 */
const sortProjects = (projects) => {
  return [...projects].sort((a, b) => {
    // First sort by featured status
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // Then sort by completion date (newest first)
    return sortByDate([a, b], 'completionDate', false)[0] === a ? -1 : 1;
  });
};

/**
 * Determines if current page is index page
 * Pure function
 * 
 * @param {string} pathname - Window location pathname
 * @returns {boolean} - Whether current page is index
 */
const isIndexPage = (pathname) => {
  return pathname === '/' || pathname.endsWith('/index.html');
};

/**
 * Limits projects for display based on page
 * Pure function
 * 
 * @param {Array<Object>} projects - Sorted projects
 * @param {string} pathname - Window location pathname
 * @returns {Array<Object>} - Projects to display
 */
const limitProjectsForPage = (projects, pathname) => {
  return isIndexPage(pathname) ? projects.slice(0, 3) : projects;
};

/**
 * Prepares projects for display (sort + limit)
 * Pure function
 * 
 * @param {Array<Object>} projects - Raw projects array
 * @param {string} pathname - Window location pathname
 * @returns {Array<Object>} - Prepared projects
 */
const prepareProjects = (projects, pathname) => {
  const sorted = sortProjects(projects);
  return limitProjectsForPage(sorted, pathname);
};

/**
 * Generates technology tags HTML
 * Pure function
 * 
 * @param {Array<string>} technologies - Array of technology names
 * @returns {string} - HTML for technology tags
 */
const generateTechnologyTagsHTML = (technologies) => {
  if (!technologies || !technologies.length) return '';
  
  return technologies
    .map(tech => `<span>${escapeHtml(tech)}</span>`)
    .join('');
};

/**
 * Adjusts image path based on current page location
 * Pure function
 *
 * @param {string} imagePath - Original image path
 * @returns {string} - Adjusted image path
 */
const adjustImagePath = (imagePath) => {
  if (!imagePath) return '';

  // If we're in the /pages/ directory, go up one level
  const isInPagesDirectory = window.location.pathname.includes('/pages/');
  return isInPagesDirectory ? `../${imagePath}` : imagePath;
};

/**
 * Generates featured image HTML
 * Pure function
 *
 * @param {string|null} featuredImage - Featured image URL
 * @param {string} title - Project title for alt text
 * @returns {string} - HTML for featured image
 */
const generateFeaturedImageHTML = (featuredImage, title) => {
  if (!featuredImage) return '';

  const adjustedPath = adjustImagePath(featuredImage);

  return `<div class="project-image">
    <img src="${sanitizeUrl(adjustedPath)}"
         alt="${escapeHtml(title)}"
         loading="lazy">
  </div>`;
};

/**
 * Generates project link HTML
 * Pure function
 * 
 * @param {string|null} url - Link URL
 * @param {string} text - Link text
 * @param {string} className - CSS class name
 * @param {boolean} external - Whether link is external
 * @returns {string} - HTML for link
 */
const generateProjectLinkHTML = (url, text, className, external = false) => {
  if (!url) return '';
  
  const externalAttrs = external 
    ? 'target="_blank" rel="noopener noreferrer"' 
    : '';
  
  return `<a href="${sanitizeUrl(url)}" class="${className}" ${externalAttrs}>${escapeHtml(text)}</a>`;
};

/**
 * Generates all project links HTML
 * Pure function
 * 
 * @param {Object} project - Project object
 * @returns {string} - HTML for all project links
 */
const generateProjectLinksHTML = (project) => {
  const liveUrlHTML = generateProjectLinkHTML(
    project.liveUrl, 
    'View Project', 
    'btn', 
    true
  );
  
  const githubUrlHTML = generateProjectLinkHTML(
    project.githubUrl, 
    'GitHub Repo', 
    'btn btn-secondary', 
    true
  );
  
  const blogPostUrlHTML = generateProjectLinkHTML(
    project.blogPostUrl, 
    'Read Blog Post', 
    'btn btn-secondary', 
    false
  );
  
  return `
    <div class="project-links">
      ${liveUrlHTML}
      ${githubUrlHTML}
      ${blogPostUrlHTML}
    </div>
  `;
};

/**
 * Generates project card HTML
 * Pure function
 * 
 * @param {Object} project - Project object
 * @returns {string} - HTML for project card
 */
const generateProjectCardHTML = (project) => {
  const featuredImageHTML = generateFeaturedImageHTML(project.featuredImage, project.title);
  const tagsHTML = generateTechnologyTagsHTML(project.technologies);
  const linksHTML = generateProjectLinksHTML(project);
  
  return `
    ${featuredImageHTML}
    <div class="project-card-content">
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.shortDescription || '')}</p>
      <div class="project-tags">
        ${tagsHTML}
      </div>
      ${linksHTML}
    </div>
  `;
};

/**
 * Generates data attributes for project card
 * Pure function
 * 
 * @param {Object} project - Project object
 * @returns {Object} - Object with data attributes
 */
const generateProjectDataAttributes = (project) => {
  const attrs = {
    id: project.id
  };
  
  if (project.featured) {
    attrs.featured = project.featured;
  }
  
  // Add technology tags as data attributes
  if (project.technologies && project.technologies.length) {
    project.technologies.forEach(tech => {
      const safeTech = tech.toLowerCase().replace(/\s+/g, '');
      attrs[`tech${safeTech}`] = true;
    });
  }
  
  return attrs;
};

// ============================================================================
// IMPURE FUNCTIONS - Side Effects (DOM Manipulation)
// ============================================================================

/**
 * Creates a project card DOM element
 * Impure function - DOM creation
 * 
 * @param {Object} project - Project object
 * @returns {HTMLElement} - Project card element
 */
const createProjectCard = (project) => {
  const projectCard = document.createElement('div');
  projectCard.className = 'project-card';
  
  // Set data attributes
  const dataAttrs = generateProjectDataAttributes(project);
  Object.entries(dataAttrs).forEach(([key, value]) => {
    projectCard.dataset[key] = value;
  });
  
  // Set inner HTML
  projectCard.innerHTML = generateProjectCardHTML(project);
  
  return projectCard;
};

/**
 * Renders projects to container
 * Impure function - DOM manipulation
 * 
 * @param {HTMLElement} container - Container element
 * @param {Array<Object>} projects - Array of project objects
 */
const renderProjects = (container, projects) => {
  container.innerHTML = '';
  
  projects.forEach(project => {
    const projectCard = createProjectCard(project);
    container.appendChild(projectCard);
  });
};

/**
 * Fetches project data from JSON
 * Impure function - Network I/O
 * 
 * @returns {Promise<Object>} - Promise resolving to project data
 */
const fetchProjectData = async () => {
  const dataPath = adjustImagePath('projects/projects-data.json');
  const response = await fetch(dataPath);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.projects) {
    throw new Error('Invalid project data format');
  }
  
  return data;
};

/**
 * Loads projects from JSON and displays them
 * Impure function - Orchestration
 * 
 * @param {string} containerId - Container element ID
 * @returns {Promise<Array<Object>>} - Promise resolving to projects array
 */
export async function loadProjects(containerId) {
  try {
    // Get container element
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return [];
    }
    
    // Create error boundary
    const handleError = ErrorHandler.createBoundary(container, ErrorContext.FETCH);
    
    try {
      // Fetch data
      const data = await fetchProjectData();
      
      // Prepare projects for display
      const projectsToDisplay = prepareProjects(data.projects, window.location.pathname);
      
      // Render projects
      renderProjects(container, projectsToDisplay);
      
      // Return all projects for potential further use
      return data.projects;
      
    } catch (error) {
      ErrorHandler.log(error, ErrorContext.FETCH);
      handleError(error, 'Unable to load projects. Please try again later.');
      return [];
    }
    
  } catch (error) {
    console.error('Error in loadProjects:', error);
    return [];
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export main function
export { loadProjects as default };

// Export pure functions for testing
export {
  sortProjects,
  isIndexPage,
  limitProjectsForPage,
  prepareProjects,
  generateTechnologyTagsHTML,
  generateFeaturedImageHTML,
  generateProjectLinkHTML,
  generateProjectLinksHTML,
  generateProjectCardHTML,
  generateProjectDataAttributes,
  createProjectCard
};

// Export utility object for backward compatibility
export const ProjectLoader = {
  loadProjects,
  createProjectCard
};

