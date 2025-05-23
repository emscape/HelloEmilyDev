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
const BLOG_INDEX_PATH = path.join(__dirname, '..', 'blog-index.json'); // Corrected path for the main index
const POST_FILES_DIR = path.join(__dirname, '..', 'blog-data'); // Path for individual post JSON files
const PROCESSED_DRAFTS_DIR = path.join(DRAFTS_DIR, 'processed'); // Directory for processed markdown files

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
 * @param {Object} indexData - Current blog index data
 * @returns {Object} - Updated blog index data
 */
function processMarkdownFile(filePath, indexData) {
  try {
    console.log(`Processing ${filePath}...`);
    const fullPostData = parseMarkdownFile(filePath); // This contains the full post, including content

    // Ensure POST_FILES_DIR exists
    if (!fs.existsSync(POST_FILES_DIR)) {
      fs.mkdirSync(POST_FILES_DIR, { recursive: true });
      console.log(`Created directory: ${POST_FILES_DIR}`);
    }

    // Save the full post data to its individual JSON file in blog-data/
    const individualPostPath = path.join(POST_FILES_DIR, `${fullPostData.id}.json`);
    fs.writeFileSync(individualPostPath, JSON.stringify(fullPostData, null, 2));
    console.log(`Saved full post to: ${individualPostPath}`);

    // Prepare metadata for the blog-index.json
    const postMetadata = {
      slug: fullPostData.id, // 'id' from parseMarkdownFile is the slug
      title: fullPostData.title,
      shortDescription: fullPostData.shortDescription,
      // author: fullPostData.author, // blog-index.json doesn't currently store author
      date: fullPostData.date,
      tags: fullPostData.tags,
      featuredImage: fullPostData.featuredImage,
      featured: fullPostData.featured
    };
    
    // Check if post with same slug already exists in the index
    const existingPostIndex = indexData.posts.findIndex(p => p.slug === postMetadata.slug);
    
    if (existingPostIndex !== -1) {
      // Update existing post metadata in the index
      indexData.posts[existingPostIndex] = postMetadata;
      console.log(`Updated post metadata in index: ${postMetadata.title}`);
    } else {
      // Add new post metadata to the index
      indexData.posts.push(postMetadata);
      console.log(`Added new post metadata to index: ${postMetadata.title}`);
    }
    
    // Move the processed markdown file
    if (!fs.existsSync(PROCESSED_DRAFTS_DIR)) {
      fs.mkdirSync(PROCESSED_DRAFTS_DIR, { recursive: true });
      console.log(`Created directory: ${PROCESSED_DRAFTS_DIR}`);
    }
    const processedFilePath = path.join(PROCESSED_DRAFTS_DIR, path.basename(filePath));
    fs.renameSync(filePath, processedFilePath);
    console.log(`Moved processed markdown file to: ${processedFilePath}`);

    return indexData;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    // If there was an error, do not move the file, return original indexData
    return indexData;
  }
}

/**
 * Main function to process markdown files
 * @param {string} [specificFile] - Optional specific file to process
 */
function main(specificFile) {
  // Load existing blog data
  let indexData;
  try {
    const data = fs.readFileSync(BLOG_INDEX_PATH, 'utf8');
    indexData = JSON.parse(data);
  } catch (error) {
    console.log(`Creating new blog index file at ${BLOG_INDEX_PATH}...`);
    indexData = { posts: [] };
  }
  
  if (specificFile) {
    // Process specific file
    const filePath = path.join(DRAFTS_DIR, specificFile);
    if (fs.existsSync(filePath)) {
      indexData = processMarkdownFile(filePath, indexData);
    } else {
      console.error(`File not found: ${filePath}`);
      return;
    }
  } else {
    // Process all markdown files in the drafts directory
    const files = fs.readdirSync(DRAFTS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.md') && file !== 'README.md' && file !== 'blog-post-template.md') { // Exclude template
        const filePath = path.join(DRAFTS_DIR, file);
        indexData = processMarkdownFile(filePath, indexData);
      }
    }
  }
  
  // Sort posts by date (newest first) in the index
  indexData.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Save updated blog index
  fs.writeFileSync(BLOG_INDEX_PATH, JSON.stringify(indexData, null, 2));
  console.log(`Blog index saved to ${BLOG_INDEX_PATH}`);
  console.log(`Total posts in index: ${indexData.posts.length}`);
}

// Check if a specific file was provided as an argument
const specificFile = process.argv[2];
main(specificFile);