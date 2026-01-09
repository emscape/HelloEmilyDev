# HelloEmily.dev

Personal website and portfolio hosted at [HelloEmily.dev](https://HelloEmily.dev).

## Tech Stack

- HTML, CSS, JavaScript
- Marked.js for markdown processing
- GSAP for animations
- GitHub Pages hosting

## Structure

```
├── blog/           # Blog posts
├── css/            # Stylesheets
├── data/           # JSON data files
├── images/         # Site images
├── js/             # JavaScript modules
├── pages/          # HTML pages and templates
├── presentations/  # Presentation data
├── projects/       # Project data
├── scripts/        # Build and validation scripts
└── tests/          # Test files
```

## Development

```bash
# Clone and setup
git clone https://github.com/emscape/HelloEmilyDev.git
cd HelloEmilyDev
npm install

# Run local server
python -m http.server 8000
# or
npx http-server -p 8000

# Run tests
npm test
```

## Scripts

```bash
# Blog validation and repair
npm run blog:validate
npm run blog:repair

# Process blog drafts
npm run blog:process your-post.md

# Update published blog post
npm run blog:update your-post.md

# Optimize images
npm run images:optimize path/to/images/
```

## Documentation

- [Blog Tags Guide](docs/BLOG_TAGS_GUIDE.md) - Guidelines for managing blog post tags
- [Codebase Audit](docs/CODEBASE_AUDIT.md) - Code quality review and recommendations

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## Deployment

Deployed automatically to GitHub Pages on push to `main` branch.
Custom domain: HelloEmily.dev

## License

© 2025 Emily Anderson. All rights reserved.