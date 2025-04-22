/**
 * Blog Content Parser for HelloEmily.dev
 * Parses block-based content structure and renders different block types
 */

class BlogContentParser {
    /**
     * Initialize the parser
     */
    constructor() {
        this.blockRenderers = {
            'text': this.renderTextBlock,
            'image': this.renderImageBlock,
            'image-grid': this.renderImageGridBlock,
            'quote': this.renderQuoteBlock,
            'code': this.renderCodeBlock,
            'video': this.renderVideoBlock
        };
    }

    /**
     * Parse and render content blocks
     * @param {Array} blocks - Array of content blocks
     * @returns {string} - HTML content
     */
    parseBlocks(blocks) {
        if (!blocks || !Array.isArray(blocks)) {
            return '<p>No content available</p>';
        }

        return blocks.map(block => {
            const renderer = this.blockRenderers[block.type];
            if (renderer) {
                return renderer.call(this, block);
            } else {
                console.warn(`Unknown block type: ${block.type}`);
                return '';
            }
        }).join('');
    }

    /**
     * Render a text block
     * @param {Object} block - Text block data
     * @returns {string} - HTML content
     */
    renderTextBlock(block) {
        // Add data-animation attribute for scroll reveal effect
        return `<div class="blog-text-block" data-animation="fade-up">${block.content}</div>`;
    }

    /**
     * --- Image Rendering with WebP Fallback ---
     * The image rendering functions (`renderImageBlock`, `renderImageGridBlock`)
     * implement a <picture> element for modern image format support.
     *
     * WebP Source Logic:
     * 1. Checks if an explicit `webpSrc` property exists in the image data object.
     *    If yes, uses that path for the WebP <source> tag.
     * 2. If `webpSrc` is not provided, it checks if the original `src` property
     *    ends with a standard image extension (.jpg, .jpeg, .png, case-insensitive).
     * 3. If it has a standard extension, it attempts to derive the WebP path by
     *    replacing the original extension with `.webp`.
     * 4. If the original `src` does not have a standard extension (e.g., CDN URL
     *    without extension), the WebP <source> tag is skipped to avoid errors.
     * 5. The original <img> tag is always included within the <picture> element
     *    (or stands alone if WebP is skipped) as a fallback for older browsers
     *    or if the WebP image fails to load. It retains the `loading="lazy"` attribute.
     */

    /**
     * Render an image block
     * @param {Object} block - Image block data
     * @returns {string} - HTML content
     */
    renderImageBlock(block) {
        const sizeClass = block.size ? `image-size-${block.size}` : 'image-size-medium';
        const positionClass = block.position ? `image-position-${block.position}` : 'image-position-center';
        const captionHtml = block.caption ? `<figcaption>${block.caption}</figcaption>` : '';
        const altText = block.alt || '';
        const baseSrc = block.src;

        // --- WebP Source Logic ---
        // Use explicit webpSrc if provided, otherwise try to derive from baseSrc.
        // Only derive if baseSrc ends with .jpg or .png (case-insensitive).
        let webpSrc = block.webpSrc || null;
        if (!webpSrc && baseSrc && /\.(jpe?g|png)$/i.test(baseSrc)) {
            webpSrc = baseSrc.replace(/\.(jpe?g|png)$/i, '.webp');
        }

        const webpSourceHtml = webpSrc
            ? `<source srcset="${webpSrc}" type="image/webp">`
            : '';
        // --- End WebP Source Logic ---

        return `
            <figure class="blog-image-block ${sizeClass} ${positionClass}" data-animation="fade-in">
                <picture>
                    ${webpSourceHtml}
                    <img src="${baseSrc}" alt="${altText}" loading="lazy">
                </picture>
                ${captionHtml}
            </figure>
        `;
    }

    /**
     * Render an image grid block
     * @param {Object} block - Image grid block data
     * @returns {string} - HTML content
     */
    renderImageGridBlock(block) {
        if (!block.images || !block.images.length) {
            return '';
        }

        const layoutClass = block.layout ? `grid-layout-${block.layout}` : 'grid-layout-2-column';

        const imagesHtml = block.images.map((image, index) => {
            const captionHtml = image.caption ? `<figcaption>${image.caption}</figcaption>` : '';
            const altText = image.alt || '';
            const baseSrc = image.src;

            // --- WebP Source Logic (same as renderImageBlock) ---
            let webpSrc = image.webpSrc || null;
            if (!webpSrc && baseSrc && /\.(jpe?g|png)$/i.test(baseSrc)) {
                webpSrc = baseSrc.replace(/\.(jpe?g|png)$/i, '.webp');
            }

            const webpSourceHtml = webpSrc
                ? `<source srcset="${webpSrc}" type="image/webp">`
                : '';
            // --- End WebP Source Logic ---

            return `
                <figure class="grid-item" data-animation="fade-in" data-animation-delay="${index * 150}">
                    <picture>
                        ${webpSourceHtml}
                        <img src="${baseSrc}" alt="${altText}" loading="lazy">
                    </picture>
                    ${captionHtml}
                </figure>
            `;
        }).join('');

        return `
            <div class="blog-image-grid ${layoutClass}" data-animation="fade-in">
                ${imagesHtml}
            </div>
        `;
    }

    /**
     * Render a quote block
     * @param {Object} block - Quote block data
     * @returns {string} - HTML content
     */
    renderQuoteBlock(block) {
        const attributionHtml = block.attribution ? `<cite>${block.attribution}</cite>` : '';
        
        return `
            <blockquote class="blog-quote-block" data-animation="fade-in">
                <p>${block.content}</p>
                ${attributionHtml}
            </blockquote>
        `;
    }

    /**
     * Render a code block
     * @param {Object} block - Code block data
     * @returns {string} - HTML content
     */
    renderCodeBlock(block) {
        const language = block.language || 'javascript';
        
        return `
            <div class="blog-code-block" data-animation="fade-in">
                <pre><code class="language-${language}">${this.escapeHtml(block.content)}</code></pre>
            </div>
        `;
    }

    /**
     * Render a video block
     * @param {Object} block - Video block data
     * @returns {string} - HTML content
     */
    renderVideoBlock(block) {
        if (block.embedUrl) {
            return `
                <div class="blog-video-block" data-animation="fade-in">
                    <div class="video-container">
                        <iframe src="${block.embedUrl}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    ${block.caption ? `<p class="video-caption">${block.caption}</p>` : ''}
                </div>
            `;
        } else if (block.videoUrl) {
            return `
                <div class="blog-video-block" data-animation="fade-in">
                    <video controls ${block.poster ? `poster="${block.poster}"` : ''}>
                        <source src="${block.videoUrl}" type="${block.videoType || 'video/mp4'}">
                        Your browser does not support the video tag.
                    </video>
                    ${block.caption ? `<p class="video-caption">${block.caption}</p>` : ''}
                </div>
            `;
        }
        
        return '';
    }

    /**
     * Escape HTML special characters
     * @param {string} html - HTML string to escape
     * @returns {string} - Escaped HTML
     */
    escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Parse legacy content format
     * @param {string} content - HTML content string
     * @returns {Array} - Array of content blocks
     */
    parseLegacyContent(content) {
        // Convert legacy HTML content to block format
        return [
            {
                type: 'text',
                content: content
            }
        ];
    }
}

// Export the parser
window.BlogContentParser = BlogContentParser;