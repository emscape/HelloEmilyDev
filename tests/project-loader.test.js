/**
 * Tests for the project loader's display preparation
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { prepareProjects } from '../js/project-loader.js';

const project = (id, overrides = {}) => ({
  id,
  featured: false,
  completionDate: '2025-01',
  ...overrides,
});

describe('Project Loader', () => {
  describe('prepareProjects', () => {
    it('omits hidden projects on the projects page', () => {
      const projects = [
        project('shown-a', { completionDate: '2025-03' }),
        project('hidden', { hidden: true, featured: true }),
        project('shown-b', { completionDate: '2025-01' }),
      ];

      const ids = prepareProjects(projects, '/pages/projects.html').map((p) => p.id);

      expect(ids).toEqual(['shown-a', 'shown-b']);
    });

    it('fills all three home page slots from visible projects when one is hidden', () => {
      const projects = [
        project('hidden', { hidden: true, featured: true, completionDate: '2025-06' }),
        project('p1', { completionDate: '2025-05' }),
        project('p2', { completionDate: '2025-04' }),
        project('p3', { completionDate: '2025-03' }),
        project('p4', { completionDate: '2025-02' }),
      ];

      const ids = prepareProjects(projects, '/').map((p) => p.id);

      expect(ids).toEqual(['p1', 'p2', 'p3']);
    });

    it('keeps projects with hidden set to false or absent', () => {
      const projects = [
        project('explicit', { hidden: false, completionDate: '2025-02' }),
        project('absent', { completionDate: '2025-01' }),
      ];

      const ids = prepareProjects(projects, '/pages/projects.html').map((p) => p.id);

      expect(ids).toEqual(['explicit', 'absent']);
    });
  });

  describe('projects-data.json', () => {
    const { projects } = JSON.parse(readFileSync('projects/projects-data.json', 'utf8'));

    it('does not display any project linking to emilysueanderson.com', () => {
      const displayed = prepareProjects(projects, '/pages/projects.html');

      const offending = displayed.filter((p) => /emilysueanderson\.com/i.test(JSON.stringify(p)));

      expect(offending.map((p) => p.id)).toEqual([]);
    });
  });
});
