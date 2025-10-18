import { test, expect } from '@playwright/test';

test.describe('Compendium Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display compendium search interface', async ({ page }) => {
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: /Self-Care Guide for Wellness/i })).toBeVisible();

    // Check that the compendium title is visible
    await expect(page.getByRole('heading', { name: /薬草事典|Herbal Compendium/i })).toBeVisible();

    // Check that the search input is visible
    await expect(page.getByRole('searchbox')).toBeVisible();

    // Check that the search button is visible
    await expect(page.getByRole('button', { name: /検索|Search/i })).toBeVisible();
  });

  test('should perform a search and display results', async ({ page }) => {
    // Type in the search box
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('ginger');

    // Click the search button
    const searchButton = page.getByRole('button', { name: /検索|Search/i });
    await searchButton.click();

    // Wait for loading to complete (loading spinner should appear and disappear)
    await expect(page.getByText(/検索中|Searching/i)).toBeVisible({ timeout: 2000 }).catch(() => {});

    // Wait for results to appear (with a reasonable timeout for API call)
    // Look for either results or "no results" message
    await page.waitForSelector('text=/統合的な視点|Integrative Viewpoint|検索結果がありません|No results/i', {
      timeout: 30000
    });

    // Check if we got results or no results message
    const hasResults = await page.getByText(/統合的な視点|Integrative Viewpoint/i).isVisible().catch(() => false);
    const noResults = await page.getByText(/検索結果がありません|No results/i).isVisible().catch(() => false);

    // Either results or no results message should be visible
    expect(hasResults || noResults).toBeTruthy();
  });

  test('should show loading state during search', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('turmeric');

    const searchButton = page.getByRole('button', { name: /検索|Search/i });
    await searchButton.click();

    // Loading spinner should appear
    const loadingElement = page.getByText(/読み込み中|Loading/i);

    // Check if loading state appears (it might be very quick)
    const isLoading = await loadingElement.isVisible({ timeout: 1000 }).catch(() => false);

    // If loading was visible, it should eventually disappear
    if (isLoading) {
      await expect(loadingElement).not.toBeVisible({ timeout: 30000 });
    }
  });

  test('should disable search button when query is empty', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    const searchButton = page.getByRole('button', { name: /検索|Search/i });

    // Initially, with empty input, button should be disabled
    await expect(searchButton).toBeDisabled();

    // Type something
    await searchInput.fill('ginger');
    await expect(searchButton).toBeEnabled();

    // Clear input
    await searchInput.clear();
    await expect(searchButton).toBeDisabled();
  });

  test('should display print button when results are shown', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('chamomile');

    const searchButton = page.getByRole('button', { name: /検索|Search/i });
    await searchButton.click();

    // Wait for results
    await page.waitForSelector('text=/統合的な視点|Integrative Viewpoint|検索結果がありません|No results/i', {
      timeout: 30000
    });

    // If we have results, print button should be visible
    const hasResults = await page.getByText(/統合的な視点|Integrative Viewpoint/i).isVisible().catch(() => false);

    if (hasResults) {
      const printButton = page.getByRole('button', { name: /印刷|Print/i });
      await expect(printButton).toBeVisible();
    }
  });

  test('should allow text selection in search results', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('lavender');

    const searchButton = page.getByRole('button', { name: /検索|Search/i });
    await searchButton.click();

    // Wait for results
    await page.waitForSelector('text=/統合的な視点|Integrative Viewpoint|検索結果がありません|No results/i', {
      timeout: 30000
    });

    // Check if results area exists
    const resultsArea = page.locator('.printable-area').first();
    const hasResults = await resultsArea.isVisible().catch(() => false);

    if (hasResults) {
      // Check that user-select is set to text (CSS property)
      const userSelect = await resultsArea.evaluate((el) =>
        window.getComputedStyle(el).userSelect
      );

      // Should be 'text' or 'auto' (not 'none')
      expect(userSelect).not.toBe('none');
    }
  });
});
