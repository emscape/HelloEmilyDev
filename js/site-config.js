/**
 * Site configuration loader for HelloEmily.dev
 * Dynamically loads site metadata and configures page elements
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load site metadata from JSON file
  fetch('./content/site-metadata.json')
    .then(response => response.json())
    .then(data => {
      applySiteMetadata(data);
    })
    .catch(error => {
      console.error('Error loading site metadata:', error);
    });
    
  // Load about content from markdown file
  fetch('./content/about-me.md')
    .then(response => response.text())
    .then(markdown => {
      // Simple markdown parsing for paragraphs
      const htmlContent = parseSimpleMarkdown(markdown);
      const aboutTextContainer = document.querySelector('.about-text');
      
      if (aboutTextContainer) {
        aboutTextContainer.innerHTML = htmlContent;
      }
    })
    .catch(error => {
      console.error('Error loading about content:', error);
    });
});

/**
 * Applies site metadata to the page
 * @param {Object} metadata - Site metadata object
 */
function applySiteMetadata(metadata) {
  // Set page title
  document.title = metadata.title;
  
  // Set meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', metadata.description);
  }
  
  // Update navigation if it exists
  const navList = document.querySelector('nav ul');
  if (navList && metadata.navigation) {
    navList.innerHTML = '';
    metadata.navigation.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${item.url}">${item.name}</a>`;
      navList.appendChild(li);
    });
  }
  
  // Update contact email
  const contactEmail = document.querySelector('.contact-email');
  if (contactEmail && metadata.contact && metadata.contact.email) {
    contactEmail.innerHTML = `Email: <a href="mailto:${metadata.contact.email}">${metadata.contact.email}</a>`;
  }
  
  // Update social links
  const socialLinks = document.querySelector('.social-links');
  if (socialLinks && metadata.social) {
    socialLinks.innerHTML = '';
    
    if (metadata.social.github) {
      socialLinks.innerHTML += `<a href="${metadata.social.github}" target="_blank">GitHub</a>`;
    }
    
    if (metadata.social.linkedin) {
      socialLinks.innerHTML += `<a href="${metadata.social.linkedin}" target="_blank">LinkedIn</a>`;
    }
    
    if (metadata.social.instagram) {
      socialLinks.innerHTML += `<a href="${metadata.social.instagram}" target="_blank">Instagram</a>`;
    }
  }
  
  // Update skills section if it exists
  const skillsContainer = document.querySelector('.skills-container');
  if (skillsContainer && metadata.skills) {
    skillsContainer.innerHTML = '';
    
    metadata.skills.forEach(category => {
      const skillCategory = document.createElement('div');
      skillCategory.className = 'skill-category';
      
      skillCategory.innerHTML = `
        <h3>${category.category}</h3>
        <ul class="skill-list">
          ${category.items.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      `;
      
      skillsContainer.appendChild(skillCategory);
    });
  }
}

/**
 * Simple markdown parser for basic formatting
 * @param {string} markdown - Markdown text
 * @return {string} HTML content
 */
function parseSimpleMarkdown(markdown) {
  let html = '';
  const lines = markdown.split('\n');
  let inParagraph = false;
  
  lines.forEach(line => {
    // Handle headers
    if (line.startsWith('# ')) {
      if (inParagraph) {
        html += '</p>';
        inParagraph = false;
      }
      html += `<h2>${line.substring(2)}</h2>`;
    }
    else if (line.startsWith('## ')) {
      if (inParagraph) {
        html += '</p>';
        inParagraph = false;
      }
      html += `<h3>${line.substring(3)}</h3>`;
    }
    // Handle list items
    else if (line.startsWith('- ')) {
      if (inParagraph) {
        html += '</p>';
        inParagraph = false;
      }
      if (!html.endsWith('</ul>') && !html.endsWith('<ul>')) {
        html += '<ul>';
      }
      html += `<li>${line.substring(2)}</li>`;
    }
    // Handle empty lines
    else if (line.trim() === '') {
      if (inParagraph) {
        html += '</p>';
        inParagraph = false;
      }
      if (html.endsWith('</li>')) {
        html += '</ul>';
      }
    }
    // Handle regular paragraphs
    else {
      if (!inParagraph) {
        html += '<p>';
        inParagraph = true;
      } else {
        html += ' ';
      }
      html += line;
    }
  });
  
  if (inParagraph) {
    html += '</p>';
  }
  
  return html;
}