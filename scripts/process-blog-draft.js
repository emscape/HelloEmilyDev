/**
 * Process Blog Draft - Modular Version
 * Processes a single markdown file from blog-drafts/new/ and adds it to the blog
 * Uses marked library for markdown parsing
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');
const readline = require('readline');
const { validateMarkdownFile } = require('./validate-blog-post');
const { optimizeImage } = require('./optimize-images');

// Import our new validation utilities
const { validateBlogPost, validateJSON, sanitizeTitle } = require('./blog-validator.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  draftsNew: path.join(__dirname, '..', 'blog-drafts', 'new'),
  draftsProcessed: path.join(__dirname, '..', 'blog-drafts', 'processed'),
  blog: path.join(__dirname, '..', 'blog'),
  blogIndex: path.join(__dirname, '..', 'data', 'blog-index.json'),
  template: path.join(__dirname, '..', 'blog-drafts', 'new', 'blog-post-template.html')
};

const SITE_BASE_URL = 'https://helloemily.dev';

// ============================================================================
// PURE FUNCTIONS - Markdown Parsing
// ============================================================================

/**
 * Parse YAML frontmatter and markdown content
 * @param {string} fileContent - Raw file content
 * @returns {Object} - { metadata, content }
 */
function parseFrontmatter(fileContent) {
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    throw new Error('No YAML frontmatter found');
  }
  
  const metadata = yaml.load(match[1]);
  const content = match[2].trim();
  
  return { metadata, content };
}

/**
 * Convert markdown to HTML using marked
 * @param {string} markdown - Markdown content
 * @returns {string} - HTML content
 */
function markdownToHtml(markdown) {
  return marked.parse(markdown);
}

/**
 * Normalize image path to be root-relative
 * @param {string} imagePath - Image path
 * @returns {string} - Normalized path
 */
function normalizeImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return '';
  if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) {
    return imagePath;
  }
  return '/' + imagePath.replace(/^(\.\.\/|\.\/)+/, '');
}

/**
 * Create post data object from metadata and content
 * @param {Object} metadata - YAML metadata
 * @param {string} contentHtml - HTML content
 * @param {string} slug - Post slug
 * @returns {Object} - Post data
 */
function createPostData(metadata, contentHtml, slug) {
  return {
    id: slug,
    title: metadata.title || slug,
    shortDescription: metadata.shortDescription || metadata.description || '',
    content: contentHtml,
    author: metadata.author || 'Emily Anderson',
    date: metadata.date || new Date().toISOString().split('T')[0],
    tags: metadata.tags || [],
    featuredImage: normalizeImagePath(metadata.featuredImage || ''),
    featured: metadata.featured || false
  };
}

/**
 * Create blog index entry from post data
 * @param {Object} postData - Full post data
 * @returns {Object} - Index entry
 */
function createIndexEntry(postData) {
  return {
    slug: `/blog/${postData.id}/`,
    title: postData.title,
    shortDescription: postData.shortDescription,
    date: postData.date,
    tags: postData.tags,
    featuredImage: postData.featuredImage,
    featured: postData.featured
  };
}

// ============================================================================
// APPROVAL SYSTEM
// ============================================================================

/**
 * Prompt user for proofreading approval
 * @param {Object} postData - Post data for preview
 * @returns {Promise<boolean>} - True if approved, false if rejected
 */
function promptForApproval(postData) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n' + '═'.repeat(60));
    console.log('📋 PROOFREADING REQUIRED');
    console.log('═'.repeat(60));
    console.log(`\nTitle: ${postData.title}`);
    console.log(`Date: ${postData.date}`);
    console.log(`Featured: ${postData.featured ? '✓ Yes' : '✗ No'}`);
    console.log(`Tags: ${postData.tags.join(', ')}`);
    console.log(`\nShort Description:\n${postData.shortDescription}`);
    console.log('\n' + '─'.repeat(60));
    console.log('First 300 characters of content:');
    console.log('─'.repeat(60));
    const preview = postData.content.replace(/<[^>]*>/g, '').substring(0, 300);
    console.log(preview + (postData.content.length > 300 ? '...' : ''));
    console.log('─'.repeat(60));

    rl.question('\n✅ Approve and publish this post? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Read and parse markdown file
 * @param {string} filePath - Path to markdown file
 * @returns {Object} - { metadata, content, slug }
 */
function readMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { metadata, content } = parseFrontmatter(fileContent);
  const slug = path.basename(filePath, '.md');
  
  return { metadata, content, slug };
}

/**
 * Write post data JSON file
 * @param {string} postDir - Post directory path
 * @param {Object} postData - Post data
 */
function writePostData(postDir, postData) {
  const postDataPath = path.join(postDir, 'post-data.json');
  fs.writeFileSync(postDataPath, JSON.stringify(postData, null, 2));
  console.log(`  ✓ Wrote: ${postDataPath}`);
}

/**
 * Generate and write HTML file from template
 * @param {string} postDir - Post directory path
 * @param {Object} postData - Post data
 * @param {string} templateContent - HTML template
 */
function writeHtmlFile(postDir, postData, templateContent) {
  const postUrl = `${SITE_BASE_URL}/blog/${postData.id}/`;
  let featuredImageUrl = postData.featuredImage || '/images/site-preview.jpg';
  
  if (!featuredImageUrl.startsWith('http')) {
    if (!featuredImageUrl.startsWith('/')) {
      featuredImageUrl = `/${featuredImageUrl}`;
    }
    featuredImageUrl = SITE_BASE_URL + featuredImageUrl;
  }
  
  // Validate and sanitize the post data before HTML generation
  const validation = validateBlogPost(postData, postData.id);
  if (!validation.isValid) {
    console.log(`  ⚠️  Validation warnings for ${postData.id}:`);
    validation.errors.forEach(error => console.log(`     • ${error}`));
  }

  // Sanitize title for safe HTML usage
  const safeTitle = sanitizeTitle(postData.title);
  const safeDescription = postData.shortDescription ?
    sanitizeTitle(postData.shortDescription) : 'A blog post by Emily Anderson.';

  if (safeTitle !== postData.title) {
    console.log(`  🔧 Sanitized title: "${postData.title}" → "${safeTitle}"`);
  }

  const html = templateContent
    .replace(/PAGE_TITLE_PLACEHOLDER/g, `${safeTitle} | Emily Anderson`)
    .replace(/OG_TITLE_PLACEHOLDER/g, safeTitle)
    .replace(/OG_URL_PLACEHOLDER/g, postUrl)
    .replace(/OG_DESCRIPTION_PLACEHOLDER/g, safeDescription)
    .replace(/OG_IMAGE_PLACEHOLDER/g, featuredImageUrl);
  
  const htmlPath = path.join(postDir, 'index.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`  ✓ Wrote: ${htmlPath}`);
}

/**
 * Move processed markdown file
 * @param {string} sourcePath - Source file path
 * @param {string} filename - Filename
 */
function moveToProcessed(sourcePath, filename) {
  if (!fs.existsSync(PATHS.draftsProcessed)) {
    fs.mkdirSync(PATHS.draftsProcessed, { recursive: true });
  }
  
  const destPath = path.join(PATHS.draftsProcessed, filename);
  fs.renameSync(sourcePath, destPath);
  console.log(`  ✓ Moved to: ${destPath}`);
}

// ============================================================================
// BLOG INDEX OPERATIONS
// ============================================================================

/**
 * Read existing blog index
 * @returns {Array} - Array of post entries
 */
function readBlogIndex() {
  if (!fs.existsSync(PATHS.blogIndex)) {
    return [];
  }
  
  const indexData = JSON.parse(fs.readFileSync(PATHS.blogIndex, 'utf8'));
  return indexData.posts || [];
}

/**
 * Update blog index with new post
 * @param {Object} newEntry - New index entry
 */
function updateBlogIndex(newEntry) {
  let posts = readBlogIndex();
  
  // Remove existing entry if it exists
  posts = posts.filter(p => p.slug !== newEntry.slug);
  
  // Add new entry
  posts.push(newEntry);
  
  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Write back
  fs.writeFileSync(PATHS.blogIndex, JSON.stringify({ posts }, null, 2));
  console.log(`  ✓ Updated blog index (${posts.length} posts)`);
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

/**
 * Process a single blog draft
 * @param {string} filename - Markdown filename (e.g., 'my-post.md')
 * @param {Object} options - Processing options
 */
async function processBlogDraft(filename, options = {}) {
  const { skipValidation = false, skipOptimization = false, skipApproval = false } = options;

  console.log(`\nProcessing: ${filename}`);
  console.log('─'.repeat(60));

  // Track created resources for rollback on failure
  const createdResources = {
    postDir: null,
    indexUpdated: false
  };

  try {
    // 0. Validate markdown file
    if (!skipValidation) {
      const sourcePath = path.join(PATHS.draftsNew, filename);
      const validationResults = validateMarkdownFile(sourcePath);

      if (!validationResults.valid) {
        console.log('  ❌ Validation failed:');
        validationResults.errors.forEach(error => {
          console.log(`     • ${error}`);
        });
        throw new Error('Validation failed. Fix errors and try again.');
      }

      if (validationResults.warnings.length > 0) {
        console.log('  ⚠️  Validation warnings:');
        validationResults.warnings.forEach(warning => {
          console.log(`     • ${warning}`);
        });
      }

      console.log(`  ✓ Validation passed`);
    }

    // 1. Read and parse markdown
    const sourcePath = path.join(PATHS.draftsNew, filename);
    const { metadata, content, slug } = readMarkdownFile(sourcePath);
    console.log(`  ✓ Parsed frontmatter`);
    
    // 2. Convert markdown to HTML
    const contentHtml = markdownToHtml(content);
    console.log(`  ✓ Converted markdown to HTML`);
    
    // 3. Create post data
    const postData = createPostData(metadata, contentHtml, slug);
    
    // 3.5 PROOFREADING STEP - Request approval before publishing
    if (!skipApproval) {
      const approved = await promptForApproval(postData);
      if (!approved) {
        console.log('\n❌ Post rejected. Not publishing. File remains in blog-drafts/new for editing.\n');
        return;
      }
      console.log('\n✅ Post approved for publishing\n');
    } else {
      console.log('  ⊘ Skipping approval (--skip-approval)');
    }
    
    // 4. Create post directory
    const postDir = path.join(PATHS.blog, slug);
    const postDirExists = fs.existsSync(postDir);
    
    if (!postDirExists) {
      fs.mkdirSync(postDir, { recursive: true });
      createdResources.postDir = postDir;
      console.log(`  ✓ Created directory: ${postDir}`);
    } else {
      throw new Error(`Post directory already exists: ${postDir}. Please delete it or use a different slug.`);
    }
    
    // 5. Write post-data.json
    writePostData(postDir, postData);
    
    // 6. Generate and write index.html
    const templateContent = fs.readFileSync(PATHS.template, 'utf8');
    writeHtmlFile(postDir, postData, templateContent);
    
    // 7. Optimize images
    if (!skipOptimization && postData.featuredImage) {
      const imagePath = postData.featuredImage.replace(/^\//, '');
      const fullImagePath = path.join(__dirname, '..', imagePath);

      if (fs.existsSync(fullImagePath)) {
        console.log(`  ⚙️  Optimizing featured image...`);
        try {
          await optimizeImage(fullImagePath);
        } catch (error) {
          console.log(`  ⚠️  Image optimization failed: ${error.message}`);
        }
      }
    }

    // 8. Update blog index
    const indexEntry = createIndexEntry(postData);
    updateBlogIndex(indexEntry);
    createdResources.indexUpdated = true;

    // 9. Move markdown to processed
    moveToProcessed(sourcePath, filename);

    console.log('─'.repeat(60));
    console.log(`✅ Successfully processed: ${postData.title}`);
    console.log(`   URL: /blog/${slug}/\n`);
    
  } catch (error) {
    console.error(`\n❌ Error processing ${filename}:`, error.message);
    
    // Rollback on failure
    console.log('\n🔄 Rolling back changes...');
    
    if (createdResources.postDir && fs.existsSync(createdResources.postDir)) {
      fs.rmSync(createdResources.postDir, { recursive: true, force: true });
      console.log(`  ✓ Removed directory: ${createdResources.postDir}`);
    }
    
    if (createdResources.indexUpdated) {
      try {
        const slug = path.basename(createdResources.postDir, '');
        const indexData = JSON.parse(fs.readFileSync(PATHS.blogIndex, 'utf8'));
        indexData.posts = indexData.posts.filter(p => p.slug !== `/blog/${slug}/`);
        fs.writeFileSync(PATHS.blogIndex, JSON.stringify(indexData, null, 2));
        console.log(`  ✓ Removed entry from blog-index.json`);
      } catch (rollbackError) {
        console.warn(`  ⚠️  Could not rollback blog index: ${rollbackError.message}`);
      }
    }
    
    console.log('✅ Rollback complete\n');
    throw error;
  }
}

// ============================================================================
// CLI
// ============================================================================

if (require.main === module) {
  const filename = process.argv[2];

  if (!filename) {
    console.error('Usage: node process-blog-draft.js <filename.md> [--skip-validation] [--skip-optimization] [--skip-approval]');
    console.error('Example: node process-blog-draft.js my-post.md');
    console.error('Options:');
    console.error('  --skip-validation    Skip validation step');
    console.error('  --skip-optimization  Skip image optimization');
    console.error('  --skip-approval      Skip proofreading approval (auto-approve)');
    process.exit(1);
  }

  const options = {
    skipValidation: process.argv.includes('--skip-validation'),
    skipOptimization: process.argv.includes('--skip-optimization'),
    skipApproval: process.argv.includes('--skip-approval')
  };

  processBlogDraft(filename, options).catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { processBlogDraft };

