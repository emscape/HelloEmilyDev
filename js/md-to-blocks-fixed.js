/**
 * Markdown to Blocks Converter
 * Converts markdown content to block-based format for HelloEmily.dev blog
 */

class MarkdownToBlocks {
    /**
     * Convert markdown to blocks
     * @param {string} markdown - Markdown content
     * @param {string} postFolder - Optional folder name for fixing image paths
     * @returns {Array} - Array of content blocks
     */
    convert(markdown, postFolder = "") {
        const lines = markdown.split('\n');
        const blocks = [];
        let currentBlock = null;
        let inList = false;
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (line === '') {
                // If we were in a list, finish it
                if (inList) {
                    blocks.push({
                        type: 'text',
                        content: `<ul>${listItems.join('')}</ul>`
                    });
                    inList = false;
                    listItems = [];
                }
                continue;
            }
            
            // Handle headings
            if (line.startsWith('# ')) {
                blocks.push({
                    type: 'text',
                    content: `<h1>${line.substring(2)}</h1>`
                });
                continue;
            }
            
            if (line.startsWith('## ')) {
                blocks.push({
                    type: 'text',
                    content: `<h2>${line.substring(3)}</h2>`
                });
                continue;
            }
            
            if (line.startsWith('### ')) {
                blocks.push({
                    type: 'text',
                    content: `<h3>${line.substring(4)}</h3>`
                });
                continue;
            }
            
            // Handle images with support for various formats
            const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
            if (imageMatch) {
                const imagePath = imageMatch[2];
                const imageAlt = imageMatch[1];
                
                // Check if image format is supported
                const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
                const fileExtension = imagePath.substring(imagePath.lastIndexOf('.')).toLowerCase();
                
                // Fix image path if it's a relative path and postFolder is provided
                let fixedImagePath = imagePath;
                if (postFolder && !imagePath.startsWith('images/') && !imagePath.startsWith('/')) {
                    fixedImagePath = `images/blog/${postFolder}/${imagePath}`;
                }
                
                if (supportedFormats.includes(fileExtension) || 
                    supportedFormats.some(format => imagePath.toLowerCase().includes(format))) {
                    blocks.push({
                        type: 'image',
                        src: fixedImagePath,
                        alt: imageAlt,
                        size: 'medium',
                        position: 'center'
                    });
                } else {
                    console.warn(`Unsupported image format: ${imagePath}`);
                    // Add as text block with warning
                    blocks.push({
                        type: 'text',
                        content: `<p><em>Image with unsupported format: ${fixedImagePath}</em></p>`
                    });
                }
                continue;
            }
            
            // Handle lists
            if (line.startsWith('- ')) {
                inList = true;
                listItems.push(`<li>${this.formatInlineMarkdown(line.substring(2))}</li>`);
                continue;
            }
            
            // Handle paragraphs
            if (!inList) {
                blocks.push({
                    type: 'text',
                    content: `<p>${this.formatInlineMarkdown(line)}</p>`
                });
            }
        }
        
        // If we ended with a list, add it
        if (inList) {
            blocks.push({
                type: 'text',
                content: `<ul>${listItems.join('')}</ul>`
            });
        }
        
        return blocks;
    }
    
    /**
     * Format inline markdown elements
     * @param {string} text - Text to format
     * @returns {string} - Formatted HTML
     */
    formatInlineMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    }
}

// Export the class for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownToBlocks;
} else {
    // For browser environments
    window.MarkdownToBlocks = MarkdownToBlocks;
}