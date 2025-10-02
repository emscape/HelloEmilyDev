/**
 * Tests for Blog Content Parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseBlocks,
  parseLegacyContent,
  renderBlock,
  renderTextBlock,
  renderImageBlock,
  renderQuoteBlock,
  renderCodeBlock,
  BLOCK_RENDERERS
} from '../js/blog-content-parser.js';

describe('Blog Content Parser', () => {
  describe('renderTextBlock', () => {
    it('should render text block with animation', () => {
      const block = { type: 'text', content: '<p>Hello World</p>' };
      const result = renderTextBlock(block);
      expect(result).toContain('blog-text-block');
      expect(result).toContain('data-animation="fade-up"');
      expect(result).toContain('<p>Hello World</p>');
    });

    it('should handle empty content', () => {
      const block = { type: 'text', content: '' };
      const result = renderTextBlock(block);
      expect(result).toContain('blog-text-block');
    });
  });

  describe('renderImageBlock', () => {
    it('should render image with all properties', () => {
      const block = {
        type: 'image',
        src: '/images/test.jpg',
        alt: 'Test Image',
        caption: 'A test image',
        size: 'large',
        position: 'center'
      };
      const result = renderImageBlock(block);
      
      expect(result).toContain('blog-image-block');
      expect(result).toContain('image-size-large');
      expect(result).toContain('image-position-center');
      expect(result).toContain('/images/test.jpg');
      expect(result).toContain('Test Image');
      expect(result).toContain('A test image');
    });

    it('should use default size and position', () => {
      const block = {
        type: 'image',
        src: '/images/test.jpg',
        alt: 'Test'
      };
      const result = renderImageBlock(block);
      
      expect(result).toContain('image-size-medium');
      expect(result).toContain('image-position-center');
    });

    it('should handle missing caption', () => {
      const block = {
        type: 'image',
        src: '/images/test.jpg',
        alt: 'Test'
      };
      const result = renderImageBlock(block);
      
      expect(result).not.toContain('<figcaption>');
    });

    it('should generate WebP source for JPEG', () => {
      const block = {
        type: 'image',
        src: '/images/test.jpg',
        alt: 'Test'
      };
      const result = renderImageBlock(block);
      
      expect(result).toContain('/images/test.webp');
      expect(result).toContain('type="image/webp"');
    });

    it('should generate WebP source for PNG', () => {
      const block = {
        type: 'image',
        src: '/images/test.png',
        alt: 'Test'
      };
      const result = renderImageBlock(block);
      
      expect(result).toContain('/images/test.webp');
    });

    it('should use explicit webpSrc if provided', () => {
      const block = {
        type: 'image',
        src: '/images/test.jpg',
        webpSrc: '/images/custom.webp',
        alt: 'Test'
      };
      const result = renderImageBlock(block);
      
      expect(result).toContain('/images/custom.webp');
    });

    it('should escape alt text', () => {
      const block = {
        type: 'image',
        src: '/images/test.jpg',
        alt: '<script>alert("XSS")</script>'
      };
      const result = renderImageBlock(block);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should sanitize image URLs', () => {
      const block = {
        type: 'image',
        src: 'javascript:alert(1)',
        alt: 'Test'
      };
      const result = renderImageBlock(block);
      
      expect(result).not.toContain('javascript:');
      expect(result).toContain('about:blank');
    });
  });

  describe('renderQuoteBlock', () => {
    it('should render quote with attribution', () => {
      const block = {
        type: 'quote',
        content: 'To be or not to be',
        attribution: 'Shakespeare'
      };
      const result = renderQuoteBlock(block);
      
      expect(result).toContain('blog-quote-block');
      expect(result).toContain('To be or not to be');
      expect(result).toContain('<cite>Shakespeare</cite>');
    });

    it('should render quote without attribution', () => {
      const block = {
        type: 'quote',
        content: 'A quote without attribution'
      };
      const result = renderQuoteBlock(block);
      
      expect(result).toContain('A quote without attribution');
      expect(result).not.toContain('<cite>');
    });

    it('should escape attribution', () => {
      const block = {
        type: 'quote',
        content: 'Quote',
        attribution: '<script>alert(1)</script>'
      };
      const result = renderQuoteBlock(block);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('renderCodeBlock', () => {
    it('should render code with language', () => {
      const block = {
        type: 'code',
        content: 'const x = 10;',
        language: 'javascript'
      };
      const result = renderCodeBlock(block);

      expect(result).toContain('blog-code-block');
      expect(result).toContain('language-javascript');
      // Code is escaped for security
      expect(result).toContain('const x &#x3D; 10;');
    });

    it('should use default language', () => {
      const block = {
        type: 'code',
        content: 'code here'
      };
      const result = renderCodeBlock(block);
      
      expect(result).toContain('language-javascript');
    });

    it('should escape code content', () => {
      const block = {
        type: 'code',
        content: '<script>alert("XSS")</script>',
        language: 'html'
      };
      const result = renderCodeBlock(block);
      
      expect(result).not.toContain('<script>alert');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should escape language name', () => {
      const block = {
        type: 'code',
        content: 'code',
        language: '<script>alert(1)</script>'
      };
      const result = renderCodeBlock(block);
      
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('renderBlock', () => {
    it('should render text block', () => {
      const block = { type: 'text', content: 'Hello' };
      const result = renderBlock(block);
      expect(result).toContain('blog-text-block');
    });

    it('should render image block', () => {
      const block = { type: 'image', src: '/test.jpg', alt: 'Test' };
      const result = renderBlock(block);
      expect(result).toContain('blog-image-block');
    });

    it('should render quote block', () => {
      const block = { type: 'quote', content: 'Quote' };
      const result = renderBlock(block);
      expect(result).toContain('blog-quote-block');
    });

    it('should render code block', () => {
      const block = { type: 'code', content: 'code' };
      const result = renderBlock(block);
      expect(result).toContain('blog-code-block');
    });

    it('should return empty string for unknown type', () => {
      const block = { type: 'unknown', content: 'test' };
      const result = renderBlock(block);
      expect(result).toBe('');
    });
  });

  describe('parseBlocks', () => {
    it('should parse array of blocks', () => {
      const blocks = [
        { type: 'text', content: '<p>Paragraph 1</p>' },
        { type: 'text', content: '<p>Paragraph 2</p>' }
      ];
      const result = parseBlocks(blocks);
      
      expect(result).toContain('Paragraph 1');
      expect(result).toContain('Paragraph 2');
    });

    it('should handle empty array', () => {
      const result = parseBlocks([]);
      // Empty array returns empty string (no blocks to render)
      expect(result).toBe('');
    });

    it('should handle null', () => {
      const result = parseBlocks(null);
      expect(result).toBe('<p>No content available</p>');
    });

    it('should handle undefined', () => {
      const result = parseBlocks(undefined);
      expect(result).toBe('<p>No content available</p>');
    });

    it('should handle mixed block types', () => {
      const blocks = [
        { type: 'text', content: '<p>Text</p>' },
        { type: 'image', src: '/test.jpg', alt: 'Image' },
        { type: 'quote', content: 'Quote' },
        { type: 'code', content: 'code' }
      ];
      const result = parseBlocks(blocks);
      
      expect(result).toContain('blog-text-block');
      expect(result).toContain('blog-image-block');
      expect(result).toContain('blog-quote-block');
      expect(result).toContain('blog-code-block');
    });

    it('should skip unknown block types', () => {
      const blocks = [
        { type: 'text', content: '<p>Text</p>' },
        { type: 'unknown', content: 'Unknown' },
        { type: 'text', content: '<p>More text</p>' }
      ];
      const result = parseBlocks(blocks);
      
      expect(result).toContain('Text');
      expect(result).toContain('More text');
      expect(result).not.toContain('Unknown');
    });
  });

  describe('parseLegacyContent', () => {
    it('should convert HTML string to text block', () => {
      const html = '<p>Legacy content</p>';
      const result = parseLegacyContent(html);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe(html);
    });

    it('should handle empty string', () => {
      const result = parseLegacyContent('');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe('');
    });
  });

  describe('BLOCK_RENDERERS', () => {
    it('should have all required renderers', () => {
      expect(BLOCK_RENDERERS).toHaveProperty('text');
      expect(BLOCK_RENDERERS).toHaveProperty('html');
      expect(BLOCK_RENDERERS).toHaveProperty('image');
      expect(BLOCK_RENDERERS).toHaveProperty('image-grid');
      expect(BLOCK_RENDERERS).toHaveProperty('quote');
      expect(BLOCK_RENDERERS).toHaveProperty('code');
      expect(BLOCK_RENDERERS).toHaveProperty('video');
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(BLOCK_RENDERERS)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should render complete blog post', () => {
      const blocks = [
        { type: 'text', content: '<h1>Title</h1><p>Introduction</p>' },
        { type: 'image', src: '/hero.jpg', alt: 'Hero', caption: 'Hero image' },
        { type: 'text', content: '<p>More content</p>' },
        { type: 'quote', content: 'Important quote', attribution: 'Author' },
        { type: 'code', content: 'const x = 10;', language: 'javascript' }
      ];

      const result = parseBlocks(blocks);

      expect(result).toContain('Title');
      expect(result).toContain('Introduction');
      expect(result).toContain('Hero image');
      expect(result).toContain('Important quote');
      // Code is escaped for security
      expect(result).toContain('const x &#x3D; 10;');
    });
  });
});

