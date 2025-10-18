import { test, expect } from '@playwright/test';

test.describe('Font Size Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display font size toggle buttons', async ({ page }) => {
    // Check that both font size buttons are visible
    const standardButton = page.getByRole('button', { name: /標準|Standard/i });
    const largeButton = page.getByRole('button', { name: /大|Large/i });

    await expect(standardButton).toBeVisible();
    await expect(largeButton).toBeVisible();
  });

  test('should start with standard font size as default', async ({ page }) => {
    const standardButton = page.getByRole('button', { name: /標準|Standard/i });

    // Check that standard button is active
    await expect(standardButton).toHaveClass(/bg-sky-600/);

    // Check that root font size is 16px
    const fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });

    expect(fontSize).toBe('16px');
  });

  test('should change font size to large when large button is clicked', async ({ page }) => {
    const largeButton = page.getByRole('button', { name: /大|Large/i });

    // Click large button
    await largeButton.click();

    // Wait for font size to change
    await page.waitForTimeout(300);

    // Check that large button is active
    await expect(largeButton).toHaveClass(/bg-sky-600/);

    // Check that root font size is 18px
    const fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });

    expect(fontSize).toBe('18px');
  });

  test('should change font size back to standard when standard button is clicked', async ({ page }) => {
    const standardButton = page.getByRole('button', { name: /標準|Standard/i });
    const largeButton = page.getByRole('button', { name: /大|Large/i });

    // Switch to large first
    await largeButton.click();
    await page.waitForTimeout(300);

    let fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });
    expect(fontSize).toBe('18px');

    // Switch back to standard
    await standardButton.click();
    await page.waitForTimeout(300);

    // Check that standard button is active
    await expect(standardButton).toHaveClass(/bg-sky-600/);

    // Check that root font size is 16px
    fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });

    expect(fontSize).toBe('16px');
  });

  test('should persist font size selection across page interactions', async ({ page }) => {
    const largeButton = page.getByRole('button', { name: /大|Large/i });

    // Switch to large font
    await largeButton.click();
    await page.waitForTimeout(300);

    // Navigate to manual page
    const manualButton = page.getByRole('button', { name: /使い方|Guide/i });
    await manualButton.click();
    await page.waitForTimeout(500);

    // Check that font size is still large
    let fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });
    expect(fontSize).toBe('18px');

    // Navigate back to compendium
    const compendiumButton = page.getByRole('button', { name: /薬草事典|Compendium/i });
    await compendiumButton.click();
    await page.waitForTimeout(500);

    // Font size should still be large
    fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });
    expect(fontSize).toBe('18px');
  });

  test('should maintain font size selection when switching languages', async ({ page }) => {
    const largeButton = page.getByRole('button', { name: /大|Large/i });
    const enButton = page.getByRole('button', { name: 'EN' });

    // Switch to large font
    await largeButton.click();
    await page.waitForTimeout(300);

    // Switch to English
    await enButton.click();
    await page.waitForTimeout(500);

    // Font size should still be large
    const fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontSize;
    });
    expect(fontSize).toBe('18px');

    // Check that large button is still active (now labeled "Large")
    const largButtonEn = page.getByRole('button', { name: 'Large' });
    await expect(largButtonEn).toHaveClass(/bg-sky-600/);
  });

  test('should visually increase text size throughout the page', async ({ page }) => {
    const largeButton = page.getByRole('button', { name: /大|Large/i });

    // Get initial heading size
    const heading = page.getByRole('heading', { name: /Self-Care Guide for Wellness/i });
    const initialHeadingSize = await heading.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // Switch to large font
    await largeButton.click();
    await page.waitForTimeout(300);

    // Get new heading size
    const newHeadingSize = await heading.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).fontSize);
    });

    // New size should be larger than initial size
    // (18px root vs 16px root = 1.125x multiplier)
    expect(newHeadingSize).toBeGreaterThan(initialHeadingSize);

    // Should be approximately 12.5% larger
    const ratio = newHeadingSize / initialHeadingSize;
    expect(ratio).toBeCloseTo(1.125, 1);
  });
});
