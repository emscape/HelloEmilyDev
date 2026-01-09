/**
 * Update Blog Post - Regenerate from source markdown
 * Updates an already-published blog post by regenerating HTML and post-data.json
 * from the source markdown file without moving or archiving files
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');
const { optimizeImage } = require('./optimize-images');
const { validateBlogPost, validateJSON, sanitizeTitle } = require('./blog-validator.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  draftsProcessed: path.join(__dirname, '..', 'blog-drafts', 'processed'),
  blog: path.join(__dirname, '..', 'blog'),
  blogIndex: path.join(__dirname, '..', 'data', 'blog-index.json'),
  template: path.join(__dirname, '..', 'blog-drafts', 'new', 'blog-post-template.html')
};

const SITE_BASE_URL = 'https://helloemily.dev';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse YAML frontmatter and markdown content
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
 * Convert markdown to HTML
 */
function markdownToHtml(markdown) {
  return marked.parse(markdown);
}

/**
 * Normalize image path
 */
function normalizeImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return '';
  if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) {
    return imagePath;
  }
  return '/' + imagePath.replace(/^(\.\.\/|\.\/)+/, '');
}

/**
 * Create post data object
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
 * Write post data JSON file
 */
function writePostData(postDir, postData) {
  const postDataPath = path.join(postDir, 'post-data.json');
  fs.writeFileSync(postDataPath, JSON.stringify(postData, null, 2));
  console.log(`  ✓ Updated: ${postDataPath}`);
}

/**
 * Generate and write HTML file from template
 */
function writeHtmlFile(postDir, postData, templateContent) {
  const postUrl = `${SITE_BASE_URL}/blog/${postData.id}/`;
  let featuredImageUrl = postData.featuredImage || '/images/site-preview.jpg';
  
  let htmlContent = templateContent
    .replace(/{{title}}/g, postData.title)
    .replace(/{{description}}/g, postData.shortDescription)
    .replace(/{{content}}/g, postData.content)
    .replace(/{{author}}/g, postData.author)
    .replace(/{{date}}/g, postData.date)
    .replace(/{{url}}/g, postUrl)
    .replace(/{{image}}/g, featuredImageUrl)
    .replace(/{{og:title}}/g, postData.title)
    .replace(/{{og:description}}/g, postData.shortDescription)
    .replace(/{{og:image}}/g, `${SITE_BASE_URL}${featuredImageUrl}`);
  
  const indexPath = path.join(postDir, 'index.html');
  fs.writeFileSync(indexPath, htmlContent);
  console.log(`  ✓ Updated: ${indexPath}`);
}

/**
 * Update blog index entry
 */
function updateBlogIndexEntry(postData) {
  const indexPath = PATHS.blogIndex;
  
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Blog index not found: ${indexPath}`);
  }
  
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  
  // Find and update the entry
  const entryIndex = indexData.posts.findIndex(p => p.slug === `/blog/${postData.id}/`);
  
  if (entryIndex === -1) {
    throw new Error(`Post not found in blog index: /blog/${postData.id}/`);
  }
  
  indexData.posts[entryIndex] = {
    slug: `/blog/${postData.id}/`,
    title: postData.title,
    shortDescription: postData.shortDescription,
    date: postData.date,
    tags: postData.tags,
    featuredImage: postData.featuredImage,
    featured: postData.featured
  };
  
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`  ✓ Updated blog index`);
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

/**
 * Update an existing blog post from its source markdown
 * @param {string} filename - Markdown filename (e.g., 'my-post.md')
 */
async function updateBlogPost(filename) {
  console.log(`\nUpdating: ${filename}`);
  console.log('─'.repeat(60));

  try {
    // 1. Find the source markdown file
    const sourcePath = path.join(PATHS.draftsProcessed, filename);
    
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}\n(Make sure the .md file is in blog-drafts/processed/)`);
    }
    
    // 2. Read and parse markdown
    const fileContent = fs.readFileSync(sourcePath, 'utf8');
    const { metadata, content } = parseFrontmatter(fileContent);
    const slug = path.basename(sourcePath, '.md');
    console.log(`  ✓ Parsed frontmatter`);
    
    // 3. Verify blog post directory exists
    const postDir = path.join(PATHS.blog, slug);
    if (!fs.existsSync(postDir)) {
      throw new Error(`Blog post directory not found: ${postDir}\n(Post may not be published yet)`);
    }
    
    // 4. Convert markdown to HTML
    const contentHtml = markdownToHtml(content);
    console.log(`  ✓ Converted markdown to HTML`);
    
    // 5. Create post data
    const postData = createPostData(metadata, contentHtml, slug);
    
    // 6. Update post-data.json
    writePostData(postDir, postData);
    
    // 7. Update index.html
    const templateContent = fs.readFileSync(PATHS.template, 'utf8');
    writeHtmlFile(postDir, postData, templateContent);
    
    // 8. Optimize images if needed
    if (postData.featuredImage) {
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
    
    // 9. Update blog index
    updateBlogIndexEntry(postData);

    console.log('─'.repeat(60));
    console.log(`✅ Successfully updated: ${postData.title}`);
    console.log(`   URL: /blog/${slug}/\n`);
    
  } catch (error) {
    console.error(`\n❌ Error updating ${filename}:`, error.message);
    throw error;
  }
}

// ============================================================================
// CLI
// ============================================================================

if (require.main === module) {
  const filename = process.argv[2];

  if (!filename) {
    console.error('Usage: node update-blog-post.js <filename.md>');
    console.error('Example: node update-blog-post.js my-post.md');
    console.error('\nThis script regenerates index.html and post-data.json from the source markdown');
    console.error('without moving files or requiring re-approval.');
    process.exit(1);
  }

  updateBlogPost(filename).catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { updateBlogPost };
