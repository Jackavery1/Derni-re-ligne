import { test, expect } from '@playwright/test';
import { attendreApplicationPrete } from './helpers.mjs';

test('application charge hors ligne après precache', async ({ page, context }) => {
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);

    await context.setOffline(true);
    await page.reload();
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
    await expect(page.locator('#btn-mode-histoire')).toBeVisible();
});
