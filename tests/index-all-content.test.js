/**
 * Tests for the search indexing script's project URLs
 */

import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const { projectUrls } = require('../scripts/index-all-content.js');

describe('index-all-content projectUrls', () => {
  it('maps visible projects to their project URLs and skips hidden ones', () => {
    const projects = [
      { id: 'shown' },
      { id: 'gone', hidden: true },
      { id: 'also-shown', hidden: false },
    ];

    expect(projectUrls(projects)).toEqual([
      'https://helloemily.dev/projects/shown/',
      'https://helloemily.dev/projects/also-shown/',
    ]);
  });

  it('does not submit the hidden io-puzzle-2025 project from projects-data.json', () => {
    const { projects } = JSON.parse(readFileSync('projects/projects-data.json', 'utf8'));

    expect(projectUrls(projects)).not.toContain('https://helloemily.dev/projects/io-puzzle-2025/');
  });
});
