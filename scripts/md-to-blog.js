/**
 * Markdown to Blog JSON Converter
 *
 * This script converts markdown files from the blog-drafts folder
 * to the JSON format required by the blog system.
 *
 * Usage: node js/md-to-blog.js [filename.md]
 * If no filename is provided, it will process all .md files in the blog-drafts folder
 * except for README.md.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

// Directories
const DRAFTS_DIR = path.join(__dirname, '..', 'blog-drafts');
const BLOG_INDEX_PATH = path.join(__dirname, '..', 'blog-index.json'); // Corrected path for the main index
const POST_FILES_DIR = path.join(__dirname, '..', 'blog'); // Base directory for new blog post structure
const PROCESSED_DRAFTS_DIR = path.join(DRAFTS_DIR, 'processed'); // Directory for processed markdown files
const BLOG_POST_TEMPLATE_PATH = path.join(__dirname, '..', 'blog-post-template.html'); // Path to the HTML template

/**
 * Parses a markdown file and extracts the metadata and content
 * @param {string} filePath - Path to the markdown file
 * @param {string} baseFilename - The base name of the markdown file (without extension)
 * @returns {Object} - Parsed blog post data
 */
function parseMarkdownFile(filePath, baseFilename) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split(/\r\n|\r|\n/); // Normalize newlines during split

  // Attempt to parse YAML frontmatter first
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;
  const yamlMatch = fileContent.match(frontmatterRegex);
  let metadata = {};
  let contentMarkdown = '';
  let title = '';
  let shortDescription = '';

  if (yamlMatch) {
    console.log(`Found YAML frontmatter in ${filePath}`);
    const frontmatterString = yamlMatch[1];
    metadata = yaml.load(frontmatterString);
    contentMarkdown = fileContent.substring(yamlMatch[0].length).trim();
    title = metadata.title || path.basename(filePath, '.md');
    shortDescription = metadata.shortDescription || '';
  } else {
    console.log(`No YAML frontmatter found in ${filePath}, attempting old format parsing.`);
    // Fallback to old parsing logic (section-based)
    title = lines[0].replace(/^#\s+/, '').trim();

    const metadataStartIndex = lines.findIndex(line => line.trim().toLowerCase() === '## metadata');
    const shortDescStartIndex = lines.findIndex(line => line.trim().toLowerCase() === '## short description');
    const contentStartIndex = lines.findIndex(line => line.trim().toLowerCase() === '## content');

    if (metadataStartIndex === -1 || shortDescStartIndex === -1 || contentStartIndex === -1) {
      // If old format also fails, decide on a default or throw more specific error
      console.warn(`File ${filePath} does not conform to YAML or old section format. Attempting basic content extraction.`);
      contentMarkdown = lines.slice(1).join('\n').trim(); // Use everything after title as content
      metadata = {}; // Ensure metadata is an empty object
      // title is already set from the first line
      shortDescription = ''; // No short description if format is unknown
    } else {
        const metadataLines = lines.slice(metadataStartIndex + 1, shortDescStartIndex);
        metadataLines.forEach(line => {
            const match = line.match(/^-\s+([^:]+):\s+(.+)$/);
            if (match) {
                const key = match[1].trim().toLowerCase().replace(/\s+/g, ''); // Normalize key (e.g., featuredimage)
                const value = match[2].trim();

                if (key === 'tags') {
                    metadata.tags = value.split(',').map(tag => tag.trim());
                } else if (key === 'featured') {
                    metadata.featured = value.toLowerCase() === 'true';
                } else {
                    metadata[key] = value; // Store with normalized key
                }
            }
        });

        shortDescription = lines
            .slice(shortDescStartIndex + 1, contentStartIndex)
            .filter(line => line.trim() !== '')
            .join(' ')
            .trim();

        contentMarkdown = lines.slice(contentStartIndex + 1).join('\n').trim();
    }
  }

  // Ensure tags is an array
  let tags = metadata.tags || [];
  if (typeof tags === 'string') {
    tags = tags.split(',').map(tag => tag.trim());
  } else if (!Array.isArray(tags)) {
    tags = [];
  }

  let contentHtml = convertMarkdownToHtml(contentMarkdown);
  const id = baseFilename; // Use the markdown filename as the ID

  // Consolidate featuredImage access (old script used 'featuredimage' and 'featuredImage')
  let featuredImg = metadata.featuredimage || metadata.featuredImage || metadata.FeaturedImage || '';

  // Normalize image paths to be root-relative
  function normalizeImagePath(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return '';
    // If it's an absolute URL or already root-relative, return as is
    if (/^(https?:)?\/\//i.test(imagePath) || imagePath.startsWith('/')) {
      return imagePath;
    }
    // Otherwise, make it root-relative
    return '/' + imagePath.replace(/^(\.\.\/|\.\/)+/, '');
  }

  featuredImg = normalizeImagePath(featuredImg);

  return {
    id,
    title: title,
    shortDescription: shortDescription,
    content: contentHtml,
    author: metadata.author || 'Emily Anderson',
    date: metadata.date ? new Date(metadata.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    tags: tags,
    featuredImage: featuredImg,
    featured: typeof metadata.featured === 'boolean' ? metadata.featured : false
  };
}

/**
 * Processes inline markdown (bold, italic, links, images).
 * @param {string} text - The text to process.
 * @returns {string} - HTML representation of the inline markdown.
 */
function processInlineMarkdown(text) {
    let processed = text;

    // Images: ![alt](src)
    processed = processed.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        let imgSrc = src.trim();
        // Normalize image path to be root-relative if not already absolute or root-relative
        if (!/^(https?:)?\/\//i.test(imgSrc) && !imgSrc.startsWith('/')) {
            imgSrc = '/' + imgSrc.replace(/^(\.\.\/|\.\/)+/, '');
        }
        return `<img src="${imgSrc}" alt="${alt.trim()}">`;
    });

    // Links: [text](url)
    processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
        let linkUrl = url.trim();
        // Normalize link path to be root-relative if not already absolute or root-relative
        if (!/^(https?:)?\/\//i.test(linkUrl) && !linkUrl.startsWith('/')) {
            linkUrl = '/' + linkUrl.replace(/^(\.\.\/|\.\/)+/, '');
        }
        return `<a href="${linkUrl}">${linkText.trim()}</a>`;
    });

    // Bold: **text**
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (assumes '*' is not used for lists, as '-' is used)
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    return processed;
}

/**
 * Parses a block of GFM table lines into HTML.
 * @param {string[]} tableLines - Array of markdown lines forming the table.
 * @returns {string} - HTML representation of the table.
 */
function parseGfmTable(tableLines) {
    if (tableLines.length < 2) return ''; // Header and separator are required

    let html = '<table>\n';
    const headerLine = tableLines[0];
    // const separatorLine = tableLines[1]; // Separator line defines alignment, not used in this basic version for cell styling
    const dataLines = tableLines.slice(2);

    // Process header
    const headerCells = headerLine.trim().slice(1, -1).split('|').map(cell => cell.trim());
    html += '  <thead>\n    <tr>\n';
    headerCells.forEach(cell => {
        html += `      <th>${processInlineMarkdown(cell)}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';

    // Process body
    html += '  <tbody>\n';
    if (dataLines.length > 0) {
        dataLines.forEach(rowLineContent => {
            if (!rowLineContent.trim()) return;
            const rowCells = rowLineContent.trim().slice(1, -1).split('|').map(cell => cell.trim());
            html += '    <tr>\n';
            rowCells.forEach(cell => {
                html += `      <td>${processInlineMarkdown(cell)}</td>\n`;
            });
            html += '    </tr>\n';
        });
    }
    html += '  </tbody>\n</table>';
    return html;
}

/**
 * Converts markdown content to HTML.
 * Handles headers, GFM tables, lists, and paragraphs with inline formatting.
 * @param {string} markdown - Markdown content.
 * @returns {string} - HTML content.
 */
function convertMarkdownToHtml(markdown) {
    const lines = markdown.split(/\r\n|\r|\n/);
    let htmlOutput = [];
    let i = 0;
    let inList = false;
    let paragraphBuffer = '';

    const flushParagraph = () => {
        if (paragraphBuffer) {
            // Paragraph buffer already contains processed inline markdown
            htmlOutput.push(`<p>${paragraphBuffer.trim()}</p>`);
            paragraphBuffer = '';
        }
    };

    const closeList = () => {
        if (inList) {
            htmlOutput.push('</ul>');
            inList = false;
        }
    };

    while (i < lines.length) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // 1. Headers
        if (line.startsWith('# ')) {
            flushParagraph(); closeList();
            htmlOutput.push(`<h1>${processInlineMarkdown(line.substring(2).trim())}</h1>`);
        } else if (line.startsWith('## ')) {
            flushParagraph(); closeList();
            htmlOutput.push(`<h2>${processInlineMarkdown(line.substring(3).trim())}</h2>`);
        } else if (line.startsWith('### ')) {
            flushParagraph(); closeList();
            htmlOutput.push(`<h3>${processInlineMarkdown(line.substring(4).trim())}</h3>`);
        }
        // 2. GFM Tables
        // Check for table header: | cell | cell |
        // Followed by separator: |------|------|
        else if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|') &&
                 (i + 1 < lines.length) &&
                 lines[i+1].trim().startsWith('|') && lines[i+1].trim().endsWith('|') &&
                 /\|(?: *:?---+:? *\|)+/.test(lines[i+1].trim())) {

            flushParagraph(); closeList();

            let tableBlockLines = [line]; // Header line
            tableBlockLines.push(lines[i+1]);    // Separator line
            let tableParseIndex = i + 2;
            // Consume data rows
            while (tableParseIndex < lines.length &&
                   lines[tableParseIndex].trim().startsWith('|') &&
                   lines[tableParseIndex].trim().endsWith('|')) {
                tableBlockLines.push(lines[tableParseIndex]);
                tableParseIndex++;
            }
            htmlOutput.push(parseGfmTable(tableBlockLines));
            i = tableParseIndex - 1; // Adjust index because of i++ at loop end
        }
        // 3. List Items (using '-' or '*' prefix)
        else if (line.match(/^\s*([*-])\s+(.*)/)) { // Updated regex to match '-' or '*'
            const listMatchResult = line.match(/^\s*([*-])\s+(.*)/); // Re-evaluate match to get capture groups
            flushParagraph(); // End current paragraph before starting a list
            if (!inList) {
                htmlOutput.push('<ul>');
                inList = true;
            }
            const listItemContent = listMatchResult[2]; // listMatchResult[2] contains the content after the marker
            htmlOutput.push(`<li>${processInlineMarkdown(listItemContent)}</li>`);
        }
        // 4. Empty line (acts as a paragraph break)
        else if (trimmedLine === '') {
            flushParagraph();
            closeList(); // An empty line also closes an open list
        }
        // 5. Paragraph content
        else {
            closeList(); // Any non-list, non-empty, non-special line closes a list
            // Add line to paragraph buffer, processing inline markdown for the line
            paragraphBuffer += (paragraphBuffer ? ' ' : '') + processInlineMarkdown(line);
        }
        i++;
    }

    flushParagraph(); // Flush any remaining paragraph content
    closeList(); // Close any remaining list

    return htmlOutput.join('\n').trim();
}

/**
 * Processes a single markdown file and adds it to the blog data
 * @param {string} filePath - Path to the markdown file
 * @param {Object} indexData - Current blog index data
 * @returns {Object} - Updated blog index data
 */
function processMarkdownFile(filePath, indexData) {
  try {
    console.log(`Processing ${filePath}...`);
    const baseFilename = path.basename(filePath, '.md');
    const fullPostData = parseMarkdownFile(filePath, baseFilename); // This contains the full post, including content

    // Create the directory for the post, e.g., blog/my-post-slug/
    const postDirectory = path.join(POST_FILES_DIR, fullPostData.id);
    if (!fs.existsSync(postDirectory)) {
      fs.mkdirSync(postDirectory, { recursive: true });
      console.log(`Created directory: ${postDirectory}`);
    }

    // Save the full post data to its individual JSON file, e.g., blog/my-post-slug/post-data.json
    const individualPostPath = path.join(postDirectory, `post-data.json`);
    fs.writeFileSync(individualPostPath, JSON.stringify(fullPostData, null, 2));
    console.log(`Saved full post to: ${individualPostPath}`);

    // Read the blog post template
    let templateContent;
    try {
      templateContent = fs.readFileSync(BLOG_POST_TEMPLATE_PATH, 'utf8');
    } catch (readError) {
      console.error(`Error reading blog post template: ${BLOG_POST_TEMPLATE_PATH}`, readError.message);
      return indexData; // Skip this post if template can't be read
    }

    // Prepare data for replacements
    const siteBaseUrl = 'https://helloemily.dev'; // Define base URL - ensure this is correct
    const postUrl = `${siteBaseUrl}/blog/${fullPostData.id}/`;
    let featuredImageUrl = fullPostData.featuredImage && fullPostData.featuredImage.trim() !== ''
        ? fullPostData.featuredImage
        : 'images/site-preview.jpg'; // Default image path relative to site root

    // Ensure featuredImageUrl is absolute
    if (!featuredImageUrl.startsWith('http') && !featuredImageUrl.startsWith('/')) {
        featuredImageUrl = `/${featuredImageUrl}`; // Make it root relative if not already
    }
    if (!featuredImageUrl.startsWith('http')) {
        featuredImageUrl = siteBaseUrl + featuredImageUrl; // Prepend base URL if not absolute
    }
    // Clean up potential double slashes from concatenation
    featuredImageUrl = featuredImageUrl.replace(/([^:]\/)\/+/g, "$1");


    // Perform replacements
    let postHtmlContent = templateContent
        .replace(/PAGE_TITLE_PLACEHOLDER/g, `${fullPostData.title} | Emily Anderson`)
        .replace(/OG_TITLE_PLACEHOLDER/g, fullPostData.title)
        .replace(/OG_URL_PLACEHOLDER/g, postUrl)
        .replace(/OG_DESCRIPTION_PLACEHOLDER/g, fullPostData.shortDescription || 'A blog post by Emily Anderson.')
        .replace(/OG_IMAGE_PLACEHOLDER/g, featuredImageUrl);

    // Save the generated HTML to the new post directory as index.html
    const outputHtmlPath = path.join(postDirectory, 'index.html');
    try {
      fs.writeFileSync(outputHtmlPath, postHtmlContent);
      console.log(`Generated HTML for post ${fullPostData.id} to: ${outputHtmlPath}`);
    } catch (writeError) {
      console.error(`Error writing HTML for post ${fullPostData.id}:`, writeError.message);
      // Decide if this error should halt processing for this file or just be logged
    }

    // Prepare metadata for the blog-index.json
    const postMetadata = {
      slug: `/blog/${fullPostData.id}/`, // New slug format for the index
      title: fullPostData.title,
      shortDescription: fullPostData.shortDescription,
      // author: fullPostData.author, // blog-index.json doesn't currently store author
      date: fullPostData.date,
      tags: fullPostData.tags,
      featuredImage: fullPostData.featuredImage,
      featured: fullPostData.featured
    };

    // Check if post with same slug already exists in the index
    const existingPostIndex = indexData.posts.findIndex(p => p.slug === postMetadata.slug);

    if (existingPostIndex !== -1) {
      // Update existing post metadata in the index
      indexData.posts[existingPostIndex] = postMetadata;
      console.log(`Updated post metadata in index: ${postMetadata.title}`);
    } else {
      // Add new post metadata to the index
      indexData.posts.push(postMetadata);
      console.log(`Added new post metadata to index: ${postMetadata.title}`);
    }

    // Move the processed markdown file
    if (!fs.existsSync(PROCESSED_DRAFTS_DIR)) {
      fs.mkdirSync(PROCESSED_DRAFTS_DIR, { recursive: true });
      console.log(`Created directory: ${PROCESSED_DRAFTS_DIR}`);
    }
    const processedFilePath = path.join(PROCESSED_DRAFTS_DIR, path.basename(filePath));
    fs.renameSync(filePath, processedFilePath);
    console.log(`Moved processed markdown file to: ${processedFilePath}`);

    return indexData;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    // If there was an error, do not move the file, return original indexData
    return indexData;
  }
}

/**
 * Main function to process markdown files
 * @param {string} [specificFile] - Optional specific file to process
 */
function main(specificFile) {
  // --- Cleanup orphaned post directories ---
  try {
    const draftFiles = fs.readdirSync(DRAFTS_DIR)
      .filter(file => file.endsWith('.md') && file !== 'README.md' && file !== 'blog-post-template.md');
    const expectedPostDirs = new Set(draftFiles.map(file => path.basename(file, '.md')));

    if (fs.existsSync(POST_FILES_DIR)) {
      const existingPostDirs = fs.readdirSync(POST_FILES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const dirName of existingPostDirs) {
        if (!expectedPostDirs.has(dirName)) {
          const dirPath = path.join(POST_FILES_DIR, dirName);
          console.log(`Deleting orphaned post directory: ${dirPath}`);
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
    }
  } catch (cleanupError) {
    console.error('Error during cleanup of orphaned post directories:', cleanupError.message);
    // Decide if this error should halt the script. For now, we'll log and continue.
  }
  // --- End cleanup ---

  // Initialize blog data
  let indexData = { posts: [] };
  console.log(`Initializing new blog index at ${BLOG_INDEX_PATH}...`);

  if (specificFile) {
    // Process specific file
    const filePath = path.join(DRAFTS_DIR, specificFile);
    if (fs.existsSync(filePath)) {
      indexData = processMarkdownFile(filePath, indexData);
    } else {
      console.error(`File not found: ${filePath}`);
      return;
    }
  } else {
    // Process all markdown files in the drafts directory
    const files = fs.readdirSync(DRAFTS_DIR);

    for (const file of files) {
      if (file.endsWith('.md') && file !== 'README.md' && file !== 'blog-post-template.md') { // Exclude template
        const filePath = path.join(DRAFTS_DIR, file);
        indexData = processMarkdownFile(filePath, indexData);
      }
    }
  }

  // Sort posts by date (newest first) in the index
  indexData.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Save updated blog index
  fs.writeFileSync(BLOG_INDEX_PATH, JSON.stringify(indexData, null, 2));
  console.log(`Blog index saved to ${BLOG_INDEX_PATH}`);
  console.log(`Total posts in index: ${indexData.posts.length}`);
}

// Check if a specific file was provided as an argument
const specificFile = process.argv[2];
main(specificFile);