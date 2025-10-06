/**
 * Blog Validation Tests
 * Tests to ensure all blog posts are valid and loadable
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { validateBlogPost, validateJSON, sanitizeTitle, validateAllBlogPosts } from '../js/utils/blog-validator.js';
import fs from 'fs';
import path from 'path';

describe('Blog Validation', () => {
  describe('validateJSON', () => {
    it('should validate correct JSON', () => {
      const validJson = '{"title": "Test Post", "id": "test"}';
      const result = validateJSON(validJson);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toEqual({ title: "Test Post", id: "test" });
    });

    it('should catch JSON syntax errors', () => {
      const invalidJson = '{"title": "Test Post", "id": "test"'; // Missing closing brace
      const result = validateJSON(invalidJson);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unexpected end of JSON input');
      expect(result.data).toBe(null);
    });

    it('should catch smart quotes in JSON', () => {
      const smartQuoteJson = '{"title": "Test "Post"", "id": "test"}'; // Smart quotes
      const result = validateJSON(smartQuoteJson);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('validateBlogPost', () => {
    it('should validate a complete blog post', () => {
      const validPost = {
        id: 'test-post',
        title: 'Test Post',
        author: 'Emily Anderson',
        date: '2025-01-01',
        content: '<p>Test content</p>',
        tags: ['test']
      };
      
      const result = validateBlogPost(validPost, 'test-post');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {
      const incompletePost = {
        id: 'test-post',
        title: 'Test Post'
        // Missing author, date, content
      };
      
      const result = validateBlogPost(incompletePost, 'test-post');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: author');
      expect(result.errors).toContain('Missing required field: date');
      expect(result.errors).toContain('Missing required field: content');
    });

    it('should catch ID mismatch', () => {
      const post = {
        id: 'wrong-id',
        title: 'Test Post',
        author: 'Emily Anderson',
        date: '2025-01-01',
        content: '<p>Test</p>'
      };
      
      const result = validateBlogPost(post, 'correct-id');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Post ID mismatch: expected "correct-id", got "wrong-id"');
    });

    it('should catch invalid date formats', () => {
      const post = {
        id: 'test-post',
        title: 'Test Post',
        author: 'Emily Anderson',
        date: 'invalid-date',
        content: '<p>Test</p>'
      };
      
      const result = validateBlogPost(post, 'test-post');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid date format: invalid-date. Expected YYYY-MM-DD');
    });

    it('should catch problematic characters in titles', () => {
      const post = {
        id: 'test-post',
        title: 'Test "Smart Quotes" Post',
        author: 'Emily Anderson',
        date: '2025-01-01',
        content: '<p>Test</p>'
      };
      
      const result = validateBlogPost(post, 'test-post');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title contains invalid characters that may break HTML: Test "Smart Quotes" Post');
    });

    it('should validate tags as array', () => {
      const post = {
        id: 'test-post',
        title: 'Test Post',
        author: 'Emily Anderson',
        date: '2025-01-01',
        content: '<p>Test</p>',
        tags: 'not-an-array'
      };
      
      const result = validateBlogPost(post, 'test-post');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be an array, got: string');
    });
  });

  describe('sanitizeTitle', () => {
    it('should replace smart quotes with regular quotes', () => {
      const title = 'Test "Smart Quotes" Post';
      const sanitized = sanitizeTitle(title);
      expect(sanitized).toBe('Test "Smart Quotes" Post');
    });

    it('should replace smart apostrophes', () => {
      const title = 'Don\'t Use Smart Apostrophes';
      const sanitized = sanitizeTitle(title);
      expect(sanitized).toBe("Don't Use Smart Apostrophes");
    });

    it('should escape unescaped ampersands', () => {
      const title = 'Test & Validation';
      const sanitized = sanitizeTitle(title);
      expect(sanitized).toBe('Test &amp; Validation');
    });

    it('should preserve already escaped entities', () => {
      const title = 'Test &amp; &lt;Validation&gt;';
      const sanitized = sanitizeTitle(title);
      expect(sanitized).toBe('Test &amp; &lt;Validation&gt;');
    });
  });

  describe('Real Blog Posts Integration', () => {
    let blogPosts = [];

    beforeAll(async () => {
      // Load all actual blog posts
      const blogDir = './blog';
      if (fs.existsSync(blogDir)) {
        const entries = fs.readdirSync(blogDir, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const postId = entry.name;
            const postDataPath = path.join(blogDir, postId, 'post-data.json');
            
            if (fs.existsSync(postDataPath)) {
              try {
                const jsonContent = fs.readFileSync(postDataPath, 'utf8');
                const postData = JSON.parse(jsonContent);
                blogPosts.push({ postId, postData, jsonContent });
              } catch (error) {
                blogPosts.push({ postId, error: error.message });
              }
            }
          }
        }
      }
    });

    it('should have at least one blog post', () => {
      expect(blogPosts.length).toBeGreaterThan(0);
    });

    it('should have valid JSON for all blog posts', () => {
      const invalidPosts = blogPosts.filter(post => post.error);
      
      if (invalidPosts.length > 0) {
        const errorMessages = invalidPosts.map(post => 
          `${post.postId}: ${post.error}`
        ).join('\n');
        
        expect(invalidPosts).toHaveLength(0, 
          `Found blog posts with invalid JSON:\n${errorMessages}`
        );
      }
    });

    it('should have valid structure for all blog posts', () => {
      const validPosts = blogPosts.filter(post => !post.error);
      const invalidPosts = [];

      for (const { postId, postData } of validPosts) {
        const validation = validateBlogPost(postData, postId);
        if (!validation.isValid) {
          invalidPosts.push({
            postId,
            errors: validation.errors
          });
        }
      }

      if (invalidPosts.length > 0) {
        const errorMessages = invalidPosts.map(post => 
          `${post.postId}:\n  - ${post.errors.join('\n  - ')}`
        ).join('\n\n');
        
        expect(invalidPosts).toHaveLength(0,
          `Found blog posts with validation errors:\n\n${errorMessages}`
        );
      }
    });

    it('should have corresponding HTML files for all blog posts', () => {
      const validPosts = blogPosts.filter(post => !post.error);
      const missingHtml = [];

      for (const { postId } of validPosts) {
        const htmlPath = path.join('./blog', postId, 'index.html');
        if (!fs.existsSync(htmlPath)) {
          missingHtml.push(postId);
        }
      }

      expect(missingHtml).toHaveLength(0,
        `Found blog posts missing HTML files: ${missingHtml.join(', ')}`
      );
    });

    it('should have titles that match between JSON and HTML', () => {
      const validPosts = blogPosts.filter(post => !post.error);
      const titleMismatches = [];

      for (const { postId, postData } of validPosts) {
        const htmlPath = path.join('./blog', postId, 'index.html');
        
        if (fs.existsSync(htmlPath)) {
          const htmlContent = fs.readFileSync(htmlPath, 'utf8');
          const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
          
          if (titleMatch) {
            const htmlTitle = titleMatch[1].replace(' | Emily Anderson', '');
            const jsonTitle = postData.title;
            
            if (htmlTitle !== jsonTitle) {
              titleMismatches.push({
                postId,
                jsonTitle,
                htmlTitle
              });
            }
          }
        }
      }

      if (titleMismatches.length > 0) {
        const errorMessages = titleMismatches.map(mismatch => 
          `${mismatch.postId}:\n  JSON: "${mismatch.jsonTitle}"\n  HTML: "${mismatch.htmlTitle}"`
        ).join('\n\n');
        
        expect(titleMismatches).toHaveLength(0,
          `Found title mismatches between JSON and HTML:\n\n${errorMessages}`
        );
      }
    });
  });
});
