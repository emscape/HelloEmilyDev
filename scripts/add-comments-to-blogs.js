/**
 * Script to add comments system to all blog posts
 * Usage: node scripts/add-comments-to-blogs.js
 */

const fs = require('fs-extra');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../blog');

// Comments HTML snippet to add
const COMMENTS_HTML = `        
        <!-- Engagement Section (Likes + Share) -->
        <section class="engagement-section">
            <div class="engagement-group">
                <span class="engagement-label">Like</span>
                <button class="likes-button" aria-label="Like this post">
                    <svg class="likes-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            </div>
            <div class="engagement-group">
                <span class="engagement-label">Share</span>
                <div class="share-buttons-group">
                    <a href="https://bsky.app/intent/compose?text=Check%20out%20this%20blog%20post%20by%20%40emscape" class="share-button" aria-label="Share on Bluesky" target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"></path></svg>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=https://helloemily.dev/blog/SLUG/" class="share-button" aria-label="Share on Facebook" target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z"></path></svg>
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://helloemily.dev/blog/SLUG/" class="share-button" aria-label="Share on LinkedIn" target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                </div>
            </div>
        </section>

        <!-- Comments Section -->
        <section class="blog-comments-section">
            <div class="blog-comments-container">
                <h3>Comments</h3>

                <!-- Comment Form -->
                <div class="comment-form-area">
                    <form class="comment-form">
                        <div class="form-group">
                            <label for="comment-name">Name *</label>
                            <input type="text" id="comment-name" name="name" required placeholder="Your name" maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="comment-email">Email *</label>
                            <input type="email" id="comment-email" name="email" required placeholder="your.email@example.com">
                            <small>Your email won't be published</small>
                        </div>
                        <div class="form-group">
                            <label for="comment-text">Comment *</label>
                            <textarea id="comment-text" name="comment" required placeholder="Share your thoughts..." rows="5"></textarea>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                                <small>Be respectful and constructive</small>
                                <span id="char-count">0/500</span>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Post Comment</button>
                        <div class="form-message"></div>
                    </form>
                </div>

                <!-- Comments List -->
                <div class="comments-list-area">
                    <div class="loading">Loading comments...</div>
                    <div class="comments-list"></div>
                </div>
            </div>
        </section>`;

const CSS_LINK = '    <link rel="stylesheet" href="/css/comments.css"> <!-- Comments and likes styles -->';

const SCRIPT_SNIPPET = `    <script src="/js/blog-comments.js"></script>
    <script>
        // Simple script for current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Initialize comments after blog-post.js loads the post
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof initBlogComments === 'function' && typeof window.currentPostId !== 'undefined') {
                initBlogComments(window.currentPostId);
            }
        });
    </script>`;

async function updateBlogPost(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Extract the blog slug from the directory path
    const blogSlug = path.basename(path.dirname(filePath));

    // Check if already has comments
    if (content.includes('blog-comments-section')) {
      console.log(`⚠️  Skipping ${blogSlug} - already has comments`);
      return;
    }

    // Add CSS link if not present
    if (!content.includes('comments.css')) {
      const cssRegex = /(<link rel="stylesheet"[^>]*blog-post\.css"[^>]*>)/;
      content = content.replace(cssRegex, `$1\n${CSS_LINK}`);
    }

    // Replace SLUG placeholders with actual blog slug
    let commentsHtml = COMMENTS_HTML.replace(/\/blog\/SLUG\//g, `/blog/${blogSlug}/`);

    // Add comments HTML after closing </section>, before </main>
    const mainRegex = /(<\/section>)(\s*)(<\/main>)/;
    if (mainRegex.test(content)) {
      content = content.replace(mainRegex, `$1\n${commentsHtml}\n    </main>`);
    }

    // Update scripts section
    const scriptRegex = /(<script[^>]*blog-post\.js[^>]*><\/script>)([\s\S]*?)(<\/body>)/;
    content = content.replace(scriptRegex, `$1\n${SCRIPT_SNIPPET}\n    $3`);

    // Write updated content
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Updated ${path.basename(path.dirname(filePath))}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

async function main() {
  try {
    const blogDirs = await fs.readdir(BLOG_DIR);

    for (const dir of blogDirs) {
      const indexPath = path.join(BLOG_DIR, dir, 'index.html');
      if (await fs.pathExists(indexPath)) {
        await updateBlogPost(indexPath);
      }
    }

    console.log('\n✅ Comments system added to all blog posts!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
