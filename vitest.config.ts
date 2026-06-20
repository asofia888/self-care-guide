import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

// This configuration sets up the Vitest testing framework.
export default defineConfig({
  // `react()` is typed against the root vite@6, while `defineConfig` from
  // `vitest/config` expects its own bundled vite's Plugin type. They are
  // structurally identical at runtime, so cast to bridge the two copies.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any],
  test: {
    // Enables global APIs (describe, it, expect, etc.) without importing them.
    globals: true,
    // Only run Vitest unit tests (*.test.*). Playwright e2e specs use *.spec.*
    // and must not be picked up here (they run via `playwright test`).
    include: ['**/*.test.{ts,tsx}'],
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
        'types.ts',
      ],
      exclude: [
        'node_modules/**',
        'api/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'setupTests.ts',
        'vitest.config.ts',
        '__tests__/**',
        'dist/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    // Test timeout - reasonable for most tests
    testTimeout: 10000,
    // Hook timeout
    hookTimeout: 10000,
    // Run tests sequentially for WSL compatibility
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Isolate each test file (fresh module registry) so per-file `vi.mock`
    // calls don't leak across files. Disabling this trades correctness for
    // speed and breaks module mocking when the whole suite runs together.
    isolate: true,
    // Retry flaky tests once
    retry: 1,
    // Limit concurrent test files
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // WSL compatibility settings
  server: {
    watch: {
      usePolling: true,
    },
  },
});
