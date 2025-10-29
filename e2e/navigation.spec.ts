import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all navigation options', async ({ page }) => {
    // Check main navigation buttons
    await expect(page.getByRole('button', { name: /薬草事典|Compendium/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /使い方|Guide/i })).toBeVisible();

    // Check footer links
    await expect(
      page.getByRole('button', { name: /プライバシーポリシー|Privacy Policy/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /利用規約|Terms of Service/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /免責事項|Disclaimer/i })).toBeVisible();
  });

  test('should start on compendium page by default', async ({ page }) => {
    // Check that compendium button is active
    const compendiumButton = page.getByRole('button', { name: /薬草事典|Compendium/i }).first();
    await expect(compendiumButton).toHaveClass(/bg-sky-100/);

    // Check that compendium content is visible
    await expect(page.getByText(/漢方薬、西洋ハーブ|Kampo formulas, Western herbs/i)).toBeVisible();
  });

  test('should navigate to manual page', async ({ page }) => {
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i }).first();

    // Click manual button
    await manualButton.click();
    await page.waitForTimeout(500);

    // Check that manual button is active
    await expect(manualButton).toHaveClass(/bg-sky-100/);

    // Check that manual content is visible
    await expect(page.getByText(/使い方ガイド|User Guide/i)).toBeVisible();
    await expect(page.getByText(/概要|Overview/i)).toBeVisible();
  });

  test('should navigate to privacy policy page', async ({ page }) => {
    const privacyButton = page.getByRole('button', {
      name: /プライバシーポリシー|Privacy Policy/i,
    });

    // Click privacy button
    await privacyButton.click();
    await page.waitForTimeout(500);

    // Check that privacy policy content is visible
    await expect(
      page.getByRole('heading', { name: /プライバシーポリシー|Privacy Policy/i })
    ).toBeVisible();
    await expect(page.getByText(/個人情報|personal information/i)).toBeVisible();
  });

  test('should navigate to terms of service page', async ({ page }) => {
    const termsButton = page.getByRole('button', { name: /利用規約|Terms of Service/i });

    // Click terms button
    await termsButton.click();
    await page.waitForTimeout(500);

    // Check that terms content is visible
    await expect(page.getByRole('heading', { name: /利用規約|Terms of Service/i })).toBeVisible();
    await expect(page.getByText(/利用規約|terms/i)).toBeVisible();
  });

  test('should navigate to disclaimer page', async ({ page }) => {
    const disclaimerButton = page.getByRole('button', { name: /免責事項|Disclaimer/i }).first();

    // Click disclaimer button
    await disclaimerButton.click();
    await page.waitForTimeout(500);

    // Check that disclaimer content is visible
    await expect(page.getByRole('heading', { name: /免責事項|Disclaimer/i })).toBeVisible();
    await expect(page.getByText(/医療診断|medical diagnosis/i)).toBeVisible();
  });

  test('should navigate back to compendium from other pages', async ({ page }) => {
    // Go to manual page
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i }).first();
    await manualButton.click();
    await page.waitForTimeout(500);

    // Navigate back to compendium
    const compendiumButton = page.getByRole('button', { name: /薬草事典|Compendium/i }).first();
    await compendiumButton.click();
    await page.waitForTimeout(500);

    // Check that we're back on compendium
    await expect(compendiumButton).toHaveClass(/bg-sky-100/);
    await expect(page.getByText(/漢方薬、西洋ハーブ|Kampo formulas, Western herbs/i)).toBeVisible();
  });

  test('should scroll to top when navigating between pages', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Check that we're scrolled down
    let scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    // Navigate to manual
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i }).first();
    await manualButton.click();
    await page.waitForTimeout(500);

    // Check that we're scrolled to top
    scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('should show active state for current page', async ({ page }) => {
    const compendiumButton = page.getByRole('button', { name: /薬草事典|Compendium/i }).first();
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i }).first();

    // Initially on compendium
    await expect(compendiumButton).toHaveClass(/bg-sky-100/);
    await expect(manualButton).not.toHaveClass(/bg-sky-100/);

    // Navigate to manual
    await manualButton.click();
    await page.waitForTimeout(500);

    // Manual should be active, compendium should not
    await expect(manualButton).toHaveClass(/bg-sky-100/);
    await expect(compendiumButton).not.toHaveClass(/bg-sky-100/);
  });

  test('should have accessible navigation with aria-current', async ({ page }) => {
    const compendiumButton = page.getByRole('button', { name: /薬草事典|Compendium/i }).first();

    // Check that active page has aria-current
    const ariaCurrent = await compendiumButton.getAttribute('aria-current');
    expect(ariaCurrent).toBe('page');

    // Navigate to manual
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i }).first();
    await manualButton.click();
    await page.waitForTimeout(500);

    // Manual should now have aria-current
    const manualAriaCurrent = await manualButton.getAttribute('aria-current');
    expect(manualAriaCurrent).toBe('page');

    // Compendium should not
    const compendiumAriaCurrent = await compendiumButton.getAttribute('aria-current');
    expect(compendiumAriaCurrent).toBeNull();
  });

  test('should maintain state when navigating away and back', async ({ page }) => {
    // Fill in search on compendium
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('ginger');

    // Navigate to manual
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i }).first();
    await manualButton.click();
    await page.waitForTimeout(500);

    // Navigate back to compendium
    const compendiumButton = page.getByRole('button', { name: /薬草事典|Compendium/i }).first();
    await compendiumButton.click();
    await page.waitForTimeout(500);

    // Search input should still have the value
    await expect(searchInput).toHaveValue('ginger');
  });
});
