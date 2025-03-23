# Instructions 51: Repository Cleanup

## Identified Leftover/Broken Files

After analyzing the repository, I've identified several files that appear to be leftover, temporary, or no longer needed:

1. **blog/blog-data.json.bak** - Backup file of blog-data.json that's no longer needed
2. **temp-blog-data.json** - Temporary file used during development with outdated blog data
3. **Ethics & AI blog post.md** - Standalone markdown file in root directory that has already been converted to blog post
4. **Sean website blog post.md** - Standalone markdown file in root directory that has already been converted to blog post
5. **simple-website.html** - Template/example file not part of the actual website
6. **favicon-instructions.html** - Reference file for creating a favicon that's no longer needed
7. **favicon.svg** - SVG file that's not being used (index.html uses an inline SVG for favicon)

## Cleanup Steps

1. **Move markdown blog posts to appropriate directory**
   - Move `Ethics & AI blog post.md` to `blog-drafts/Posted/`
   - Move `Sean website blog post.md` to `blog-drafts/Posted/`

2. **Remove temporary and backup files**
   - Delete `blog/blog-data.json.bak`
   - Delete `temp-blog-data.json`

3. **Remove unused template/reference files**
   - Delete `simple-website.html`
   - Delete `favicon-instructions.html`
   - Delete `favicon.svg` (if not needed for reference)

## Verification

After cleanup, verify that:
- The website still functions correctly
- All blog posts are still accessible
- The favicon still displays properly in browser tabs

## Benefits of Cleanup

- Reduces repository clutter
- Makes it easier to navigate the codebase
- Eliminates confusion about which files are actively being used
- Improves repository organization