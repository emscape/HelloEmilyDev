/**
 * Blog Post Validator
 * Validates blog posts for:
 * - Broken links
 * - Missing images
 * - Invalid frontmatter
 * - Tag consistency
 * - File structure
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  blog: path.join(__dirname, '..', 'blog'),
  images: path.join(__dirname, '..', 'images'),
  blogIndex: path.join(__dirname, '..', 'data', 'blog-index.json')
};

// Valid tags (from existing posts) - case-insensitive
// To add new tags: add them to this set and the ALLOWED_TAGS_REFERENCE below
const VALID_TAGS = new Set([
  'AI', 'Python', 'python', 'JavaScript', 'javascript', 'Web Development', 'Tutorial',
  'Beginner', 'beginner', 'GameDev', 'gamedev', 'Pygame', 'pygame',
  'Developer Tools', 'Debugging', 'VS Code', 'Augment',
  'Emotional Labor', 'Side Projects', 'Tech Humor',
  'Wedding', 'Design', 'Ethics', 'Personal', 'JPL', 'Space', 'Knitting',
  'Patterns', 'Security', 'Privacy', 'Case Study', 'Wix', 'Puzzles',
  'Google I/O', 'Documentation', 'Technical Writing', 'Women in Tech',
  'Diversity', 'Inclusion', 'Education', 'Safety', 'Offline AI'
]);

// ALLOWED_TAGS_REFERENCE - organized by category for easier management
// Update VALID_TAGS set above when adding new tags here
const ALLOWED_TAGS_REFERENCE = {
  technology: ['AI', 'JavaScript', 'Python', 'Web Development', 'Developer Tools', 'VS Code', 'Offline AI'],
  content: ['Tutorial', 'Documentation', 'Technical Writing'],
  audience: ['Beginner', 'Women in Tech'],
  topics: ['GameDev', 'Pygame', 'Design', 'Ethics', 'Security', 'Privacy', 'Patterns', 'Debugging', 'Education', 'Safety'],
  projects: ['Side Projects', 'Wedding', 'Case Study', 'JPL', 'Space', 'Knitting', 'Wix', 'Puzzles'],
  tools: ['Augment', 'Google I/O'],
  personal: ['Emotional Labor', 'Tech Humor', 'Personal', 'Diversity', 'Inclusion']
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate frontmatter fields
 * @param {Object} metadata - YAML metadata
 * @param {string} filename - Filename for error messages
 * @returns {Array} - Array of validation errors
 */
function validateFrontmatter(metadata, filename) {
  const errors = [];
  
  // Required fields
  if (!metadata.title || metadata.title.trim() === '') {
    errors.push(`Missing or empty 'title' field`);
  }
  
  if (!metadata.date) {
    errors.push(`Missing 'date' field`);
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(metadata.date)) {
      errors.push(`Invalid date format: ${metadata.date} (expected YYYY-MM-DD)`);
    }
  }
  
  // Optional but recommended fields
  if (!metadata.shortDescription && !metadata.description) {
    errors.push(`Missing 'shortDescription' or 'description' field (recommended)`);
  }
  
  if (!metadata.tags || metadata.tags.length === 0) {
    errors.push(`Missing or empty 'tags' field (recommended)`);
  }
  
  // Validate tags
  if (metadata.tags && Array.isArray(metadata.tags)) {
    metadata.tags.forEach(tag => {
      if (!VALID_TAGS.has(tag)) {
        errors.push(`Unknown tag: '${tag}' (consider using existing tags)`);
      }
    });
  }
  
  return errors;
}

/**
 * Check if image file exists
 * @param {string} imagePath - Image path (root-relative)
 * @returns {boolean} - True if exists
 */
function imageExists(imagePath) {
  if (!imagePath) return false;
  
  // Remove leading slash
  const relativePath = imagePath.replace(/^\//, '');
  const fullPath = path.join(__dirname, '..', relativePath);
  
  return fs.existsSync(fullPath);
}

/**
 * Validate image paths
 * @param {Object} metadata - YAML metadata
 * @returns {Array} - Array of validation errors
 */
function validateImages(metadata) {
  const errors = [];
  
  if (metadata.featuredImage) {
    if (!imageExists(metadata.featuredImage)) {
      errors.push(`Featured image not found: ${metadata.featuredImage}`);
    } else {
      // Check if WebP version exists
      const webpPath = metadata.featuredImage.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      if (!imageExists(webpPath)) {
        errors.push(`WebP version not found: ${webpPath} (run optimize-images.js)`);
      }
    }
  }
  
  if (metadata.bannerImage) {
    if (!imageExists(metadata.bannerImage)) {
      errors.push(`Banner image not found: ${metadata.bannerImage}`);
    }
  }
  
  return errors;
}

/**
 * Extract and validate links from markdown content
 * @param {string} content - Markdown content
 * @returns {Array} - Array of validation warnings
 */
function validateLinks(content) {
  const warnings = [];
  
  // Find all markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    
    // Check internal links
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      const relativePath = url.replace(/^\//, '');
      const fullPath = path.join(__dirname, '..', relativePath);
      
      if (!fs.existsSync(fullPath)) {
        warnings.push(`Broken internal link: ${url}`);
      }
    }
    
    // Check for common issues
    if (url.includes(' ')) {
      warnings.push(`Link contains spaces: ${url} (should be URL-encoded)`);
    }
  }
  
  return warnings;
}

/**
 * Validate post directory structure
 * @param {string} postSlug - Post slug
 * @returns {Array} - Array of validation errors
 */
function validatePostStructure(postSlug) {
  const errors = [];
  const postDir = path.join(PATHS.blog, postSlug);
  
  if (!fs.existsSync(postDir)) {
    errors.push(`Post directory not found: ${postDir}`);
    return errors;
  }
  
  // Check for required files
  const postDataPath = path.join(postDir, 'post-data.json');
  if (!fs.existsSync(postDataPath)) {
    errors.push(`Missing post-data.json`);
  }
  
  const indexHtmlPath = path.join(postDir, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    errors.push(`Missing index.html`);
  }
  
  return errors;
}

/**
 * Validate blog index consistency
 * @param {string} postSlug - Post slug
 * @returns {Array} - Array of validation errors
 */
function validateBlogIndex(postSlug) {
  const errors = [];
  
  if (!fs.existsSync(PATHS.blogIndex)) {
    errors.push(`Blog index not found: ${PATHS.blogIndex}`);
    return errors;
  }
  
  const indexData = JSON.parse(fs.readFileSync(PATHS.blogIndex, 'utf8'));
  const postEntry = indexData.posts.find(p => p.slug === `/blog/${postSlug}/`);
  
  if (!postEntry) {
    errors.push(`Post not found in blog-index.json`);
  }
  
  return errors;
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

/**
 * Validate a markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {Object} - Validation results
 */
function validateMarkdownFile(filePath) {
  const filename = path.basename(filePath);
  const slug = path.basename(filePath, '.md');
  
  console.log(`\nValidating: ${filename}`);
  console.log('─'.repeat(60));
  
  const results = {
    filename,
    slug,
    errors: [],
    warnings: [],
    valid: true
  };
  
  try {
    // Read file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
    const match = fileContent.match(frontmatterRegex);
    
    if (!match) {
      results.errors.push('No YAML frontmatter found');
      results.valid = false;
      return results;
    }
    
    const metadata = yaml.load(match[1]);
    const content = match[2];
    
    // Run validations
    results.errors.push(...validateFrontmatter(metadata, filename));
    results.errors.push(...validateImages(metadata));
    results.warnings.push(...validateLinks(content));
    
    // If post is already published, check structure
    const postDir = path.join(PATHS.blog, slug);
    if (fs.existsSync(postDir)) {
      results.errors.push(...validatePostStructure(slug));
      results.errors.push(...validateBlogIndex(slug));
    }
    
    results.valid = results.errors.length === 0;
    
  } catch (error) {
    results.errors.push(`Validation error: ${error.message}`);
    results.valid = false;
  }
  
  return results;
}

/**
 * Print validation results
 * @param {Object} results - Validation results
 */
function printResults(results) {
  if (results.valid) {
    console.log('✅ VALID - No errors found');
  } else {
    console.log('❌ INVALID - Errors found:');
    results.errors.forEach(error => {
      console.log(`   • ${error}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }
  
  console.log('─'.repeat(60));
}

// ============================================================================
// CLI
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node validate-blog-post.js <markdown-file>');
    console.log('Example: node validate-blog-post.js blog-drafts/new/my-post.md');
    process.exit(1);
  }
  
  const filePath = path.resolve(args[0]);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  const results = validateMarkdownFile(filePath);
  printResults(results);
  
  process.exit(results.valid ? 0 : 1);
}

module.exports = { validateMarkdownFile };

