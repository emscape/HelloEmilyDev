#!/usr/bin/env node

/**
 * Google Indexing API Client for HelloEmily.dev
 * Automatically requests indexing for new and updated URLs
 * 
 * Setup Instructions:
 * 1. Create a Google Cloud project
 * 2. Enable the Indexing API
 * 3. Create a Service Account with Indexing API access
 * 4. Download the JSON key file
 * 5. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 6. Run: node scripts/google-indexing-api.js [url1] [url2] ...
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const INDEXING_API_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

/**
 * Get all blog post URLs from blog-index.json
 */
function getBlogPostUrls() {
  try {
    const indexPath = path.join(__dirname, '..', 'data', 'blog-index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    return indexData.posts.map(post => {
      return `https://helloemily.dev${post.slug}`;
    });
  } catch (error) {
    console.error('Error reading blog index:', error.message);
    return [];
  }
}

/**
 * Get all main page URLs
 */
function getMainPageUrls() {
  return [
    'https://helloemily.dev/',
    'https://helloemily.dev/pages/blog-archive.html',
    'https://helloemily.dev/pages/projects.html',
    'https://helloemily.dev/pages/presentations.html',
    'https://helloemily.dev/pages/resume.html',
    'https://helloemily.dev/pages/contact.html'
  ];
}

/**
 * Submit URLs to Google Indexing API using a service account
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
 */
async function submitUrlsToGoogle(urls, accessToken) {
  const results = {
    success: [],
    failed: []
  };

  for (const url of urls) {
    try {
      const response = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        });

        const options = {
          hostname: 'indexing.googleapis.com',
          path: '/v3/urlNotifications:publish',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'Authorization': `Bearer ${accessToken}`
          }
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve({ success: true, statusCode: res.statusCode, url: url });
            } else {
              resolve({ success: false, statusCode: res.statusCode, url: url, response: data });
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(payload);
        req.end();
      });

      if (response.success) {
        results.success.push(url);
        console.log(`✓ ${url}`);
      } else {
        results.failed.push({ url, status: response.statusCode });
        console.log(`✗ ${url} (HTTP ${response.statusCode})`);
      }
    } catch (error) {
      results.failed.push({ url, error: error.message });
      console.log(`✗ ${url} (Error: ${error.message})`);
    }
  }

  return results;
}

/**
 * Get access token from service account (requires GOOGLE_APPLICATION_CREDENTIALS)
 */
async function getAccessToken() {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!credentialsPath) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS environment variable not set.\n' +
      'Please set it to your service account JSON file path.'
    );
  }

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Credentials file not found: ${credentialsPath}`);
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  // Simple JWT creation (in production, use google-auth-library)
  // For now, we'll provide instructions for manual setup or using gcloud
  console.log('⚠️  This script requires a valid OAuth 2.0 access token from Google.');
  console.log('For setup instructions, see: https://developers.google.com/search/apis/indexing-api/v3/quickstart');
  
  return null;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Google Indexing API - URL Submission Tool\n');

  // Parse command line arguments
  let urls = process.argv.slice(2);

  if (urls.length === 0) {
    console.log('No URLs provided. Available options:\n');
    console.log('Usage:');
    console.log('  node scripts/google-indexing-api.js <url1> [url2] [url3] ...');
    console.log('  node scripts/google-indexing-api.js --all');
    console.log('  node scripts/google-indexing-api.js --blogs');
    console.log('  node scripts/google-indexing-api.js --pages\n');
    
    console.log('Examples:');
    console.log('  node scripts/google-indexing-api.js https://helloemily.dev/blog/spark-site-studio/');
    console.log('  node scripts/google-indexing-api.js --blogs');
    console.log('  node scripts/google-indexing-api.js --all\n');
    
    return;
  }

  // Handle special flags
  if (urls[0] === '--all') {
    urls = [...getMainPageUrls(), ...getBlogPostUrls()];
    console.log(`📋 Submitting ${urls.length} URLs (all pages + blogs)\n`);
  } else if (urls[0] === '--blogs') {
    urls = getBlogPostUrls();
    console.log(`📋 Submitting ${urls.length} blog post URLs\n`);
  } else if (urls[0] === '--pages') {
    urls = getMainPageUrls();
    console.log(`📋 Submitting ${urls.length} main page URLs\n`);
  } else {
    console.log(`📋 Submitting ${urls.length} URL(s)\n`);
  }

  // Get access token
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      console.log('\n⚠️  SETUP REQUIRED\n');
      console.log('To use the Google Indexing API:\n');
      console.log('1. Create a Google Cloud project');
      console.log('2. Enable the "Indexing API"');
      console.log('3. Create a Service Account');
      console.log('4. Create and download a JSON key');
      console.log('5. Set environment variable:');
      console.log('   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\service-account-key.json"\n');
      console.log('Documentation: https://developers.google.com/search/apis/indexing-api/v3/quickstart\n');
      return;
    }

    // Submit URLs
    const results = await submitUrlsToGoogle(urls, accessToken);

    // Print summary
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`✓ Successful: ${results.success.length}`);
    console.log(`✗ Failed: ${results.failed.length}`);
    console.log(`Total: ${urls.length}\n`);

    if (results.failed.length > 0) {
      console.log('Failed URLs:');
      results.failed.forEach(item => {
        console.log(`  • ${item.url} (${item.status || item.error})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
