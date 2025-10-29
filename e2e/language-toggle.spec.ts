import { test, expect } from '@playwright/test';

test.describe('Language Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display language toggle buttons', async ({ page }) => {
    // Check that both language buttons are visible
    const jaButton = page.getByRole('button', { name: 'JA' });
    const enButton = page.getByRole('button', { name: 'EN' });

    await expect(jaButton).toBeVisible();
    await expect(enButton).toBeVisible();
  });

  test('should start with Japanese as default language', async ({ page }) => {
    // Check that Japanese button is active (has active styling)
    const jaButton = page.getByRole('button', { name: 'JA' });

    // Check that the button has the active class (bg-sky-600)
    await expect(jaButton).toHaveClass(/bg-sky-600/);

    // Check that Japanese text is visible
    await expect(page.getByText('薬草事典')).toBeVisible();
  });

  test('should switch to English when EN button is clicked', async ({ page }) => {
    const enButton = page.getByRole('button', { name: 'EN' });

    // Click English button
    await enButton.click();

    // Wait for language to change
    await page.waitForTimeout(500);

    // Check that English button is now active
    await expect(enButton).toHaveClass(/bg-sky-600/);

    // Check that English text is visible
    await expect(page.getByText('Herbal Compendium')).toBeVisible();
    await expect(page.getByText('Your Wellness Guide')).toBeVisible();
  });

  test('should switch to Japanese when JA button is clicked after being in English', async ({
    page,
  }) => {
    const enButton = page.getByRole('button', { name: 'EN' });
    const jaButton = page.getByRole('button', { name: 'JA' });

    // Switch to English first
    await enButton.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Herbal Compendium')).toBeVisible();

    // Switch back to Japanese
    await jaButton.click();
    await page.waitForTimeout(500);

    // Check that Japanese button is active
    await expect(jaButton).toHaveClass(/bg-sky-600/);

    // Check that Japanese text is visible
    await expect(page.getByText('薬草事典')).toBeVisible();
    await expect(page.getByText('あなたのウェルネス・ガイド')).toBeVisible();
  });

  test('should update search placeholder when language changes', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');

    // Check Japanese placeholder
    await expect(searchInput).toHaveAttribute('placeholder', /薬草名|症状/);

    // Switch to English
    const enButton = page.getByRole('button', { name: 'EN' });
    await enButton.click();
    await page.waitForTimeout(500);

    // Check English placeholder
    await expect(searchInput).toHaveAttribute('placeholder', /herb name|formula|symptom/i);
  });

  test('should update navigation labels when language changes', async ({ page }) => {
    // Check Japanese navigation
    await expect(page.getByRole('button', { name: '薬草事典' })).toBeVisible();
    await expect(page.getByRole('button', { name: '使い方' })).toBeVisible();

    // Switch to English
    const enButton = page.getByRole('button', { name: 'EN' });
    await enButton.click();
    await page.waitForTimeout(500);

    // Check English navigation
    await expect(page.getByRole('button', { name: 'Compendium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guide' })).toBeVisible();
  });

  test('should persist language selection across page interactions', async ({ page }) => {
    const enButton = page.getByRole('button', { name: 'EN' });

    // Switch to English
    await enButton.click();
    await page.waitForTimeout(500);

    // Navigate to manual
    const guideButton = page.getByRole('button', { name: 'Guide' });
    await guideButton.click();
    await page.waitForTimeout(500);

    // Check that language is still English
    await expect(page.getByText('User Guide')).toBeVisible();

    // Navigate back to compendium
    const compendiumButton = page.getByRole('button', { name: 'Compendium' });
    await compendiumButton.click();
    await page.waitForTimeout(500);

    // Language should still be English
    await expect(page.getByText('Herbal Compendium')).toBeVisible();
  });
});
