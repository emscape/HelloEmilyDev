#!/usr/bin/env node

/**
 * Blog Post Validation CLI Tool
 * Validates all blog posts and reports issues
 */

const fs = require('fs');
const path = require('path');

// Import validation utilities (CommonJS version)
const { validateBlogPost, validateJSON, sanitizeTitle } = require('./blog-validator.js');

const BLOG_DIR = path.join(__dirname, '..', 'blog');

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
 * Validates all blog posts and reports results
 */
async function validateAllPosts() {
  console.log(`${colors.blue}${colors.bold}🔍 Blog Post Validation${colors.reset}\n`);
  
  if (!fs.existsSync(BLOG_DIR)) {
    console.log(`${colors.red}❌ Blog directory not found: ${BLOG_DIR}${colors.reset}`);
    process.exit(1);
  }

  const results = { valid: [], invalid: [], warnings: [] };
  
  try {
    const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const postId = entry.name;
        const postResult = await validateSinglePost(postId);
        
        if (postResult.isValid) {
          results.valid.push(postResult);
        } else {
          results.invalid.push(postResult);
        }
        
        if (postResult.warnings && postResult.warnings.length > 0) {
          results.warnings.push(postResult);
        }
      }
    }
  } catch (error) {
    console.log(`${colors.red}❌ Failed to read blog directory: ${error.message}${colors.reset}`);
    process.exit(1);
  }
  
  // Report results
  reportResults(results);
  
  // Exit with error code if any posts are invalid
  if (results.invalid.length > 0) {
    process.exit(1);
  }
}

/**
 * Validates a single blog post
 */
async function validateSinglePost(postId) {
  const postDir = path.join(BLOG_DIR, postId);
  const postDataPath = path.join(postDir, 'post-data.json');
  const htmlPath = path.join(postDir, 'index.html');
  
  const result = {
    postId,
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check if post-data.json exists
  if (!fs.existsSync(postDataPath)) {
    result.isValid = false;
    result.errors.push('Missing post-data.json file');
    return result;
  }
  
  // Validate JSON syntax
  try {
    const jsonContent = fs.readFileSync(postDataPath, 'utf8');
    const jsonValidation = validateJSON(jsonContent);
    
    if (!jsonValidation.isValid) {
      result.isValid = false;
      result.errors.push(`JSON Parse Error: ${jsonValidation.error}`);
      return result;
    }
    
    // Validate blog post structure
    const postValidation = validateBlogPost(jsonValidation.data, postId);
    
    if (!postValidation.isValid) {
      result.isValid = false;
      result.errors.push(...postValidation.errors);
    }
    
    // Check for HTML file
    if (!fs.existsSync(htmlPath)) {
      result.warnings.push('Missing index.html file');
    } else {
      // Validate title consistency
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
      
      if (titleMatch) {
        const htmlTitle = titleMatch[1].replace(' | Emily Anderson', '');
        const jsonTitle = jsonValidation.data.title;
        
        if (htmlTitle !== jsonTitle) {
          result.warnings.push(`Title mismatch - JSON: "${jsonTitle}", HTML: "${htmlTitle}"`);
        }
      }
    }
    
    // Check for problematic characters that could be sanitized
    if (jsonValidation.data.title) {
      const sanitized = sanitizeTitle(jsonValidation.data.title);
      if (sanitized !== jsonValidation.data.title) {
        result.warnings.push(`Title could be sanitized: "${jsonValidation.data.title}" → "${sanitized}"`);
      }
    }
    
  } catch (error) {
    result.isValid = false;
    result.errors.push(`File Error: ${error.message}`);
  }
  
  return result;
}

/**
 * Reports validation results to console
 */
function reportResults(results) {
  const totalPosts = results.valid.length + results.invalid.length;
  
  console.log(`${colors.bold}📊 Validation Summary${colors.reset}`);
  console.log(`Total posts: ${totalPosts}`);
  console.log(`${colors.green}✅ Valid: ${results.valid.length}${colors.reset}`);
  console.log(`${colors.red}❌ Invalid: ${results.invalid.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  With warnings: ${results.warnings.length}${colors.reset}\n`);
  
  // Report invalid posts
  if (results.invalid.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Invalid Posts:${colors.reset}`);
    for (const post of results.invalid) {
      console.log(`\n${colors.red}${post.postId}:${colors.reset}`);
      for (const error of post.errors) {
        console.log(`  • ${error}`);
      }
    }
    console.log();
  }
  
  // Report warnings
  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Posts with warnings:${colors.reset}`);
    for (const post of results.warnings) {
      if (post.warnings && post.warnings.length > 0) {
        console.log(`\n${colors.yellow}${post.postId}:${colors.reset}`);
        for (const warning of post.warnings) {
          console.log(`  • ${warning}`);
        }
      }
    }
    console.log();
  }
  
  // Success message
  if (results.invalid.length === 0) {
    console.log(`${colors.green}${colors.bold}🎉 All blog posts are valid!${colors.reset}`);
  }
}

/**
 * CLI argument handling
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}Blog Post Validation Tool${colors.reset}

Usage: node scripts/validate-blog-posts.js [options]

Options:
  --help, -h    Show this help message
  
This tool validates all blog posts in the /blog directory and reports:
• JSON syntax errors
• Missing required fields
• Invalid date formats
• Problematic characters in titles
• Missing HTML files
• Title mismatches between JSON and HTML

Exit codes:
  0 - All posts are valid
  1 - One or more posts have validation errors
`);
    return;
  }
  
  validateAllPosts().catch(error => {
    console.error(`${colors.red}❌ Validation failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateAllPosts, validateSinglePost };
