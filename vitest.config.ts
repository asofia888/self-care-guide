import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

// This configuration sets up the Vitest testing framework.
export default defineConfig({
  plugins: [react()],
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
        'utils/**/*',
        'i18n.ts',
        'types.ts'
      ],
      exclude: [
        'node_modules/**',
        'api/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'setupTests.ts',
        'vitest.config.ts',
        '__tests__/**',
        'dist/**'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // Test timeout - reasonable for most tests
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 10000,
    // Run tests sequentially for WSL compatibility
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Disable isolation for faster execution on WSL
    isolate: false,
    // Retry flaky tests once
    retry: 1,
    // Limit concurrent test files
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // WSL compatibility settings
  server: {
    watch: {
      usePolling: true
    }
  }
});