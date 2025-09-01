import { defineConfig } from 'vitest/config';
import path from 'path';

// This configuration sets up the Vitest testing framework.
export default defineConfig({
  test: {
    // Enables global APIs (describe, it, expect, etc.) without importing them.
    globals: true,
    // Simulates a DOM environment for testing UI components.
    environment: 'jsdom',
    // Specifies a setup file to run before each test file.
    setupFiles: './setupTests.ts',
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'components/**/*',
        'services/**/*',
        'contexts/**/*',
        'i18n.ts',
        'types.ts'
      ],
      exclude: [
        'node_modules/**',
        'api/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'setupTests.ts',
        'vitest.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Test timeout
    testTimeout: 10000,
    // Run tests in parallel
    pool: 'forks'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});