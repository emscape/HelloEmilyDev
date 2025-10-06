#!/usr/bin/env node

/**
 * Blog Post Repair Tool
 * Fixes validation issues in existing blog posts
 */

const fs = require('fs');
const path = require('path');
const { validateBlogPost, validateJSON, sanitizeTitle } = require('./blog-validator.js');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const TEMPLATE_PATH = path.join(__dirname, '..', 'blog-post-template.html');
const SITE_BASE_URL = 'https://helloemily.dev';

/**
 * Colors for console output
 */
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Repairs all blog posts with validation issues
 */
async function repairAllPosts(dryRun = false) {
  console.log(`${colors.blue}${colors.bold}🔧 Blog Post Repair Tool${colors.reset}\n`);
  
  if (dryRun) {
    console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}\n`);
  }
  
  if (!fs.existsSync(BLOG_DIR)) {
    console.log(`${colors.red}❌ Blog directory not found: ${BLOG_DIR}${colors.reset}`);
    process.exit(1);
  }

  const results = { repaired: [], skipped: [], errors: [] };
  
  try {
    const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const postId = entry.name;
        const repairResult = await repairSinglePost(postId, dryRun);
        
        if (repairResult.repaired) {
          results.repaired.push(repairResult);
        } else if (repairResult.error) {
          results.errors.push(repairResult);
        } else {
          results.skipped.push(repairResult);
        }
      }
    }
  } catch (error) {
    console.log(`${colors.red}❌ Failed to read blog directory: ${error.message}${colors.reset}`);
    process.exit(1);
  }
  
  // Report results
  reportResults(results, dryRun);
  
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

/**
 * Repairs a single blog post
 */
async function repairSinglePost(postId, dryRun = false) {
  const postDir = path.join(BLOG_DIR, postId);
  const postDataPath = path.join(postDir, 'post-data.json');
  const htmlPath = path.join(postDir, 'index.html');
  
  const result = {
    postId,
    repaired: false,
    changes: [],
    error: null
  };
  
  try {
    // Check if post-data.json exists
    if (!fs.existsSync(postDataPath)) {
      result.error = 'Missing post-data.json file';
      return result;
    }
    
    // Load and validate JSON
    const jsonContent = fs.readFileSync(postDataPath, 'utf8');
    const jsonValidation = validateJSON(jsonContent);
    
    if (!jsonValidation.isValid) {
      result.error = `JSON Parse Error: ${jsonValidation.error}`;
      return result;
    }
    
    const postData = jsonValidation.data;
    const validation = validateBlogPost(postData, postId);
    
    // Check if repairs are needed
    let needsRepair = false;
    let repairedData = { ...postData };
    
    // Fix title if it has problematic characters
    if (postData.title) {
      const sanitizedTitle = sanitizeTitle(postData.title);
      if (sanitizedTitle !== postData.title) {
        repairedData.title = sanitizedTitle;
        result.changes.push(`Title: "${postData.title}" → "${sanitizedTitle}"`);
        needsRepair = true;
      }
    }
    
    // Fix description if it has problematic characters
    if (postData.shortDescription) {
      const sanitizedDesc = sanitizeTitle(postData.shortDescription);
      if (sanitizedDesc !== postData.shortDescription) {
        repairedData.shortDescription = sanitizedDesc;
        result.changes.push(`Description: Fixed problematic characters`);
        needsRepair = true;
      }
    }
    
    if (needsRepair) {
      result.repaired = true;
      
      if (!dryRun) {
        // Write repaired JSON
        fs.writeFileSync(postDataPath, JSON.stringify(repairedData, null, 2));
        
        // Regenerate HTML if template exists
        if (fs.existsSync(TEMPLATE_PATH) && fs.existsSync(htmlPath)) {
          await regenerateHTML(postId, repairedData);
          result.changes.push('Regenerated HTML file');
        }
      }
    }
    
  } catch (error) {
    result.error = `Repair Error: ${error.message}`;
  }
  
  return result;
}

/**
 * Regenerates HTML file for a blog post
 */
async function regenerateHTML(postId, postData) {
  const templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const postDir = path.join(BLOG_DIR, postId);
  const htmlPath = path.join(postDir, 'index.html');
  
  const postUrl = `${SITE_BASE_URL}/blog/${postId}/`;
  let featuredImageUrl = postData.featuredImage || '/images/site-preview.jpg';
  
  if (!featuredImageUrl.startsWith('http')) {
    if (!featuredImageUrl.startsWith('/')) {
      featuredImageUrl = `/${featuredImageUrl}`;
    }
    featuredImageUrl = SITE_BASE_URL + featuredImageUrl;
  }
  
  const html = templateContent
    .replace(/PAGE_TITLE_PLACEHOLDER/g, `${postData.title} | Emily Anderson`)
    .replace(/OG_TITLE_PLACEHOLDER/g, postData.title)
    .replace(/OG_URL_PLACEHOLDER/g, postUrl)
    .replace(/OG_DESCRIPTION_PLACEHOLDER/g, postData.shortDescription || 'A blog post by Emily Anderson.')
    .replace(/OG_IMAGE_PLACEHOLDER/g, featuredImageUrl);
  
  fs.writeFileSync(htmlPath, html);
}

/**
 * Reports repair results to console
 */
function reportResults(results, dryRun) {
  const totalPosts = results.repaired.length + results.skipped.length + results.errors.length;
  
  console.log(`${colors.bold}📊 Repair Summary${colors.reset}`);
  console.log(`Total posts processed: ${totalPosts}`);
  console.log(`${colors.green}🔧 ${dryRun ? 'Would repair' : 'Repaired'}: ${results.repaired.length}${colors.reset}`);
  console.log(`${colors.blue}⏭️  Skipped (no issues): ${results.skipped.length}${colors.reset}`);
  console.log(`${colors.red}❌ Errors: ${results.errors.length}${colors.reset}\n`);
  
  // Report repaired posts
  if (results.repaired.length > 0) {
    console.log(`${colors.green}${colors.bold}🔧 ${dryRun ? 'Posts that would be repaired' : 'Repaired posts'}:${colors.reset}`);
    for (const post of results.repaired) {
      console.log(`\n${colors.green}${post.postId}:${colors.reset}`);
      for (const change of post.changes) {
        console.log(`  • ${change}`);
      }
    }
    console.log();
  }
  
  // Report errors
  if (results.errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Posts with errors:${colors.reset}`);
    for (const post of results.errors) {
      console.log(`\n${colors.red}${post.postId}: ${post.error}${colors.reset}`);
    }
    console.log();
  }
  
  // Success message
  if (results.errors.length === 0) {
    if (results.repaired.length > 0) {
      console.log(`${colors.green}${colors.bold}🎉 ${dryRun ? 'Ready to repair' : 'Successfully repaired'} ${results.repaired.length} blog post(s)!${colors.reset}`);
    } else {
      console.log(`${colors.green}${colors.bold}✨ All blog posts are already in good shape!${colors.reset}`);
    }
  }
}

/**
 * CLI argument handling
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}Blog Post Repair Tool${colors.reset}

Usage: node scripts/repair-blog-posts.js [options]

Options:
  --dry-run, -n    Show what would be repaired without making changes
  --help, -h       Show this help message
  
This tool repairs common issues in blog posts:
• Sanitizes problematic characters in titles and descriptions
• Regenerates HTML files with corrected content
• Maintains backup of original data

Examples:
  node scripts/repair-blog-posts.js --dry-run    # Preview repairs
  node scripts/repair-blog-posts.js              # Apply repairs
`);
    return;
  }
  
  repairAllPosts(dryRun).catch(error => {
    console.error(`${colors.red}❌ Repair failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { repairAllPosts, repairSinglePost };
