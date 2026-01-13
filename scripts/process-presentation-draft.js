#!/usr/bin/env node

/**
 * Process Presentation Draft
 * Processes presentation metadata from markdown drafts and publishes to presentations/posted/
 * Similar structure to process-blog-draft.js but for presentations
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');
const { optimizeImage } = require('./optimize-images');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  draftsNew: path.join(__dirname, '..', 'presentations', 'drafts', 'new'),
  draftsProcessed: path.join(__dirname, '..', 'presentations', 'drafts', 'processed'),
  posted: path.join(__dirname, '..', 'presentations', 'posted'),
  dataIndex: path.join(__dirname, '..', 'presentations', 'presentations-data.json'),
  imagesDir: path.join(__dirname, '..', 'images', 'presentations')
};

// ============================================================================
// PURE FUNCTIONS - Metadata Parsing
// ============================================================================

/**
 * Parse YAML frontmatter from markdown content
 * @param {string} fileContent - Raw file content
 * @returns {Object} - { metadata, longDescription }
 */
function parseFrontmatter(fileContent) {
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);
  
  if (!match) {
    throw new Error('No YAML frontmatter found. File must start with --- and contain YAML metadata.');
  }
  
  const metadata = yaml.load(match[1]);
  const longDescription = match[2].trim();
  
  return { metadata, longDescription };
}

/**
 * Create presentation data entry
 * @param {string} filename - Presentation filename
 * @param {Object} metadata - YAML metadata
 * @param {string} longDescription - Description markdown
 * @returns {Object} - Presentation data entry
 */
function createPresentationData(filename, metadata, longDescription) {
  const slug = path.basename(filename, '.md');
  const pdfName = metadata.pdfPath || `${slug}.pdf`;
  
  const data = {
    pdfPath: `presentations/posted/${pdfName}`,
    thumbnail: metadata.thumbnail || `images/presentations/${slug}.png`,
    cardMarkdownPath: `presentations/posted/${slug}-card.md`,
    relatedBlogPostUrl: metadata.relatedBlogPostUrl || null,
    longDescriptionMarkdown: `---\ntitle: "${metadata.title}"\n---\n\n${longDescription}`
  };
  
  // Include order field if specified (for manual sorting)
  if (metadata.order !== undefined && metadata.order !== null) {
    data.order = metadata.order;
  }
  
  return data;
}

/**
 * Create card markdown file
 * @param {Object} metadata - YAML metadata
 * @param {string} longDescription - Description markdown
 * @returns {string} - Card markdown content
 */
function createCardMarkdown(metadata, longDescription) {
  return `---
title: "${metadata.title}"
${metadata.relatedBlogPostUrl ? `relatedBlogPostUrl: "${metadata.relatedBlogPostUrl}"` : ''}
${metadata.order !== undefined && metadata.order !== null ? `order: ${metadata.order}` : ''}
---

${longDescription}`;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate presentation metadata
 * @param {Object} metadata - YAML metadata
 * @param {string} slug - Presentation slug
 * @returns {Object} - { isValid, errors }
 */
function validatePresentation(metadata, slug) {
  const errors = [];
  
  if (!metadata.title) {
    errors.push('Missing required field: title');
  }
  
  if (!metadata.pdfPath && !metadata.pdfName) {
    errors.push('Missing required field: pdfPath or pdfName');
  }
  
  if (!metadata.thumbnail) {
    errors.push('Missing required field: thumbnail');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// INTERACTIVE APPROVAL
// ============================================================================

/**
 * Prompt user for approval with preview
 * @param {Object} presentationData - Presentation data to preview
 * @returns {Promise<boolean>} - User approval decision
 */
async function promptForApproval(presentationData) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n📋 PRESENTATION PREVIEW:');
  console.log('─'.repeat(60));
  console.log(`Title:        ${JSON.parse(presentationData.longDescriptionMarkdown.split('\n')[1]).title}`);
  console.log(`PDF Path:     ${presentationData.pdfPath}`);
  console.log(`Thumbnail:    ${presentationData.thumbnail}`);
  console.log(`Related Blog: ${presentationData.relatedBlogPostUrl || 'None'}`);
  console.log('─'.repeat(60));
  
  return new Promise(resolve => {
    rl.question('\n✅ Publish this presentation? (yes/no): ', answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Save presentation data to index
 * @param {Array} presentations - Array of presentation data
 */
function savePresentationsIndex(presentations) {
  // Sort by order field if present, otherwise keep insertion order
  presentations.sort((a, b) => {
    const aOrder = a.order !== undefined ? a.order : Infinity;
    const bOrder = b.order !== undefined ? b.order : Infinity;
    return aOrder - bOrder;
  });
  
  fs.writeFileSync(PATHS.dataIndex, JSON.stringify(presentations, null, 2));
  console.log(`  ✓ Updated presentations index (sorted by order field)`);
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
  console.log(`  ✓ Moved source to: presentations/drafts/processed/${filename}`);
}

/**
 * Rollback on error - remove entry from presentations data
 * @param {string} slug - Presentation slug
 */
function rollbackPresentationData(slug) {
  const data = JSON.parse(fs.readFileSync(PATHS.dataIndex, 'utf-8'));
  const filtered = data.filter(p => !p.pdfPath.includes(slug));
  
  if (filtered.length < data.length) {
    fs.writeFileSync(PATHS.dataIndex, JSON.stringify(filtered, null, 2));
    console.log(`  ⚠️  Rolled back: Removed from presentations index`);
  }
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

/**
 * Process a single presentation draft
 * @param {string} filename - Markdown filename
 * @param {boolean} skipApproval - Skip approval step
 */
async function processPresentationDraft(filename, skipApproval = false) {
  try {
    console.log(`\n📝 Processing: ${filename}`);
    console.log('─'.repeat(60));
    
    // Read and parse file
    const sourcePath = path.join(PATHS.draftsNew, filename);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`File not found: ${filename}`);
    }

    const fileContent = fs.readFileSync(sourcePath, 'utf-8');
    const { metadata, longDescription } = parseFrontmatter(fileContent);
    
    // Validate
    const slug = path.basename(filename, '.md');
    const validation = validatePresentation(metadata, slug);
    
    if (!validation.isValid) {
      console.log(`❌ Validation failed:`);
      validation.errors.forEach(error => console.log(`   • ${error}`));
      process.exit(1);
    }
    
    console.log(`  ✓ Validated presentation metadata`);
    
    // Create presentation data
    const presentationData = createPresentationData(filename, metadata, longDescription);
    
    // Approval step
    if (!skipApproval) {
      const approved = await promptForApproval(presentationData);
      if (!approved) {
        console.log('❌ Publication cancelled by user');
        process.exit(0);
      }
    }
    
    console.log(`  ✓ Approval granted`);
    
    // Create posted directory if needed
    if (!fs.existsSync(PATHS.posted)) {
      fs.mkdirSync(PATHS.posted, { recursive: true });
    }
    
    // Save card markdown
    const cardMarkdown = createCardMarkdown(metadata, longDescription);
    const cardPath = path.join(PATHS.posted, `${slug}-card.md`);
    fs.writeFileSync(cardPath, cardMarkdown);
    console.log(`  ✓ Created card: presentations/posted/${slug}-card.md`);
    
    // Update presentations data
    const presentations = JSON.parse(fs.readFileSync(PATHS.dataIndex, 'utf-8'));
    presentations.push(presentationData);
    savePresentationsIndex(presentations);
    
    // Optimize thumbnail image if it exists
    if (metadata.thumbnail) {
      const imagePath = path.join(__dirname, '..', metadata.thumbnail);
      if (fs.existsSync(imagePath)) {
        try {
          await optimizeImage(imagePath);
          console.log(`  ✓ Optimized thumbnail image`);
        } catch (err) {
          console.log(`  ⚠️  Could not optimize image: ${err.message}`);
        }
      }
    }
    
    // Move source to processed
    moveToProcessed(sourcePath, filename);
    
    console.log('─'.repeat(60));
    console.log(`✅ Successfully published presentation: ${metadata.title}`);
    console.log(`   Added to presentations index`);
    
    // 8. Optional: Submit to Google for indexing
    const submitToGoogle = process.argv.includes('--index');
    if (submitToGoogle) {
      console.log('\n📝 Submitting to Google Indexing API...');
      const indexingScript = path.join(__dirname, 'google-indexing-api.js');
      const presentationUrl = `https://helloemily.dev/presentations/${slug}/`;
      
      try {
        const { execSync } = require('child_process');
        execSync(`node "${indexingScript}" "${presentationUrl}"`, { stdio: 'inherit' });
        console.log('✓ Successfully submitted to Google\n');
      } catch (error) {
        console.log(`⚠️  Failed to submit to Google: ${error.message}\n`);
        console.log('You can manually index this presentation later with:');
        console.log(`  node scripts/google-indexing-api.js "https://helloemily.dev/presentations/${slug}/"\n`);
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Error processing presentation: ${error.message}`);
    
    // Attempt rollback
    const slug = path.basename(filename, '.md');
    rollbackPresentationData(slug);
    
    process.exit(1);
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage: node process-presentation-draft.js <filename> [--skip-approval]

Description:
  Processes a presentation draft from presentations/drafts/new/ and adds it 
  to the presentations index. Presentations are sorted by the optional 'order' 
  field in the metadata.

Arguments:
  <filename>         The markdown file (with .md extension) to process
  --skip-approval    Skip the approval prompt (useful for automation)

Example:
  npm run presentations:process my-presentation.md
  npm run presentations:process my-presentation.md --skip-approval
  npm run presentations:process my-presentation.md --index

Expected markdown format:
  ---
  title: "Presentation Title"
  pdfPath: "filename.pdf"
  thumbnail: "images/presentations/thumbnail.png"
  relatedBlogPostUrl: "/blog/post-slug/"
  order: 1
  ---
  
  Long description in markdown format...

Options:
  --skip-approval      Skip the approval step (auto-approve)
  --index              Submit to Google Indexing API after publishing

Notes:
  - The 'order' field is optional and controls sort position (lower numbers first)
  - Presentations without an order field appear last in insertion order
  - Use 'order' to manually reorder presentations without re-processing
  `);
  process.exit(0);
}

const filename = args[0];
const skipApproval = args.includes('--skip-approval');

processPresentationDraft(filename, skipApproval)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
