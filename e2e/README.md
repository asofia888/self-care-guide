# E2E Tests

This directory contains end-to-end tests for the Self-Care Guide for Wellness application using Playwright.

## Test Coverage

### Compendium Search (`compendium.spec.ts`)

- Display of search interface
- Search functionality with API integration
- Loading states
- Empty query validation
- Print button visibility
- Text selection in results

### Language Toggle (`language-toggle.spec.ts`)

- Language switcher display and functionality
- Default language (Japanese)
- Switching between Japanese and English
- UI text updates when language changes
- Language persistence across navigation

### Font Size Toggle (`font-size-toggle.spec.ts`)

- Font size switcher display
- Default font size (standard/16px)
- Switching to large font (18px)
- Font size persistence across navigation
- Visual size changes throughout the page

### Navigation (`navigation.spec.ts`)

- Display of all navigation options
- Default page (Compendium)
- Navigation to all pages (Manual, Privacy, Terms, Disclaimer)
- Active state indicators
- Scroll to top on navigation
- State persistence when navigating
- Accessibility (aria-current)

## Running Tests

### Run all E2E tests

```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Debug tests

```bash
npm run test:e2e:debug
```

### View test report

```bash
npm run test:e2e:report
```

## Test Configuration

Tests are configured in `playwright.config.ts` with the following settings:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:5173
- **Dev Server**: Automatically starts before tests
- **Retries**: 2 retries on CI, 0 locally
- **Parallel**: Tests run in parallel locally, sequential on CI

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import test utilities: `import { test, expect } from '@playwright/test';`
3. Use `test.describe()` to group related tests
4. Use `test.beforeEach()` to set up common test state
5. Write tests using `test()` and assertions with `expect()`

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

## Best Practices

- Use semantic selectors (role, text) over CSS selectors when possible
- Add appropriate timeouts for async operations
- Test both happy paths and error states
- Ensure tests are independent and can run in any order
- Use page object patterns for complex pages
- Add descriptive test names that explain what is being tested

## CI/CD Integration

Tests can be run in CI environments:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check if dev server is starting properly
- Verify API endpoints are accessible

### Flaky tests

- Add explicit waits for elements
- Use `waitForSelector` or `waitForLoadState`
- Check for race conditions

### Browser not found

- Run `npx playwright install` to install browsers
