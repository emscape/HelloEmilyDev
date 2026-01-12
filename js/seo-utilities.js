/**
 * SEO Utilities Module for HelloEmily.dev
 * Handles dynamic meta tag updates, structured data, and SEO-related functionality
 */

/**
 * Updates meta tags for a blog post dynamically
 * @param {Object} postData - The blog post data object
 */
export const updateBlogPostMetaTags = (postData) => {
  if (!postData) return;

  const {
    title = 'Blog Post | Emily Anderson',
    shortDescription = 'Blog post by Emily Anderson',
    slug = '/',
    date = new Date().toISOString().split('T')[0],
    featuredImage = '/images/site-preview.jpg',
    tags = []
  } = postData;

  const canonicalUrl = `https://helloemily.dev${slug}`;
  
  // Update page title
  document.title = `${title} | Emily Anderson`;

  // Update standard meta tags
  updateMetaTag('meta[name="description"]', 'content', shortDescription);
  
  // Update canonical URL
  const canonicalLink = document.getElementById('canonical-link') || 
                       document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.href = canonicalUrl;
  } else {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
  }

  // Update Open Graph tags
  updateMetaTag('meta[property="og:title"]', 'content', title);
  updateMetaTag('meta[property="og:description"]', 'content', shortDescription);
  updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
  updateMetaTag('meta[property="og:image"]', 'content', featuredImage);
  updateMetaTag('meta[property="article:published_time"]', 'content', date);

  // Update Twitter tags
  updateMetaTag('meta[property="twitter:title"]', 'content', title);
  updateMetaTag('meta[property="twitter:description"]', 'content', shortDescription);
  updateMetaTag('meta[property="twitter:image"]', 'content', featuredImage);

  // Update JSON-LD Article schema
  updateArticleSchema(postData, canonicalUrl);

  // Update breadcrumb schema
  updateBreadcrumbSchema([
    { name: 'Home', url: 'https://helloemily.dev/' },
    { name: 'Blog', url: 'https://helloemily.dev/pages/blog-archive.html' },
    { name: title, url: canonicalUrl }
  ]);
};

/**
 * Updates a meta tag content
 * @param {string} selector - CSS selector for the meta tag
 * @param {string} attribute - Attribute to update (usually 'content')
 * @param {string} value - New value for the attribute
 */
const updateMetaTag = (selector, attribute, value) => {
  let element = document.querySelector(selector);
  
  if (!element) {
    element = document.createElement('meta');
    
    // Set the property/name attribute
    if (selector.includes('[property="')) {
      const prop = selector.match(/property="([^"]+)"/)[1];
      element.setAttribute('property', prop);
    } else if (selector.includes('[name="')) {
      const name = selector.match(/name="([^"]+)"/)[1];
      element.setAttribute('name', name);
    }
    
    document.head.appendChild(element);
  }
  
  if (value) {
    element.setAttribute(attribute, value);
  }
};

/**
 * Updates the Article schema JSON-LD
 * @param {Object} postData - Blog post data
 * @param {string} url - Canonical URL
 */
const updateArticleSchema = (postData, url) => {
  const {
    title = 'Blog Post',
    shortDescription = '',
    date = new Date().toISOString(),
    featuredImage = '/images/site-preview.jpg'
  } = postData;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': shortDescription,
    'image': featuredImage,
    'url': url,
    'datePublished': date,
    'dateModified': date,
    'author': {
      '@type': 'Person',
      'name': 'Emily Anderson',
      'url': 'https://helloemily.dev/',
      'sameAs': [
        'https://www.linkedin.com/in/emilyanderson81/',
        'https://github.com/emscape',
        'https://bsky.app/profile/emscape.bsky.social'
      ]
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Emily Anderson',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://helloemily.dev/images/site-preview.jpg'
      }
    }
  };

  updateJSONLD('article-schema', schema);
};

/**
 * Updates or creates a JSON-LD script tag
 * @param {string} id - ID of the script tag
 * @param {Object} schema - Schema object
 */
const updateJSONLD = (id, schema) => {
  let script = document.getElementById(id);
  
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(schema);
};

/**
 * Updates breadcrumb schema
 * @param {Array} items - Array of breadcrumb items with name and url
 */
const updateBreadcrumbSchema = (items) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };

  updateJSONLD('breadcrumb-schema', schema);
};

/**
 * Updates person/author schema
 */
export const updateAuthorSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'Emily Anderson',
    'url': 'https://helloemily.dev/',
    'image': 'https://helloemily.dev/images/site-preview.jpg',
    'sameAs': [
      'https://www.linkedin.com/in/emilyanderson81/',
      'https://github.com/emscape',
      'https://bsky.app/profile/emscape.bsky.social',
      'https://twitter.com/emscape'
    ],
    'jobTitle': 'Innovation Engineer',
    'worksFor': {
      '@type': 'Organization',
      'name': 'Freelance'
    },
    'description': 'Innovation Engineer & Creative Problem Solver specializing in AI, software development, and technical leadership.'
  };

  updateJSONLD('person-schema', schema);
};

/**
 * Adds structured data for Organization
 */
export const updateOrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Emily Anderson',
    'url': 'https://helloemily.dev/',
    'logo': 'https://helloemily.dev/images/site-preview.jpg',
    'description': 'Innovation Engineer & Creative Problem Solver',
    'sameAs': [
      'https://www.linkedin.com/in/emilyanderson81/',
      'https://github.com/emscape',
      'https://bsky.app/profile/emscape.bsky.social'
    ],
    'contact': {
      '@type': 'ContactPoint',
      'contactType': 'Professional Contact',
      'url': 'https://helloemily.dev/pages/contact.html'
    }
  };

  updateJSONLD('org-schema', schema);
};

/**
 * Validates heading hierarchy on a page
 * Returns warnings if issues are found
 */
export const validateHeadingHierarchy = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const warnings = [];

  if (headings.length === 0) {
    warnings.push('No headings found on page');
    return warnings;
  }

  let h1Count = 0;
  let lastLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1]);

    // Check for multiple H1s
    if (level === 1) {
      h1Count++;
    }

    // Check for proper hierarchy
    if (index > 0 && level > lastLevel + 1) {
      warnings.push(`Missing heading level between H${lastLevel} and H${level} at: "${heading.textContent}"`);
    }

    lastLevel = level;
  });

  if (h1Count === 0) {
    warnings.push('No H1 heading found on page');
  } else if (h1Count > 1) {
    warnings.push(`Multiple H1 headings found (${h1Count}). Best practice is to have exactly one.`);
  }

  if (warnings.length === 0) {
    console.log('✓ Heading hierarchy is valid');
  } else {
    console.warn('Heading hierarchy issues:', warnings);
  }

  return warnings;
};

/**
 * Validates image alt text
 * Returns warnings if images are missing alt text
 */
export const validateImageAltText = () => {
  const images = document.querySelectorAll('img');
  const warnings = [];

  images.forEach((img, index) => {
    const src = img.src || img.getAttribute('src') || 'unknown';
    
    if (!img.alt || img.alt.trim() === '') {
      warnings.push(`Image ${index + 1} missing alt text: ${src}`);
    }

    if (img.alt && img.alt.length > 125) {
      warnings.push(`Image ${index + 1} alt text too long (${img.alt.length} chars): ${src}`);
    }
  });

  if (warnings.length === 0) {
    console.log('✓ All images have proper alt text');
  } else {
    console.warn('Image alt text issues:', warnings);
  }

  return warnings;
};

/**
 * Check for broken internal links
 */
export const validateInternalLinks = () => {
  const links = document.querySelectorAll('a[href]');
  const warnings = [];
  const internalHrefs = new Set();

  links.forEach((link) => {
    const href = link.getAttribute('href');
    
    // Skip external links and special links
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href === '#') {
      return;
    }

    internalHrefs.add(href);

    // Check for obvious issues
    if (href.includes('..') && href.includes('/index.html')) {
      warnings.push(`Suspicious link path: ${href}`);
    }
  });

  if (warnings.length === 0) {
    console.log('✓ Internal links appear valid');
  } else {
    console.warn('Link validation issues:', warnings);
  }

  return warnings;
};

/**
 * Performs comprehensive SEO audit
 */
export const performSEOAudit = () => {
  console.log('🔍 Starting SEO Audit...\n');
  
  const headingWarnings = validateHeadingHierarchy();
  const imageWarnings = validateImageAltText();
  const linkWarnings = validateInternalLinks();

  const totalIssues = headingWarnings.length + imageWarnings.length + linkWarnings.length;

  console.log(`\n📊 SEO Audit Summary:`);
  console.log(`   Heading issues: ${headingWarnings.length}`);
  console.log(`   Image issues: ${imageWarnings.length}`);
  console.log(`   Link issues: ${linkWarnings.length}`);
  console.log(`   Total issues: ${totalIssues}`);

  return {
    headingWarnings,
    imageWarnings,
    linkWarnings,
    totalIssues
  };
};

export default {
  updateBlogPostMetaTags,
  updateAuthorSchema,
  updateOrganizationSchema,
  validateHeadingHierarchy,
  validateImageAltText,
  validateInternalLinks,
  performSEOAudit
};
