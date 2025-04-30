/**
 * Projects page script for HelloEmily.dev
 * Loads and displays all projects with filtering capabilities
 * Uses the shared project-loader module for consistent project display
 */

import { loadProjects } from './project-loader.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Load projects using the shared module
  // The container for projects is the div with class 'project-grid'
  const projects = await loadProjects('project-grid');
  
  // If projects were loaded successfully, set up the filters
  if (projects) {
    setupFilters(projects);
  }
});

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