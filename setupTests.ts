// This file extends Vitest's `expect` function with matchers from jest-dom.
// This allows us to use convenient assertions like `toBeInTheDocument()`.
// For this to work in an environment without package.json, the test runner
// would need to be configured to resolve this module, potentially from a CDN.
import '@testing-library/jest-dom/vitest';
