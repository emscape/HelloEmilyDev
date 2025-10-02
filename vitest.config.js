import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global test setup
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.test.js',
        '**/*.spec.js',
        '**/backup/**',
        '**/original-backup.js',
        '**/refactored.js',
        'js/load-header.js',
        'js/scroll-animations.js'
      ],
      include: [
        'js/**/*.js'
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    
    // Test file patterns
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Setup files
    setupFiles: ['./tests/setup.js'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Reporters
    reporters: ['verbose'],
    
    // Mock reset
    mockReset: true,
    restoreMocks: true,
    clearMocks: true
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './js'),
      '@utils': path.resolve(__dirname, './js/utils'),
      '@config': path.resolve(__dirname, './js/config')
    }
  }
});

