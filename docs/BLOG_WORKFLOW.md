# Blog Publishing Workflow

## Overview

This document describes the recommended workflow for publishing blog posts on HelloEmily.dev.

---

## 📁 Directory Structure

```
blog-drafts/
├── new/                    # New drafts ready to publish
│   ├── my-post.md
│   └── my-post.png        # Optional companion image
└── processed/              # Published drafts (archive)
    └── my-post.md

blog/
├── my-post/               # Published post directory
│   ├── index.html         # Generated HTML page
│   └── post-data.json     # Post metadata + content
└── another-post/

images/blog/
└── my-post/               # Post images
    └── my-post.png

blog-index.json            # Master index of all posts
```

---

## ✍️ Writing a New Post

### 1. Create Markdown File

Create a new file in `blog-drafts/new/` with this structure:

```markdown
---
title: "Your Post Title"
author: "Emily Anderson"
date: "2025-09-24"
tags:
  - tag1
  - tag2
  - tag3
shortDescription: "Brief description for previews"
description: "Longer description (optional)"
featuredImage: "/images/blog/your-post/your-post.png"
featured: false
---

# Your Post Title

Your content here...
```

### 2. Add Images (Optional)

If you have a featured image:
1. Place it in `blog-drafts/new/` with the same name as your markdown file
2. Or manually place it in `images/blog/your-post/`
3. Reference it in the `featuredImage` field

---

## 🚀 Publishing a Post

### Method 1: Process Single Draft (RECOMMENDED)

```bash
# Process a specific draft from blog-drafts/new/
node scripts/process-blog-draft.js your-post.md
```

**What it does:**
- ✅ Parses YAML frontmatter
- ✅ Converts markdown to HTML using `marked`
- ✅ Creates `blog/your-post/` directory
- ✅ Generates `post-data.json`
- ✅ Generates `index.html` from template
- ✅ Updates `blog-index.json`
- ✅ Moves markdown to `blog-drafts/processed/`

**Advantages:**
- Simple and focused
- Only processes one post
- Doesn't touch other posts
- Clear error messages
- ~300 lines of modular code

### Method 2: Old Script (NOT RECOMMENDED)

```bash
# ⚠️ WARNING: Has dangerous cleanup routine
node scripts/md-to-blog.js new/your-post.md
```

**Problems:**
- ❌ 481 lines of monolithic code
- ❌ Dangerous cleanup routine that can delete posts
- ❌ Reinitializes entire blog index
- ❌ Custom markdown parser (buggy)

---

## 🔧 Utility Scripts

### Rebuild Blog Index

If the blog index gets corrupted or out of sync:

```bash
node scripts/rebuild-blog-index.js
```

**What it does:**
- Reads all `blog/*/post-data.json` files
- Rebuilds `blog-index.json` from existing posts
- Sorts by date (newest first)

---

## 📝 Post Metadata Fields

### Required Fields

- **title**: Post title (string)
- **date**: Publication date (YYYY-MM-DD format)

### Optional Fields

- **author**: Author name (default: "Emily Anderson")
- **tags**: Array of tags (default: [])
- **shortDescription**: Brief description for cards/previews
- **description**: Longer description (fallback for shortDescription)
- **featuredImage**: Path to featured image (default: "")
- **featured**: Show on homepage (default: false)

---

## 🖼️ Image Handling

### Featured Images

**Recommended workflow:**
1. Place image in `images/blog/your-post/your-post.png`
2. Reference in frontmatter: `featuredImage: "/images/blog/your-post/your-post.png"`

**Supported formats:**
- PNG (recommended for screenshots/graphics)
- JPG (recommended for photos)
- WebP (for optimized delivery)

**Recommended sizes:**
- Featured image: 1200x630px (Open Graph standard)
- In-content images: Max width 1200px

---

## 🎯 Best Practices

### 1. Use Descriptive Slugs

The markdown filename becomes the URL slug:
- ✅ `getting-started-with-pygame.md` → `/blog/getting-started-with-pygame/`
- ❌ `post1.md` → `/blog/post1/`

### 2. Write Good Descriptions

The `shortDescription` appears in:
- Blog archive cards
- Social media previews (Open Graph)
- Search results

Keep it under 160 characters.

### 3. Tag Consistently

Use existing tags when possible:
- Check `blog-index.json` for existing tags
- Use title case: "Python", "AI", "Web Development"
- Keep tags specific but not too narrow

### 4. Test Locally

After publishing:
1. Check `/blog/your-post/` loads correctly
2. Check blog archive shows the post
3. Check featured image displays
4. Check tags work

---

## 🐛 Troubleshooting

### "No YAML frontmatter found"

Make sure your markdown file starts with `---` and has closing `---`:

```markdown
---
title: "My Post"
date: "2025-09-24"
---

Content here...
```

### "File not found"

Make sure the file is in `blog-drafts/new/`:

```bash
ls blog-drafts/new/
```

### Post not showing on site

1. Check `blog-index.json` includes your post
2. Check `blog/your-post/post-data.json` exists
3. Check `blog/your-post/index.html` exists
4. Clear browser cache

### All posts disappeared

If you accidentally ran the old script and it deleted posts:

```bash
# Restore from git
git restore blog/

# Rebuild index
node scripts/rebuild-blog-index.js
```

---

## 📊 Script Comparison

| Feature | process-blog-draft.js | md-to-blog.js |
|---------|----------------------|---------------|
| **Lines of code** | ~300 | ~481 |
| **Modular** | ✅ Yes | ❌ No |
| **Uses marked** | ✅ Yes | ❌ Custom parser |
| **Safe** | ✅ Yes | ❌ Deletes posts |
| **Single file** | ✅ Yes | ❌ Processes all |
| **Clear output** | ✅ Yes | ⚠️ Verbose |
| **Error handling** | ✅ Good | ⚠️ Basic |

---

## 🔮 Future Improvements

### Potential Enhancements

1. **Image optimization**
   - Auto-generate WebP versions
   - Auto-resize to optimal dimensions
   - Compress images

2. **Validation**
   - Check for broken links
   - Validate image paths
   - Check tag consistency

3. **Preview**
   - Generate preview before publishing
   - Local dev server

4. **Batch processing**
   - Process all files in `new/` folder
   - With confirmation prompts

---

## 📚 Related Files

- `scripts/process-blog-draft.js` - Main publishing script (RECOMMENDED)
- `scripts/rebuild-blog-index.js` - Rebuild blog index
- `scripts/md-to-blog.js` - Old script (deprecated)
- `blog-post-template.html` - HTML template for posts
- `blog-index.json` - Master index of all posts

---

**Last Updated:** 2025-10-01

