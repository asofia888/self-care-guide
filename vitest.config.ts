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
    // Test timeout - increased for WSL and slow test execution
    testTimeout: 60000,
    // Hook timeout
    hookTimeout: 60000,
    // Run tests in single thread to avoid WSL issues
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Disable isolation for faster tests
    isolate: false
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