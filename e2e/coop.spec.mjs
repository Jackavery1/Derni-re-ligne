import { test, expect } from '@playwright/test';

test('toggle coop active le mode coopératif', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);

    const toggle = page.locator('#toggle-coop');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#coop-toggle-label')).toHaveText('COOP : ON');
    await expect(toggle).toHaveClass(/actif/);
});

test('codex accessible depuis le menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    await expect(page.locator('.codex-contenu')).toBeVisible();
});
