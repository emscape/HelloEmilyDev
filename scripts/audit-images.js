#!/usr/bin/env node

/**
 * Image Alt Text Audit Script for HelloEmily.dev
 * Scans all blog post data and main pages for image metadata
 * Generates recommendations for improving alt text
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Generate descriptive alt text based on image path and context
 */
function generateAltText(imageName, context = '') {
  const baseName = imageName.split('/').pop().replace(/\.[^/.]+$/, '');
  const readableName = baseName
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

  if (/featured|hero|cover|banner|main/.test(readableName)) {
    return `Featured image: ${context || readableName}`;
  }

  return context 
    ? `${context} - ${readableName}`
    : readableName;
}

/**
 * Read all blog post data files
 */
function getBlogPosts() {
  const blogDir = path.join(__dirname, '..', 'blog');
  const posts = [];

  const subdirs = fs.readdirSync(blogDir).filter(file => {
    return fs.statSync(path.join(blogDir, file)).isDirectory();
  });

  subdirs.forEach(subdir => {
    const dataFile = path.join(blogDir, subdir, 'post-data.json');
    if (fs.existsSync(dataFile)) {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      posts.push({
        slug: subdir,
        title: data.title,
        featuredImage: data.featuredImage,
        additionalImages: data.additionalImages || []
      });
    }
  });

  return posts;
}

/**
 * Audit images in HTML files
 */
function auditHTMLImages() {
  const pagesDir = path.join(__dirname, '..', 'pages');
  const htmlFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
  const results = [];

  htmlFiles.forEach(file => {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all img tags
    const imgRegex = /<img[^>]*>/g;
    const matches = content.match(imgRegex) || [];

    matches.forEach((img, idx) => {
      const srcMatch = img.match(/src="([^"]+)"/);
      const altMatch = img.match(/alt="([^"]*)"/);
      
      if (srcMatch) {
        results.push({
          file: file,
          image: idx + 1,
          src: srcMatch[1],
          alt: altMatch ? altMatch[1] : null,
          hasAlt: !!altMatch
        });
      }
    });
  });

  return results;
}

/**
 * Main audit function
 */
function runAudit() {
  console.log(`\n${colors.bold}${colors.cyan}📊 IMAGE ALT TEXT AUDIT REPORT${colors.reset}\n`);
  
  // Audit blog posts
  console.log(`${colors.bold}BLOG POSTS${colors.reset}`);
  console.log('─'.repeat(80));
  
  const posts = getBlogPosts();
  let blogIssues = 0;
  let blogPassed = 0;

  posts.forEach(post => {
    console.log(`\n📝 ${post.title}`);
    console.log(`   Slug: /blog/${post.slug}/`);
    
    if (post.featuredImage) {
      const alt = generateAltText(post.featuredImage, post.title);
      console.log(`   Featured Image: ${post.featuredImage}`);
      console.log(`   ${colors.green}✓ Suggested alt text:${colors.reset} "${alt}"`);
      console.log(`   ${colors.green}✓ Length: ${alt.length} chars${colors.reset}`);
      blogPassed++;
    } else {
      console.log(`   ${colors.red}✗ No featured image${colors.reset}`);
      blogIssues++;
    }

    if (post.additionalImages && post.additionalImages.length > 0) {
      console.log(`   Additional images: ${post.additionalImages.length}`);
      post.additionalImages.forEach((img, idx) => {
        const alt = generateAltText(img, `${post.title} - Image ${idx + 2}`);
        console.log(`     - Image ${idx + 2}: ${alt}`);
      });
    }
  });

  console.log(`\n${colors.bold}HTML PAGES${colors.reset}`);
  console.log('─'.repeat(80));
  
  const htmlImages = auditHTMLImages();
  let pageIssues = 0;
  let pagePassed = 0;

  const groupedByFile = {};
  htmlImages.forEach(img => {
    if (!groupedByFile[img.file]) {
      groupedByFile[img.file] = [];
    }
    groupedByFile[img.file].push(img);
  });

  Object.entries(groupedByFile).forEach(([file, images]) => {
    console.log(`\n📄 ${file}`);
    images.forEach(img => {
      if (!img.hasAlt) {
        console.log(`   ${colors.red}✗ Image ${img.image}: NO ALT TEXT${colors.reset}`);
        console.log(`     Source: ${img.src}`);
        pageIssues++;
      } else if (!img.alt.trim()) {
        console.log(`   ${colors.yellow}⚠ Image ${img.image}: EMPTY ALT TEXT${colors.reset}`);
        console.log(`     Source: ${img.src}`);
        pageIssues++;
      } else if (img.alt.length > 125) {
        console.log(`   ${colors.yellow}⚠ Image ${img.image}: ALT TEXT TOO LONG (${img.alt.length} chars)${colors.reset}`);
        console.log(`     Current: "${img.alt.substring(0, 50)}..."`);
        pageIssues++;
      } else {
        console.log(`   ${colors.green}✓ Image ${img.image}: "${img.alt.substring(0, 60)}..."${colors.reset}`);
        pagePassed++;
      }
    });
  });

  // Summary
  console.log(`\n${colors.bold}${'─'.repeat(80)}${colors.reset}`);
  console.log(`${colors.bold}SUMMARY${colors.reset}`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`Blog posts:    ${colors.green}${blogPassed} ✓${colors.reset} | ${colors.red}${blogIssues} ✗${colors.reset}`);
  console.log(`HTML images:   ${colors.green}${pagePassed} ✓${colors.reset} | ${colors.red}${pageIssues} ✗${colors.reset}`);
  
  const totalPassed = blogPassed + pagePassed;
  const totalIssues = blogIssues + pageIssues;
  const percentage = totalPassed + totalIssues > 0 
    ? Math.round((totalPassed / (totalPassed + totalIssues)) * 100)
    : 0;

  console.log(`\n${colors.bold}Total: ${totalPassed + totalIssues} images analyzed${colors.reset}`);
  console.log(`Pass rate: ${colors.green}${percentage}%${colors.reset}\n`);

  // Recommendations
  if (totalIssues > 0) {
    console.log(`${colors.yellow}${colors.bold}💡 RECOMMENDATIONS:${colors.reset}`);
    console.log(`\n1. Priority: Add alt text to ${colors.red}${pageIssues} images${colors.reset} with missing text`);
    console.log(`2. Review: Shorten ${colors.yellow}alt text${colors.reset} that exceeds 125 characters`);
    console.log(`3. Enhancement: Use the suggested alt text patterns in this report`);
    console.log(`\n📚 Alt text best practices:`);
    console.log(`   • Describe the image content, not just "image" or "photo"`);
    console.log(`   • Keep between 50-125 characters`);
    console.log(`   • For featured images: "Featured image: [Post Title]"`);
    console.log(`   • For diagrams: describe the data or concept shown`);
    console.log(`   • For screenshots: include what's being shown\n`);
  }
}

// Run the audit
runAudit();
