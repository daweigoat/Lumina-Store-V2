import { test, expect } from '@playwright/test';

test('homepage has title and main elements', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/LuminaStore/);

  // Expect navigation header to be visible
  await expect(page.getByRole('navigation')).toBeVisible();

  // Check for search input
  await expect(page.getByPlaceholder(/Search for luxury/i)).toBeVisible();
});
