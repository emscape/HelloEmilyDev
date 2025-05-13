/**
 * Markdown to Blog JSON Converter
 * 
 * This script converts markdown files from the blog-drafts folder
 * to the JSON format required by the blog system.
 * 
 * Usage: node js/md-to-blog.js [filename.md]
 * If no filename is provided, it will process all .md files in the blog-drafts folder
 * except for README.md.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directories
const DRAFTS_DIR = path.join(__dirname, '..', 'blog-drafts');
const BLOG_DATA_PATH = path.join(__dirname, '..', 'blog', 'blog-data.json');

/**
 * Parses a markdown file and extracts the metadata and content
 * @param {string} filePath - Path to the markdown file
 * @returns {Object} - Parsed blog post data
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Extract title (first line, remove # prefix)
  const title = lines[0].replace(/^#\s+/, '').trim();
  
  // Find metadata section
  const metadataStartIndex = lines.findIndex(line => line.trim() === '## Metadata');
  const shortDescStartIndex = lines.findIndex(line => line.trim() === '## Short Description');
  const contentStartIndex = lines.findIndex(line => line.trim() === '## Content');
  
  if (metadataStartIndex === -1 || shortDescStartIndex === -1 || contentStartIndex === -1) {
    throw new Error(`File ${filePath} does not have the required sections: ## Metadata, ## Short Description, and ## Content`);
  }
  
  // Extract metadata
  const metadataLines = lines.slice(metadataStartIndex + 1, shortDescStartIndex);
  const metadata = {};
  
  metadataLines.forEach(line => {
    const match = line.match(/^-\s+([^:]+):\s+(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();
      
      if (key === 'tags') {
        metadata.tags = value.split(',').map(tag => tag.trim());
      } else if (key === 'featured') {
        metadata.featured = value.toLowerCase() === 'true';
      } else {
        metadata[key] = value;
      }
    }
  });
  
  // Extract short description
  const shortDescription = lines
    .slice(shortDescStartIndex + 1, contentStartIndex)
    .filter(line => line.trim() !== '')
    .join(' ')
    .trim();
  
  // Extract content
  const contentLines = lines.slice(contentStartIndex + 1);
  const contentMarkdown = contentLines.join('\n').trim();
  
  // Convert markdown content to HTML (basic conversion)
  // Note: For a real implementation, you would use a proper markdown parser
  let contentHtml = convertMarkdownToHtml(contentMarkdown);
  
  // Generate an ID based on the title
  const id = generateIdFromTitle(title);
  
  return {
    id,
    title,
    shortDescription,
    content: contentHtml,
    author: metadata.author || 'Emily Anderson',
    date: metadata.date || new Date().toISOString().split('T')[0],
    tags: metadata.tags || [],
    featuredImage: metadata.featuredimage || metadata.featuredImage || '',
    featured: metadata.featured || false
  };
}

/**
 * Generates an ID from a title
 * @param {string} title - The blog post title
 * @returns {string} - A URL-friendly ID
 */
function generateIdFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

/**
 * Very basic markdown to HTML conversion
 * Note: This is a simplified version. For production, use a proper markdown parser
 * @param {string} markdown - Markdown content
 * @returns {string} - HTML content
 */
function convertMarkdownToHtml(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lists
  html = html.replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // Paragraphs
  html = html.replace(/^(?!<[a-z])/gm, '<p>');
  html = html.replace(/^(?!<\/[a-z]|$)/gm, '</p>');
  
  return html;
}

/**
 * Processes a single markdown file and adds it to the blog data
 * @param {string} filePath - Path to the markdown file
 * @param {Object} blogData - Current blog data
 * @returns {Object} - Updated blog data
 */
function processMarkdownFile(filePath, blogData) {
  try {
    console.log(`Processing ${filePath}...`);
    const post = parseMarkdownFile(filePath);
    
    // Check if post with same ID already exists
    const existingPostIndex = blogData.posts.findIndex(p => p.id === post.id);
    
    if (existingPostIndex !== -1) {
      // Update existing post
      blogData.posts[existingPostIndex] = post;
      console.log(`Updated existing post: ${post.title}`);
    } else {
      // Add new post
      blogData.posts.push(post);
      console.log(`Added new post: ${post.title}`);
    }
    
    return blogData;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return blogData;
  }
}

/**
 * Main function to process markdown files
 * @param {string} [specificFile] - Optional specific file to process
 */
function main(specificFile) {
  // Load existing blog data
  let blogData;
  try {
    const data = fs.readFileSync(BLOG_DATA_PATH, 'utf8');
    blogData = JSON.parse(data);
  } catch (error) {
    console.log('Creating new blog data file...');
    blogData = { posts: [] };
  }
  
  if (specificFile) {
    // Process specific file
    const filePath = path.join(DRAFTS_DIR, specificFile);
    if (fs.existsSync(filePath)) {
      blogData = processMarkdownFile(filePath, blogData);
    } else {
      console.error(`File not found: ${filePath}`);
      return;
    }
  } else {
    // Process all markdown files in the drafts directory
    const files = fs.readdirSync(DRAFTS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.md') && file !== 'README.md') {
        const filePath = path.join(DRAFTS_DIR, file);
        blogData = processMarkdownFile(filePath, blogData);
      }
    }
  }
  
  // Sort posts by date (newest first)
  blogData.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Save updated blog data
  fs.writeFileSync(BLOG_DATA_PATH, JSON.stringify(blogData, null, 2));
  console.log(`Blog data saved to ${BLOG_DATA_PATH}`);
  console.log(`Total posts: ${blogData.posts.length}`);
}

// Check if a specific file was provided as an argument
const specificFile = process.argv[2];
main(specificFile);