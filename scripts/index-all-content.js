#!/usr/bin/env node

/**
 * Index All Content - Master Indexing Script
 * Submits all pages, blog posts, projects, and presentations to Google Indexing API
 * 
 * Usage:
 *   node scripts/index-all-content.js         # Index everything
 *   node scripts/index-all-content.js --blogs # Index only blogs
 *   node scripts/index-all-content.js --pages # Index only main pages
 *   node scripts/index-all-content.js --projects # Index only projects
 *   node scripts/index-all-content.js --presentations # Index only presentations
 *   node scripts/index-all-content.js --dry-run # Show what would be submitted
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SITE_BASE_URL = 'https://helloemily.dev';

const PATHS = {
  blogIndex: path.join(__dirname, '..', 'data', 'blog-index.json'),
  projectsData: path.join(__dirname, '..', 'projects', 'projects-data.json'),
  presentationsData: path.join(__dirname, '..', 'presentations', 'presentations-data.json'),
  indexingScript: path.join(__dirname, 'google-indexing-api.js')
};

const MAIN_PAGES = [
  '/',
  '/pages/blog-archive.html',
  '/pages/projects.html',
  '/pages/presentations.html',
  '/pages/resume.html',
  '/pages/contact.html'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all blog post URLs
 */
function getBlogPostUrls() {
  try {
    if (!fs.existsSync(PATHS.blogIndex)) {
      console.warn('⚠️  Blog index not found');
      return [];
    }

    const indexData = JSON.parse(fs.readFileSync(PATHS.blogIndex, 'utf8'));
    return (indexData.posts || []).map(post => {
      return `${SITE_BASE_URL}${post.slug}`;
    });
  } catch (error) {
    console.error('Error reading blog index:', error.message);
    return [];
  }
}

/**
 * Get all project URLs
 */
function getProjectUrls() {
  try {
    if (!fs.existsSync(PATHS.projectsData)) {
      console.warn('⚠️  Projects data not found');
      return [];
    }

    const projectsData = JSON.parse(fs.readFileSync(PATHS.projectsData, 'utf8'));
    return (projectsData.projects || []).map(project => {
      // Projects use 'id' not 'slug'
      return `${SITE_BASE_URL}/projects/${project.id}/`;
    });
  } catch (error) {
    console.error('Error reading projects data:', error.message);
    return [];
  }
}

/**
 * Get all presentation URLs
 */
function getPresentationUrls() {
  try {
    if (!fs.existsSync(PATHS.presentationsData)) {
      console.warn('⚠️  Presentations data not found');
      return [];
    }

    const presentationsData = JSON.parse(
      fs.readFileSync(PATHS.presentationsData, 'utf8')
    );
    return (presentationsData.presentations || []).map(presentation => {
      return `${SITE_BASE_URL}/presentations/${presentation.slug}/`;
    });
  } catch (error) {
    console.error('Error reading presentations data:', error.message);
    return [];
  }
}

/**
 * Get all main page URLs
 */
function getMainPageUrls() {
  return MAIN_PAGES.map(page => `${SITE_BASE_URL}${page}`);
}

/**
 * Run the Google Indexing API script with URLs
 */
function submitToGoogle(urls, options = {}) {
  const { dryRun = false } = options;

  if (urls.length === 0) {
    console.log('  ℹ️  No URLs to submit');
    return { success: 0, failed: 0 };
  }

  if (dryRun) {
    console.log(`  Would submit ${urls.length} URL(s):`);
    urls.forEach(url => console.log(`    • ${url}`));
    return { success: urls.length, failed: 0, dryRun: true };
  }

  try {
    // Call the indexing script with URLs
    const urlsArg = urls.join(' ');
    const command = `node "${PATHS.indexingScript}" ${urlsArg}`;
    
    // This will output directly and we'll count successes from the output
    execSync(command, { stdio: 'inherit' });
    
    return { success: urls.length, failed: 0 };
  } catch (error) {
    console.error('Error submitting to Google:', error.message);
    return { success: 0, failed: urls.length };
  }
}

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  
  const dryRun = args.includes('--dry-run');
  let contentType = '--all';
  
  // Find the content type argument (first non-flag argument)
  for (const arg of args) {
    if (arg.startsWith('--') && arg !== '--dry-run') {
      contentType = arg;
      break;
    }
  }
  
  return {
    contentType,
    dryRun
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const { contentType, dryRun } = parseArguments();

  console.log('🚀 Index All Content - Master Indexing Script\n');

  if (dryRun) {
    console.log('📋 DRY RUN MODE - No URLs will actually be submitted\n');
  }

  let urls = [];
  let descriptions = [];

  // Determine what to index based on argument
  if (contentType === '--all') {
    urls = [
      ...getMainPageUrls(),
      ...getBlogPostUrls(),
      ...getProjectUrls(),
      ...getPresentationUrls()
    ];
    descriptions = [
      `Main pages (${getMainPageUrls().length})`,
      `Blog posts (${getBlogPostUrls().length})`,
      `Projects (${getProjectUrls().length})`,
      `Presentations (${getPresentationUrls().length})`
    ];
  } else if (contentType === '--blogs') {
    urls = getBlogPostUrls();
    descriptions = [`Blog posts (${urls.length})`];
  } else if (contentType === '--pages') {
    urls = getMainPageUrls();
    descriptions = [`Main pages (${urls.length})`];
  } else if (contentType === '--projects') {
    urls = getProjectUrls();
    descriptions = [`Projects (${urls.length})`];
  } else if (contentType === '--presentations') {
    urls = getPresentationUrls();
    descriptions = [`Presentations (${urls.length})`];
  } else if (contentType === '--help' || contentType === '-h') {
    console.log('Usage:');
    console.log('  node scripts/index-all-content.js         # Index everything');
    console.log('  node scripts/index-all-content.js --blogs # Index only blogs');
    console.log('  node scripts/index-all-content.js --pages # Index only main pages');
    console.log('  node scripts/index-all-content.js --projects # Index only projects');
    console.log('  node scripts/index-all-content.js --presentations # Index only presentations');
    console.log('  node scripts/index-all-content.js --dry-run # Show what would be submitted\n');
    return;
  } else {
    console.error(`❌ Unknown content type: ${contentType}`);
    console.log('Use --help for usage information');
    process.exit(1);
  }

  // Show summary
  console.log('📊 Indexing Summary:');
  descriptions.forEach(desc => console.log(`  • ${desc}`));
  console.log(`\nTotal URLs: ${urls.length}\n`);

  if (urls.length === 0) {
    console.log('⚠️  No URLs found to index');
    return;
  }

  // Submit to Google
  console.log('Submitting to Google Indexing API...\n');
  const results = submitToGoogle(urls, { dryRun });

  // Summary
  console.log(`\n${'─'.repeat(80)}`);
  if (dryRun) {
    console.log(`✓ Dry run complete - ${results.success} URL(s) would be submitted`);
  } else {
    console.log(`✓ Submitted: ${results.success} URL(s)`);
    if (results.failed > 0) {
      console.log(`✗ Failed: ${results.failed} URL(s)`);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
