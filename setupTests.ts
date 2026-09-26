// This file extends Vitest's `expect` function with matchers from jest-dom.
// This allows us to use convenient assertions like `toBeInTheDocument()`.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `vitest.config.ts` runs with `isolate: false`, so the jsdom document is
// shared across test files. Unmount React trees after every test to prevent
// rendered output from accumulating and causing "multiple elements" errors.
afterEach(() => {
  cleanup();
  // Saved settings and search history must not leak between tests.
  localStorage.clear();
});
