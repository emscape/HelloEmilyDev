// Helper function to parse frontmatter (simplified)
function parseFrontmatterAndBody(mdText) {
    const frontmatter = {};
    let body = mdText.trim(); // Default body is the whole text if no frontmatter

    const frontmatterMatch = mdText.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

    if (frontmatterMatch && frontmatterMatch[1]) {
        const fmText = frontmatterMatch[1].trim();
        body = frontmatterMatch[2] ? frontmatterMatch[2].trim() : ''; // Body is content after frontmatter

        const lines = fmText.split('\n');
        lines.forEach(line => {
            const titleMatch = line.match(/^title:\s*["']?(.*?)["']?\s*$/);
            if (titleMatch) frontmatter.title = titleMatch[1];
            
            // Removed description parsing from frontmatter as it's no longer used there
            
            const tagsMatch = line.match(/^tags:\s*\[(.*?)\]\s*$/); // Non-greedy match for tags
            if (tagsMatch && tagsMatch[1]) {
                // Split tags, trim whitespace, remove potential quotes
                frontmatter.tags = tagsMatch[1].split(',')
                                     .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
                                     .filter(tag => tag); // Remove empty tags resulting from trailing commas etc.
            }
        });
    }
    return { frontmatter, body };
}

// Helper function to populate tags
function populateTags(tagsDivElement, tagsArray) {
    tagsDivElement.innerHTML = ''; // Clear existing
    if (tagsArray && tagsArray.length > 0) {
        tagsArray.forEach(tagText => {
            const tagSpan = document.createElement('span');
            tagSpan.classList.add('tag');
            tagSpan.textContent = tagText;
            tagsDivElement.appendChild(tagSpan);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const presentationsList = document.getElementById('presentations-list');
    if (!presentationsList) {
        console.error('Error: Element with ID "presentations-list" not found.');
        return;
    }

    fetch('../presentations/presentations-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error fetching presentations data! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                console.error('Error: Presentation data is not an array.');
                return;
            }

            // Use Promise.all to handle all fetches concurrently
            const presentationPromises = data.map(presentation => {
                // Basic validation of JSON entry
                if (!presentation.cardMarkdownPath || !presentation.pdfPath || !presentation.thumbnail) {
                    console.error('Skipping presentation due to missing required JSON fields (cardMarkdownPath, pdfPath, thumbnail):', presentation);
                    return Promise.resolve(null); // Resolve with null to filter out later
                }

                return fetch(presentation.cardMarkdownPath)
                    .then(res => {
                        if (!res.ok) {
                            console.error(`Error fetching Markdown for ${presentation.cardMarkdownPath}: ${res.status}. Skipping this presentation.`);
                            // Return null or a specific error object if needed downstream
                            return Promise.resolve(null); // Resolve with null to filter out
                        }
                        return res.text();
                    })
                    .then(mdText => {
                        if (mdText === null) return null; // Skip if fetch failed

                        const parsed = parseFrontmatterAndBody(mdText);
                        
                        // Combine parsed data with essential JSON data
                        return {
                            // Data primarily from Markdown
                            title: parsed.frontmatter.title || 'Untitled Presentation', // Fallback title
                            descriptionHTML: parsed.body || '<p>Description not available.</p>', // Fallback description
                            tags: parsed.frontmatter.tags || [], // Fallback empty tags array
                            // Data from JSON
                            thumbnail: presentation.thumbnail,
                            pdfPath: presentation.pdfPath,
                            relatedBlogPostUrl: presentation.relatedBlogPostUrl 
                        };
                    })
                    .catch(error => {
                        console.error(`Error processing presentation defined by ${presentation.cardMarkdownPath}:`, error);
                        return null; // Resolve with null on error to filter out
                    });
            });

            return Promise.all(presentationPromises);
        })
        .then(processedPresentations => {
            // Filter out any null results from failed fetches/parses
            const validPresentations = processedPresentations.filter(p => p !== null);

            if (validPresentations.length === 0) {
                 presentationsList.innerHTML = '<p>No presentations found or failed to load all presentations.</p>';
                 return;
            }

            validPresentations.forEach(details => {
                const presentationItem = document.createElement('div');
                presentationItem.classList.add('presentation-item');

                const thumbnail = document.createElement('img');
                thumbnail.src = details.thumbnail;
                thumbnail.alt = `Thumbnail for ${details.title}`;
                thumbnail.classList.add('presentation-thumbnail');

                const titleElement = document.createElement('h3');
                titleElement.textContent = details.title;

                const descriptionElement = document.createElement('div');
                descriptionElement.classList.add('presentation-description');
                descriptionElement.innerHTML = details.descriptionHTML; // Use parsed body
                
                const tagsDiv = document.createElement('div');
                tagsDiv.classList.add('presentation-tags');
                populateTags(tagsDiv, details.tags); // Use parsed tags

                const contentDiv = document.createElement('div');
                contentDiv.classList.add('presentation-item-content');

                contentDiv.appendChild(titleElement);
                contentDiv.appendChild(descriptionElement);
                if (tagsDiv.hasChildNodes()) { // Only append if there are tags
                    contentDiv.appendChild(tagsDiv); 
                }
                
                const pdfLink = document.createElement('a');
                pdfLink.href = details.pdfPath;
                pdfLink.textContent = 'View/Download PDF';
                pdfLink.target = '_blank';
                pdfLink.classList.add('presentation-link'); 

                contentDiv.appendChild(pdfLink);

                if (details.relatedBlogPostUrl && details.relatedBlogPostUrl.trim() !== '') {
                    const blogPostBtn = document.createElement('a');
                    blogPostBtn.href = details.relatedBlogPostUrl;
                    blogPostBtn.textContent = 'Read Blog Post';
                    blogPostBtn.target = '_blank';
                    blogPostBtn.classList.add('btn', 'blog-post-btn');
                    contentDiv.appendChild(blogPostBtn);
                }

                presentationItem.appendChild(thumbnail);
                presentationItem.appendChild(contentDiv);

                presentationsList.appendChild(presentationItem);
            });
        })
        .catch(error => {
            // Catch errors from the initial fetch of presentations-data.json or Promise.all
            console.error('Error loading presentations:', error);
            presentationsList.innerHTML = '<p>Error loading presentations. Please try again later.</p>';
        });
});