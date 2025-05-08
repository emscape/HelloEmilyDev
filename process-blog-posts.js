
const fs = require('fs-extra'); // Using fs-extra for convenience
const path = require('path');
const yaml = require('js-yaml');
const marked = require('marked');

// --- Configuration ---
const NEW_DRAFTS_DIR = path.join(__dirname, 'blog-drafts', 'new');
const PROCESSED_DRAFTS_DIR = path.join(__dirname, 'blog-drafts', 'processed');
const BLOG_DATA_DIR = path.join(__dirname, 'blog-data');
const BLOG_INDEX_PATH = path.join(__dirname, 'blog-index.json');
const IMAGES_BLOG_DIR = path.join(__dirname, 'images', 'blog');
// --- End Configuration ---

async function main() {
  console.log('Starting blog post processing...');

  // Ensure required directories exist
  await fs.ensureDir(NEW_DRAFTS_DIR);
  await fs.ensureDir(PROCESSED_DRAFTS_DIR);
  await fs.ensureDir(BLOG_DATA_DIR);
  await fs.ensureDir(IMAGES_BLOG_DIR);

  const files = await fs.readdir(NEW_DRAFTS_DIR);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  if (markdownFiles.length === 0) {
    console.log(`No markdown files found in ${NEW_DRAFTS_DIR}.`);
    return;
  }

  console.log(`Found ${markdownFiles.length} markdown file(s) to process...`);

  for (const mdFilename of markdownFiles) {
    const mdFilePath = path.join(NEW_DRAFTS_DIR, mdFilename);
    const slug = path.basename(mdFilename, '.md'); // Extract slug from filename
    console.log(`\n--- Processing: ${mdFilename} (slug: ${slug}) ---`);

    try {
      const fileContent = await fs.readFile(mdFilePath, 'utf8');

      // --- Extract YAML and Markdown Body ---
      const yamlRegex = /^---\s*([\s\S]*?)\s*---/; // Regex to capture content between ---
      const match = fileContent.match(yamlRegex);

      if (!match || !match[1]) {
        throw new Error('YAML front matter not found or improperly formatted.');
      }

      const yamlContent = match[1].trim();
      const markdownBody = fileContent.substring(match[0].length).trim();
      // --- End Extract ---

      // --- Parse YAML ---
      let metadata;
      try {
        metadata = yaml.load(yamlContent);
        if (typeof metadata !== 'object' || metadata === null) {
          throw new Error('Parsed YAML is not an object.');
        }
      } catch (yamlError) {
        throw new Error(`Error parsing YAML: ${yamlError.message}`);
      }
      // --- End Parse YAML ---

      // --- Validate Required Metadata ---
      const requiredFields = ['title', 'date', 'author', 'tags', 'shortDescription'];
      const missingFields = requiredFields.filter(field => !(field in metadata) || !metadata[field]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required metadata fields: ${missingFields.join(', ')}`);
      }
      // --- End Validation ---

      // --- Parse Markdown for Image References & Verify Existence ---
      const imageRegex = /!\[.*?\]\((.*?)\)/g; // Matches ![alt](src)
      let matchImg;
      const referencedImageFilenames = new Set();
      while ((matchImg = imageRegex.exec(markdownBody)) !== null) {
        // Assuming image paths in markdown are just filenames, e.g., "image.png"
        // and are expected to be in the NEW_DRAFTS_DIR alongside the .md file.
        const imageFilename = path.basename(matchImg[1]); // Get filename from path
        referencedImageFilenames.add(imageFilename);
      }

      // Identify featured image (convention: [slug]-featured.*)
      // We need to list files in NEW_DRAFTS_DIR to find the exact featured image filename with its extension.
      const draftFiles = await fs.readdir(NEW_DRAFTS_DIR);
      const featuredImagePattern = new RegExp(`^${slug}-featured\\.(png|jpg|jpeg|gif|webp)$`, 'i');
      const featuredImageFilename = draftFiles.find(f => featuredImagePattern.test(f));

      if (!featuredImageFilename) {
        throw new Error(`Featured image matching '${slug}-featured.*' not found in ${NEW_DRAFTS_DIR}.`);
      }
      referencedImageFilenames.add(featuredImageFilename); // Ensure it's in the set for verification

      const allRequiredImages = Array.from(referencedImageFilenames);
      const missingImageFiles = [];

      for (const imgFilename of allRequiredImages) {
        const imgPath = path.join(NEW_DRAFTS_DIR, imgFilename);
        if (!(await fs.pathExists(imgPath))) {
          missingImageFiles.push(imgFilename);
        }
      }

      if (missingImageFiles.length > 0) {
        throw new Error(`Missing image file(s) in ${NEW_DRAFTS_DIR}: ${missingImageFiles.join(', ')}`);
      }
      console.log('All referenced images verified.');
      // --- End Image Verification ---

      // --- Convert Markdown to HTML (rewriting image paths) ---
      const renderer = new marked.Renderer();
      const originalImageRenderer = renderer.image.bind(renderer);

      renderer.image = (href, title, text) => {
        // Debug log to inspect incoming arguments
        console.log(`Custom image renderer received - href: [${href}] (type: ${typeof href}), title: [${title}] (type: ${typeof title}), text: [${text}] (type: ${typeof text})`);

        let imageFilename = '';
        if (typeof href === 'string') {
          imageFilename = path.basename(href);
        } else {
          // This case should ideally not happen if markdown is well-formed and marked parses it as expected.
          // If href is not a string, it's problematic for path.basename and for forming a URL.
          console.error(`[WARNING] Image 'href' in markdown was not a string. Received: ${href} (type: ${typeof href}). Skipping path rewrite for this image, using original href if possible or empty.`);
          // Fallback: use href as is if it's somehow usable, or an empty string to avoid breaking path.join later.
          // This part might need adjustment based on what non-string hrefs look like.
          // For now, if href is not a string, we can't reliably get a basename.
          // Let's pass the original href to the original renderer if it's not a string,
          // it might be a data URI or something else the original renderer can handle.
          if (typeof href !== 'string') {
             return originalImageRenderer(href, title, text); // Let original renderer try
          }
          // If we decided to proceed with an empty filename, it would be:
          // imageFilename = 'unknown-image-source'; // or some placeholder
        }
        
        const newHref = `/images/blog/${slug}/${imageFilename}`;
        
        // Ensure title is string or null, text is string for the original renderer
        const safeTitle = (title === null || typeof title === 'string') ? title : String(title || '');
        const safeText = String(text || '');

        console.log(`Calling originalImageRenderer with - newHref: [${newHref}], safeTitle: [${safeTitle}], safeText: [${safeText}]`);
        return originalImageRenderer(newHref, safeTitle, safeText);
      };

      marked.setOptions({ renderer });
      const htmlContent = marked.parse(markdownBody);
      console.log('Markdown converted to HTML with rewritten image paths.');
      // --- End Markdown to HTML ---

      // --- Construct JSON Objects ---
      const postData = {
        id: slug,
        slug: slug, // often the same as id
        title: metadata.title,
        date: metadata.date, // Ensure this is in YYYY-MM-DD format from YAML
        author: metadata.author,
        tags: metadata.tags || [], // Ensure tags is an array
        shortDescription: metadata.shortDescription, // From YAML 'shortDescription' field
        featuredImage: `/images/blog/${slug}/${featuredImageFilename}`, // Web-accessible path
        content: [{ type: 'html', content: htmlContent }], // Matching existing structure
        // Add any other fields from metadata that are part of your blog-data/*.json structure
        // e.g., bannerImage: metadata.bannerImage || "",
        featured: metadata.featured || false, // Assuming 'featured' might be in YAML
        // additionalImages: {} // If you plan to list other images here
      };

      const indexEntry = {
        slug: slug,
        title: metadata.title,
        date: metadata.date,
        tags: metadata.tags || [],
        shortDescription: metadata.shortDescription,
        featuredImage: `/images/blog/${slug}/${featuredImageFilename}`,
        featured: metadata.featured || false,
      };
      console.log('JSON objects constructed.');
      // --- End Construct JSON ---

      // --- Write blog-data/[slug].json ---
      const postJsonPath = path.join(BLOG_DATA_DIR, `${slug}.json`);
      await fs.writeJson(postJsonPath, postData, { spaces: 2 }); // fs-extra's writeJson
      console.log(`Successfully wrote ${postJsonPath}`);
      // --- End Write JSON ---

      // --- Update blog-index.json ---
      let blogIndex;
      try {
        if (await fs.pathExists(BLOG_INDEX_PATH)) {
          blogIndex = await fs.readJson(BLOG_INDEX_PATH); // fs-extra's readJson
          if (!Array.isArray(blogIndex.posts)) {
            console.warn(`${BLOG_INDEX_PATH} is malformed. Initializing with empty posts array.`);
            blogIndex = { posts: [] };
          }
        } else {
          console.log(`${BLOG_INDEX_PATH} not found. Creating a new one.`);
          blogIndex = { posts: [] };
        }
      } catch (e) {
        console.warn(`Error reading or parsing ${BLOG_INDEX_PATH}. Initializing with empty posts array. Error: ${e.message}`);
        blogIndex = { posts: [] };
      }

      // Remove existing entry if slug already exists to prevent duplicates (update in place)
      blogIndex.posts = blogIndex.posts.filter(post => post.slug !== slug);
      
      // Add new entry to the beginning
      blogIndex.posts.unshift(indexEntry);

      await fs.writeJson(BLOG_INDEX_PATH, blogIndex, { spaces: 2 });
      console.log(`Successfully updated ${BLOG_INDEX_PATH}`);
      // --- End Update blog-index.json ---

      // --- Move Images ---
      const targetImageDir = path.join(IMAGES_BLOG_DIR, slug);
      await fs.ensureDir(targetImageDir);

      for (const imgFilename of allRequiredImages) {
        const sourceImagePath = path.join(NEW_DRAFTS_DIR, imgFilename);
        const destImagePath = path.join(targetImageDir, imgFilename);
        try {
          await fs.move(sourceImagePath, destImagePath, { overwrite: true }); // fs-extra's move
          console.log(`Moved image ${imgFilename} to ${destImagePath}`);
        } catch (moveError) {
          // This is a critical error for this post, should ideally not happen if pathExists check passed
          // and we have write permissions.
          throw new Error(`Failed to move image ${imgFilename} to ${targetImageDir}: ${moveError.message}`);
        }
      }
      console.log(`All images for ${slug} moved to ${targetImageDir}`);
      // --- End Move Images ---

      // --- Move Markdown File ---
      const processedMdPath = path.join(PROCESSED_DRAFTS_DIR, mdFilename);
      await fs.move(mdFilePath, processedMdPath, { overwrite: true });
      console.log(`Moved markdown file ${mdFilename} to ${processedMdPath}`);
      // --- End Move Markdown File ---

      console.log(`--- Successfully processed ${mdFilename} ---`);

    } catch (error) {
      // Log specific error for this file and continue
      console.error(`Failed to process ${mdFilename}: ${error.message}`);
      // Continue to the next file even if one fails
    }
  }

  console.log('\nBlog post processing finished.');
}

main().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});