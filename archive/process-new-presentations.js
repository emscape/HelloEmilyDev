const fs = require('fs');
const path = require('path');

// --- Configuration ---
const newDir = path.join(__dirname, 'presentations', 'new');
const postedDir = path.join(__dirname, 'presentations', 'posted');
const imageDestDir = path.join(__dirname, 'images', 'presentations');
const jsonDataPath = path.join(__dirname, 'presentations', 'presentations-data.json');
// --- End Configuration ---

// Helper function to parse frontmatter (Node.js version)
function parseFrontmatter(mdText) {
    const frontmatter = {};
    const match = mdText.match(/^---\s*([\s\S]*?)\s*---/);
    if (match && match[1]) {
        const fmText = match[1].trim();
        const lines = fmText.split('\n');
        lines.forEach(line => {
            const titleMatch = line.match(/^title:\s*["']?(.*?)["']?\s*$/);
            if (titleMatch) frontmatter.title = titleMatch[1];

            const tagsMatch = line.match(/^tags:\s*\[(.*?)\]\s*$/);
            if (tagsMatch && tagsMatch[1]) {
                frontmatter.tags = tagsMatch[1].split(',')
                                     .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
                                     .filter(tag => tag);
            }
        });
    }
    // Basic validation
    if (!frontmatter.title) {
        console.warn("Markdown file missing 'title' in frontmatter.");
        // Decide if this should be an error or just a warning
    }
     if (!frontmatter.tags) {
        frontmatter.tags = []; // Default to empty array if tags missing
        console.warn("Markdown file missing 'tags' in frontmatter. Defaulting to empty array.");
    }
    return frontmatter;
}

// Helper function to find a file matching a base pattern (e.g., base-featured.*)
function findFileByBase(directory, basePattern) {
    try {
        const files = fs.readdirSync(directory);
        const regex = new RegExp(`^${basePattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\.\\w+$`); // Match basePattern exactly followed by an extension
        const foundFile = files.find(file => regex.test(file));
        return foundFile ? path.join(directory, foundFile) : null;
    } catch (err) {
        console.error(`Error reading directory ${directory}:`, err);
        return null;
    }
}


// --- Main Processing Logic ---
function processNewPresentations() {
    console.log(`Scanning for new presentations in: ${newDir}`);

    if (!fs.existsSync(newDir)) {
        console.log(`'${newDir}' does not exist. Creating it.`);
        try {
            fs.mkdirSync(newDir, { recursive: true });
            console.log(`Directory created. Place new presentation assets (MD, PDF, Image) in here and run the script again.`);
            return; // Exit script after creating directory
        } catch (err) {
            console.error(`Failed to create directory ${newDir}:`, err);
            return; // Exit if directory creation fails
        }
    }
     if (!fs.existsSync(postedDir)) {
        console.log(`'${postedDir}' does not exist. Creating it.`);
        try {
            fs.mkdirSync(postedDir, { recursive: true });
        } catch (err) {
            console.error(`Failed to create directory ${postedDir}:`, err);
            return; 
        }
    }
     if (!fs.existsSync(imageDestDir)) {
        console.log(`'${imageDestDir}' does not exist. Creating it.`);
         try {
            fs.mkdirSync(imageDestDir, { recursive: true });
        } catch (err) {
            console.error(`Failed to create directory ${imageDestDir}:`, err);
            return; 
        }
    }


    let presentationsData = [];
    try {
        if (fs.existsSync(jsonDataPath)) {
            const rawData = fs.readFileSync(jsonDataPath, 'utf8');
            presentationsData = JSON.parse(rawData);
            if (!Array.isArray(presentationsData)) {
                 console.error(`Error: ${jsonDataPath} does not contain a valid JSON array.`);
                 presentationsData = []; // Start fresh if format is wrong
            }
        } else {
             console.log(`${jsonDataPath} not found. A new file will be created.`);
        }
    } catch (err) {
        console.error(`Error reading or parsing ${jsonDataPath}:`, err);
        // Decide if we should stop or try to continue/overwrite
        return; 
    }

    let filesProcessed = 0;
    try {
        const files = fs.readdirSync(newDir);

        files.forEach(file => {
            if (path.extname(file).toLowerCase() === '.md') {
                const mdFilePath = path.join(newDir, file);
                const parsedPath = path.parse(file);
                const baseName = parsedPath.name; // e.g., 'some-talk-card'

                // Derive expected names
                const pdfBaseName = baseName.replace(/-card$/, ''); // e.g., 'some-talk'
                const imageBaseName = baseName.replace(/-card$/, '-featured'); // e.g., 'some-talk-featured'
                
                const expectedPdfName = `${pdfBaseName}.pdf`;
                const pdfPath = path.join(newDir, expectedPdfName);
                const imagePath = findFileByBase(newDir, imageBaseName); // Find image like 'some-talk-featured.*'

                console.log(`\nProcessing Markdown: ${file}`);

                // --- Check required files ---
                if (!fs.existsSync(pdfPath)) {
                    console.warn(`  - Skipping: Corresponding PDF '${expectedPdfName}' not found in ${newDir}.`);
                    return; // Skip this MD file
                }
                if (!imagePath) {
                    console.warn(`  - Skipping: Corresponding image '${imageBaseName}.* (e.g. .png, .jpg)' not found in ${newDir}.`);
                    return; // Skip this MD file
                }

                // --- Parse Markdown ---
                let frontmatter;
                try {
                    const mdContent = fs.readFileSync(mdFilePath, 'utf8');
                    frontmatter = parseFrontmatter(mdContent);
                    if (!frontmatter.title) { // Check if title was parsed
                         console.warn(`  - Skipping: Could not parse 'title' from frontmatter in ${file}.`);
                         return;
                    }
                } catch (err) {
                    console.error(`  - Skipping: Error reading or parsing Markdown file ${file}:`, err);
                    return;
                }

                // --- Define Destination Paths ---
                const destMdPath = path.join(postedDir, file);
                const destPdfPath = path.join(postedDir, expectedPdfName);
                const imageExt = path.extname(imagePath);
                const destImageName = `${pdfBaseName}-featured${imageExt}`; // Consistent naming based on PDF base
                const destImagePath = path.join(imageDestDir, destImageName);

                // --- Check for existing entry in JSON ---
                 const relativeDestMdPath = path.relative(__dirname, destMdPath).replace(/\\/g, '/');
                 if (presentationsData.some(p => p.cardMarkdownPath === relativeDestMdPath)) {
                     console.warn(`  - Skipping: Presentation already exists in ${jsonDataPath} for ${relativeDestMdPath}.`);
                     return;
                 }


                // --- Move Files ---
                try {
                    console.log(`  - Moving ${file} to ${postedDir}`);
                    fs.renameSync(mdFilePath, destMdPath);

                    console.log(`  - Moving ${expectedPdfName} to ${postedDir}`);
                    fs.renameSync(pdfPath, destPdfPath);
                    
                    const sourceImageName = path.basename(imagePath);
                    console.log(`  - Moving ${sourceImageName} to ${imageDestDir} as ${destImageName}`);
                    fs.renameSync(imagePath, destImagePath);

                } catch (err) {
                    console.error(`  - Error moving files for ${baseName}:`, err);
                    // Attempt to rollback or log inconsistency? For now, just log and skip JSON update.
                    // TODO: Consider adding rollback logic if moves fail partially.
                    return; 
                }

                // --- Create and Add JSON Entry ---
                const newEntry = {
                    cardMarkdownPath: relativeDestMdPath, // Store relative path
                    pdfPath: path.relative(__dirname, destPdfPath).replace(/\\/g, '/'),
                    thumbnail: path.relative(__dirname, destImagePath).replace(/\\/g, '/'),
                    relatedBlogPostUrl: null, // Default, can be added manually
                    longDescriptionMarkdown: "" // Default
                };

                presentationsData.push(newEntry);
                filesProcessed++;
                console.log(`  - Successfully processed and added '${frontmatter.title}' to data.`);

            } // end if .md
        }); // end forEach file

    } catch (err) {
        console.error(`Error reading directory ${newDir}:`, err);
        return; // Stop processing if cannot read directory
    }


    // --- Write Updated JSON Data ---
    if (filesProcessed > 0) {
        try {
            fs.writeFileSync(jsonDataPath, JSON.stringify(presentationsData, null, 2), 'utf8');
            console.log(`\nSuccessfully updated ${jsonDataPath} with ${filesProcessed} new presentation(s).`);
        } catch (err) {
            console.error(`Error writing updated data to ${jsonDataPath}:`, err);
        }
    } else {
        console.log("\nNo new presentations processed.");
    }
}

// --- Run the script ---
processNewPresentations();