/**
 * Rebuild blog-index.json from existing blog post directories
 * This script reads all post-data.json files from blog/* directories
 * and rebuilds the blog-index.json file
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');
const BLOG_INDEX_PATH = path.join(__dirname, '..', 'blog-index.json');

function rebuildBlogIndex() {
  console.log('Rebuilding blog index from existing blog posts...');
  
  const posts = [];
  
  // Read all directories in blog/
  const blogDirs = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Found ${blogDirs.length} blog post directories`);
  
  // Read each post-data.json
  for (const dirName of blogDirs) {
    const postDataPath = path.join(BLOG_DIR, dirName, 'post-data.json');
    
    if (fs.existsSync(postDataPath)) {
      try {
        const postData = JSON.parse(fs.readFileSync(postDataPath, 'utf8'));
        
        // Extract index metadata
        const indexEntry = {
          slug: `/blog/${dirName}/`,
          title: postData.title || dirName,
          shortDescription: postData.shortDescription || '',
          date: postData.date || new Date().toISOString().split('T')[0],
          tags: postData.tags || [],
          featuredImage: postData.featuredImage || '',
          featured: postData.featured || false
        };
        
        posts.push(indexEntry);
        console.log(`  ✓ Added: ${indexEntry.title}`);
      } catch (error) {
        console.error(`  ✗ Error reading ${postDataPath}:`, error.message);
      }
    } else {
      console.warn(`  ⚠ No post-data.json found in ${dirName}`);
    }
  }
  
  // Sort by date (newest first)
  posts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
  
  // Create index object
  const blogIndex = {
    posts: posts
  };
  
  // Write to file
  fs.writeFileSync(BLOG_INDEX_PATH, JSON.stringify(blogIndex, null, 2));
  console.log(`\n✅ Blog index rebuilt with ${posts.length} posts`);
  console.log(`   Saved to: ${BLOG_INDEX_PATH}`);
}

// Run the script
rebuildBlogIndex();

