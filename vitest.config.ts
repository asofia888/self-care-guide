import { defineConfig } from 'vitest/config';

// This configuration sets up the Vitest testing framework.
export default defineConfig({
  test: {
    // Enables global APIs (describe, it, expect, etc.) without importing them.
    globals: true,
    // Simulates a DOM environment for testing UI components.
    environment: 'jsdom',
    // Specifies a setup file to run before each test file.
    setupFiles: './setupTests.ts',
  },
});