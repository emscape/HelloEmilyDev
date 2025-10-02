/**
 * Tests for Date Formatter Utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { formatDate, formatYearMonth, sortByDate } from '../../js/utils/date-formatter.js';

describe('Date Formatter Utils', () => {
  describe('formatDate', () => {
    it('should format ISO date string', () => {
      const result = formatDate('2025-01-15');
      expect(result).toMatch(/January 15, 2025/);
    });

    it('should format Date object', () => {
      // Create date using local timezone to avoid timezone issues
      const date = new Date(2025, 0, 15); // January 15, 2025
      const result = formatDate(date);
      expect(result).toMatch(/January 15, 2025/);
    });

    it('should handle different months', () => {
      expect(formatDate('2025-03-20')).toMatch(/March 20, 2025/);
      expect(formatDate('2025-12-25')).toMatch(/December 25, 2025/);
    });

    it('should handle invalid dates gracefully', () => {
      expect(formatDate('invalid')).toBe('Invalid Date');
      expect(formatDate(null)).toBe('Invalid Date');
      expect(formatDate(undefined)).toBe('Invalid Date');
    });

    it('should handle empty string', () => {
      expect(formatDate('')).toBe('Invalid Date');
    });

    it('should format dates consistently', () => {
      const date1 = formatDate('2025-01-15');
      const date2 = formatDate('2025-01-15');
      expect(date1).toBe(date2);
    });

    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29');
      expect(result).toMatch(/February 29, 2024/);
    });

    it('should handle year boundaries', () => {
      expect(formatDate('2024-12-31')).toMatch(/December 31, 2024/);
      expect(formatDate('2025-01-01')).toMatch(/January 1, 2025/);
    });
  });

  describe('formatYearMonth', () => {
    it('should format YYYY-MM date', () => {
      const result = formatYearMonth('2025-01');
      expect(result).toMatch(/January 2025/);
    });

    it('should handle different months', () => {
      expect(formatYearMonth('2025-03')).toMatch(/March 2025/);
      expect(formatYearMonth('2025-12')).toMatch(/December 2025/);
    });

    it('should handle invalid formats gracefully', () => {
      expect(formatYearMonth('invalid')).toBe('Invalid Date');
      expect(formatYearMonth(null)).toBe('Invalid Date');
      expect(formatYearMonth(undefined)).toBe('Invalid Date');
    });

    it('should handle empty string', () => {
      expect(formatYearMonth('')).toBe('Invalid Date');
    });

    it('should handle single digit months', () => {
      const result = formatYearMonth('2025-01');
      expect(result).toMatch(/January 2025/);
    });

    it('should format consistently', () => {
      const date1 = formatYearMonth('2025-01');
      const date2 = formatYearMonth('2025-01');
      expect(date1).toBe(date2);
    });
  });

  describe('sortByDate', () => {
    const testData = [
      { id: 1, date: '2025-01-15', title: 'Post 1' },
      { id: 2, date: '2025-03-20', title: 'Post 2' },
      { id: 3, date: '2025-01-10', title: 'Post 3' },
      { id: 4, date: '2025-02-28', title: 'Post 4' }
    ];

    it('should sort by date descending (newest first)', () => {
      const sorted = sortByDate(testData, 'date', false);
      expect(sorted[0].id).toBe(2); // March 20
      expect(sorted[1].id).toBe(4); // Feb 28
      expect(sorted[2].id).toBe(1); // Jan 15
      expect(sorted[3].id).toBe(3); // Jan 10
    });

    it('should sort by date ascending (oldest first)', () => {
      const sorted = sortByDate(testData, 'date', true);
      expect(sorted[0].id).toBe(3); // Jan 10
      expect(sorted[1].id).toBe(1); // Jan 15
      expect(sorted[2].id).toBe(4); // Feb 28
      expect(sorted[3].id).toBe(2); // March 20
    });

    it('should not mutate original array', () => {
      const original = [...testData];
      sortByDate(testData, 'date', false);
      expect(testData).toEqual(original);
    });

    it('should handle empty array', () => {
      const sorted = sortByDate([], 'date', false);
      expect(sorted).toEqual([]);
    });

    it('should handle single item', () => {
      const single = [{ date: '2025-01-15' }];
      const sorted = sortByDate(single, 'date', false);
      expect(sorted).toEqual(single);
    });

    it('should handle items with same date', () => {
      const sameDate = [
        { id: 1, date: '2025-01-15' },
        { id: 2, date: '2025-01-15' },
        { id: 3, date: '2025-01-15' }
      ];
      const sorted = sortByDate(sameDate, 'date', false);
      expect(sorted).toHaveLength(3);
    });

    it('should handle different date properties', () => {
      const data = [
        { completionDate: '2025-01-15' },
        { completionDate: '2025-03-20' },
        { completionDate: '2025-01-10' }
      ];
      const sorted = sortByDate(data, 'completionDate', false);
      expect(sorted[0].completionDate).toBe('2025-03-20');
    });

    it('should handle invalid dates', () => {
      const withInvalid = [
        { date: '2025-01-15' },
        { date: 'invalid' },
        { date: '2025-03-20' }
      ];
      const sorted = sortByDate(withInvalid, 'date', false);
      // Invalid dates should be sorted to the end
      expect(sorted[0].date).toBe('2025-03-20');
      expect(sorted[1].date).toBe('2025-01-15');
    });

    it('should handle missing date property', () => {
      const withMissing = [
        { date: '2025-01-15' },
        { title: 'No date' },
        { date: '2025-03-20' }
      ];
      const sorted = sortByDate(withMissing, 'date', false);
      expect(sorted[0].date).toBe('2025-03-20');
      expect(sorted[1].date).toBe('2025-01-15');
    });
  });

  describe('Integration Tests', () => {
    it('should format and sort blog posts', () => {
      const posts = [
        { title: 'Post 1', date: '2025-01-15' },
        { title: 'Post 2', date: '2025-03-20' },
        { title: 'Post 3', date: '2025-01-10' }
      ];

      const sorted = sortByDate(posts, 'date', false);
      const formatted = sorted.map(post => ({
        ...post,
        formattedDate: formatDate(post.date)
      }));

      expect(formatted[0].title).toBe('Post 2');
      expect(formatted[0].formattedDate).toMatch(/March 20, 2025/);
      expect(formatted[2].title).toBe('Post 3');
      expect(formatted[2].formattedDate).toMatch(/January 10, 2025/);
    });

    it('should handle real-world project data', () => {
      const projects = [
        { name: 'Project A', completionDate: '2024-12' },
        { name: 'Project B', completionDate: '2025-01' },
        { name: 'Project C', completionDate: '2024-11' }
      ];

      const sorted = sortByDate(projects, 'completionDate', false);
      const formatted = sorted.map(project => ({
        ...project,
        displayDate: formatYearMonth(project.completionDate)
      }));

      expect(formatted[0].name).toBe('Project B');
      expect(formatted[0].displayDate).toMatch(/January 2025/);
    });
  });
});

