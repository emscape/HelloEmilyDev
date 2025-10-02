/**
 * Tests for Security Utilities
 * Critical security functions must be thoroughly tested
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, safeHtml } from '../../js/utils/security.js';

describe('Security Utils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;');
      expect(escapeHtml("It's working")).toBe('It&#39;s working');
    });

    it('should escape less than and greater than', () => {
      expect(escapeHtml('5 < 10 > 3')).toBe('5 &lt; 10 &gt; 3');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should handle strings with no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should handle multiple special characters', () => {
      const input = '<div class="test" data-value=\'123\'>A & B</div>';
      const result = escapeHtml(input);
      expect(result).toContain('&lt;div');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#39;');
      expect(result).toContain('&amp;');
    });

    it('should prevent XSS attacks', () => {
      const xssAttempts = [
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<iframe src="javascript:alert(1)">',
        '<body onload=alert(1)>'
      ];

      xssAttempts.forEach(attempt => {
        const result = escapeHtml(attempt);
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
      });
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe HTTP URLs', () => {
      const url = 'http://example.com/page';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should allow safe HTTPS URLs', () => {
      const url = 'https://example.com/page';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should allow mailto URLs', () => {
      const url = 'mailto:test@example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should allow tel URLs', () => {
      const url = 'tel:+1234567890';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/blog/post')).toBe('/blog/post');
      expect(sanitizeUrl('./images/photo.jpg')).toBe('./images/photo.jpg');
      expect(sanitizeUrl('../about.html')).toBe('../about.html');
    });

    it('should allow hash URLs', () => {
      expect(sanitizeUrl('#section')).toBe('#section');
    });

    it('should block javascript: URLs', () => {
      const url = 'javascript:alert(1)';
      expect(sanitizeUrl(url)).toBe('about:blank');
    });

    it('should block data: URLs', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      expect(sanitizeUrl(url)).toBe('about:blank');
    });

    it('should block vbscript: URLs', () => {
      const url = 'vbscript:msgbox(1)';
      expect(sanitizeUrl(url)).toBe('about:blank');
    });

    it('should block file: URLs', () => {
      const url = 'file:///etc/passwd';
      expect(sanitizeUrl(url)).toBe('about:blank');
    });

    it('should handle URL encoding tricks', () => {
      const encodedJavascript = 'java%73cript:alert(1)';
      expect(sanitizeUrl(encodedJavascript)).toBe('about:blank');
    });

    it('should handle mixed case protocols', () => {
      expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('about:blank');
      expect(sanitizeUrl('HTTPS://example.com')).toBe('HTTPS://example.com');
    });

    it('should handle whitespace in protocols', () => {
      expect(sanitizeUrl(' javascript:alert(1)')).toBe('about:blank');
      expect(sanitizeUrl('javascript :alert(1)')).toBe('about:blank');
    });

    it('should handle empty and null URLs', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });

    it('should preserve query parameters', () => {
      const url = 'https://example.com/page?foo=bar&baz=qux';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should preserve URL fragments', () => {
      const url = 'https://example.com/page#section';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should handle complex relative paths', () => {
      expect(sanitizeUrl('/blog/2024/01/post.html')).toBe('/blog/2024/01/post.html');
      expect(sanitizeUrl('./images/photo.jpg?size=large')).toBe('./images/photo.jpg?size=large');
    });
  });

  describe('safeHtml', () => {
    it('should escape interpolated values', () => {
      const name = '<script>alert("XSS")</script>';
      const result = safeHtml`<div>Hello ${name}</div>`;
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should handle multiple interpolations', () => {
      const title = '<b>Title</b>';
      const content = '<i>Content</i>';
      const result = safeHtml`<div>${title} - ${content}</div>`;
      expect(result).toContain('&lt;b&gt;');
      expect(result).toContain('&lt;i&gt;');
    });

    it('should preserve template structure', () => {
      const value = 'test';
      const result = safeHtml`<div class="container">${value}</div>`;
      expect(result).toContain('<div class="container">');
      expect(result).toContain('</div>');
      expect(result).toContain('test');
    });

    it('should handle empty interpolations', () => {
      const result = safeHtml`<div>${''}</div>`;
      expect(result).toBe('<div></div>');
    });

    it('should handle null and undefined interpolations', () => {
      const result1 = safeHtml`<div>${null}</div>`;
      const result2 = safeHtml`<div>${undefined}</div>`;
      expect(result1).toBe('<div></div>');
      expect(result2).toBe('<div></div>');
    });

    it('should prevent XSS in template literals', () => {
      const userInput = '"><script>alert(1)</script><div class="';
      const result = safeHtml`<div class="${userInput}">Content</div>`;
      expect(result).not.toContain('<script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;');
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete XSS protection', () => {
      const maliciousTitle = '<script>alert("XSS")</script>';
      const maliciousUrl = 'javascript:alert(1)';
      
      const escapedTitle = escapeHtml(maliciousTitle);
      const sanitizedUrl = sanitizeUrl(maliciousUrl);
      
      const html = `<a href="${sanitizedUrl}">${escapedTitle}</a>`;
      
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('javascript:');
      expect(html).toContain('about:blank');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should handle real-world blog post data', () => {
      const post = {
        title: 'Getting Started with <React>',
        author: 'Emily & Friends',
        url: '/blog/react-tutorial'
      };
      
      const html = `
        <article>
          <h2>${escapeHtml(post.title)}</h2>
          <p>By ${escapeHtml(post.author)}</p>
          <a href="${sanitizeUrl(post.url)}">Read More</a>
        </article>
      `;
      
      expect(html).toContain('&lt;React&gt;');
      expect(html).toContain('Emily &amp; Friends');
      expect(html).toContain('/blog/react-tutorial');
    });
  });
});

