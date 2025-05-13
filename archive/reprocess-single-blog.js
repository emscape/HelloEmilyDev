const fs = require('fs-extra'); // Using fs-extra for convenience
const path = require('path');
const yaml = require('js-yaml');
const marked = require('marked');

// --- Configuration ---
// Adjusted to look in 'processed' first, then 'Posted' as a fallback for the source MD
const PROCESSED_DRAFTS_DIR = path.join(__dirname, 'blog-drafts', 'processed');
const POSTED_DRAFTS_DIR = path.join(__dirname, 'blog-drafts', 'Posted'); // Fallback
const BLOG_DATA_DIR = path.join(__dirname, 'blog-data');
const BLOG_INDEX_PATH = path.join(__dirname, 'blog-index.json');
const IMAGES_BLOG_DIR = path.join(__dirname, 'images', 'blog'); // Directory where final images are stored
// --- End Configuration ---

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('Usage: node reprocess-single-blog.js <blog-slug>');
    process.exit(1);
  }
  const slug = args[0];
  console.log(`Starting reprocessing of single blog post: ${slug}`);

  await fs.ensureDir(BLOG_DATA_DIR);
  await fs.ensureDir(IMAGES_BLOG_DIR);

  let mdFilePath;
  const processedMdPath = path.join(PROCESSED_DRAFTS_DIR, `${slug}.md`);
  const postedMdPath = path.join(POSTED_DRAFTS_DIR, `${slug}.md`);

  if (await fs.pathExists(processedMdPath)) {
    mdFilePath = processedMdPath;
    console.log(`Found Markdown file at: ${mdFilePath}`);
  } else if (await fs.pathExists(postedMdPath)) {
    mdFilePath = postedMdPath;
    console.log(`Found Markdown file at: ${mdFilePath} (fallback to Posted directory)`);
  } else {
    console.error(`Error: Markdown file for slug "${slug}" not found in ${PROCESSED_DRAFTS_DIR} or ${POSTED_DRAFTS_DIR}.`);
    console.error(`Looked for: ${processedMdPath}`);
    console.error(`And for: ${postedMdPath}`);
    process.exit(1);
  }

  const mdFilename = path.basename(mdFilePath);
  console.log(`\n--- Reprocessing: ${mdFilename} (slug: ${slug}) ---`);

  try {
    let fileContent = await fs.readFile(mdFilePath, 'utf8');

    const yamlRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = fileContent.match(yamlRegex);

    if (!match || !match[1]) {
      throw new Error('YAML front matter not found or improperly formatted.');
    }

    const yamlContent = match[1].trim();
    let markdownBody = fileContent.substring(match[0].length).trim();

    let metadata;
    try {
      metadata = yaml.load(yamlContent);
      if (typeof metadata !== 'object' || metadata === null) {
        throw new Error('Parsed YAML is not an object.');
      }
    } catch (yamlError) {
      throw new Error(`Error parsing YAML: ${yamlError.message}`);
    }

    const requiredFields = ['title', 'date', 'author', 'tags', 'shortDescription', 'featuredImage'];
    const missingFields = requiredFields.filter(field => !(field in metadata) || !metadata[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required metadata fields: ${missingFields.join(', ')}. 'featuredImage' must be present in YAML.`);
    }
    if (typeof metadata.featuredImage !== 'string' || metadata.featuredImage.trim() === '') {
      throw new Error("'featuredImage' metadata field must be a non-empty string (the filename or path of the featured image).");
    }
    
    const originalYamlFeaturedImageValue = metadata.featuredImage;
    let actualFeaturedImageFilename = path.basename(originalYamlFeaturedImageValue);
    const featuredImageBaseNameFromYaml = path.parse(actualFeaturedImageFilename).name;
    const imageDirForSlug = path.join(IMAGES_BLOG_DIR, slug);
    const possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    let foundActualFile = false;

    if (await fs.pathExists(imageDirForSlug)) {
      for (const ext of possibleExtensions) {
        const trialFilename = featuredImageBaseNameFromYaml + ext;
        const trialFilePath = path.join(imageDirForSlug, trialFilename);
        if (await fs.pathExists(trialFilePath)) {
          actualFeaturedImageFilename = trialFilename; 
          foundActualFile = true;
          console.log(`Confirmed actual featured image for slug "${slug}": ${actualFeaturedImageFilename} in ${imageDirForSlug}`);
          break;
        }
      }
    }

    if (!foundActualFile) {
      console.warn(`Warning for slug "${slug}": Could not find an actual image file for base name "${featuredImageBaseNameFromYaml}" in ${imageDirForSlug} with common extensions. Falling back to YAML specified filename: "${actualFeaturedImageFilename}". This might result in a broken image link.`);
    } else {
      const yamlSpecifiedFullFilename = path.basename(originalYamlFeaturedImageValue);
      if (yamlSpecifiedFullFilename !== actualFeaturedImageFilename) {
        let newFeaturedImageValueForYaml;
        const originalDirnameInYaml = path.dirname(originalYamlFeaturedImageValue);

        if (originalDirnameInYaml === '.' || originalDirnameInYaml === '') { 
          newFeaturedImageValueForYaml = actualFeaturedImageFilename;
        } else {
          newFeaturedImageValueForYaml = path.join(originalDirnameInYaml, actualFeaturedImageFilename).replace(/\\/g, '/');
        }
        
        const oldYamlLine = `featuredImage: ${originalYamlFeaturedImageValue}`;
        const newYamlLine = `featuredImage: ${newFeaturedImageValueForYaml}`;

        if (fileContent.includes(oldYamlLine)) {
          fileContent = fileContent.replace(oldYamlLine, newYamlLine);
          await fs.writeFile(mdFilePath, fileContent, 'utf8');
          console.log(`Updated 'featuredImage' in Markdown ${mdFilename} from "${originalYamlFeaturedImageValue}" to "${newFeaturedImageValueForYaml}"`);
          metadata.featuredImage = newFeaturedImageValueForYaml;
          markdownBody = fileContent.substring(fileContent.match(yamlRegex)[0].length).trim();
        } else {
          console.warn(`Warning for slug "${slug}": Could not find exact line "${oldYamlLine}" in Markdown to update. Manual check of ${mdFilename} might be needed.`);
        }
      }
    }

    const renderer = new marked.Renderer();
    const originalImageRenderer = renderer.image.bind(renderer);

    renderer.image = (href, title, text) => {
      let newHrefToUse = href; 
      if (typeof href === 'string') {
          if (/^(https?:\/\/|\/\/|data:)/i.test(href)) {
              newHrefToUse = href;
          } else {
              const imageFilenameInMarkdown = path.basename(href); 
              newHrefToUse = `/images/blog/${slug}/${imageFilenameInMarkdown}`; 
          }
      }
      const safeTitle = (title === null || typeof title === 'string') ? title : String(title || '');
      const safeText = String(text || '');
      return originalImageRenderer(newHrefToUse, safeTitle, safeText);
    };
    
    marked.setOptions({ renderer }); 
    const htmlContent = marked.parse(markdownBody);
    console.log('Markdown converted to HTML.');

    const finalFeaturedImagePathForJson = `/images/blog/${slug}/${actualFeaturedImageFilename}`;

    const postData = {
      id: slug,
      slug: slug,
      title: metadata.title,
      date: metadata.date,
      author: metadata.author,
      tags: metadata.tags || [],
      shortDescription: metadata.shortDescription,
      featuredImage: finalFeaturedImagePathForJson,
      content: [{ type: 'html', content: htmlContent }],
      featured: metadata.featured || false,
    };

    const indexEntry = {
      slug: slug,
      title: metadata.title,
      date: metadata.date,
      tags: metadata.tags || [],
      shortDescription: metadata.shortDescription,
      featuredImage: finalFeaturedImagePathForJson,
      featured: metadata.featured || false,
    };
    console.log('JSON objects constructed.');

    const postJsonPath = path.join(BLOG_DATA_DIR, `${slug}.json`);
    await fs.writeJson(postJsonPath, postData, { spaces: 2 });
    console.log(`Successfully wrote/updated ${postJsonPath}`);

    // Update blog index
    console.log(`\nUpdating ${BLOG_INDEX_PATH}...`);
    let blogIndex;
    try {
      if (await fs.pathExists(BLOG_INDEX_PATH)) {
        blogIndex = await fs.readJson(BLOG_INDEX_PATH);
        if (!blogIndex || !Array.isArray(blogIndex.posts)) {
          console.warn(`${BLOG_INDEX_PATH} is malformed or posts array is missing. Initializing.`);
          blogIndex = { posts: [] };
        }
      } else {
        console.log(`${BLOG_INDEX_PATH} not found. Creating a new one.`);
        blogIndex = { posts: [] };
      }
    } catch (e) {
      console.warn(`Error reading or parsing ${BLOG_INDEX_PATH}. Initializing. Error: ${e.message}`);
      blogIndex = { posts: [] };
    }

    const existingEntryIndex = blogIndex.posts.findIndex(post => post.slug === indexEntry.slug);
    if (existingEntryIndex !== -1) {
      blogIndex.posts[existingEntryIndex] = indexEntry;
      console.log(`Updated entry for "${slug}" in blog index.`);
    } else {
      blogIndex.posts.push(indexEntry);
      console.log(`Added new entry for "${slug}" to blog index.`);
    }

    blogIndex.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    await fs.writeJson(BLOG_INDEX_PATH, blogIndex, { spaces: 2 });
    console.log(`Successfully updated ${BLOG_INDEX_PATH}`);

    console.log(`--- Successfully reprocessed ${mdFilename} ---`);

  } catch (error) {
    console.error(`Failed to reprocess ${mdFilename}: ${error.message}`);
    if (error.stack) {
        console.error(error.stack);
    }
    process.exit(1);
  }

  console.log('\nSingle blog post reprocessing finished.');
}

main().catch(error => {
  console.error('An unexpected error occurred during reprocessing:', error);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});