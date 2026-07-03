import { test, expect } from '@playwright/test';
import { attendreApplicationPrete } from './helpers.mjs';

test('application charge hors ligne après precache', async ({ page, context }) => {
    await page.goto('/?pwa=1');
    await attendreApplicationPrete(page);
    await page.waitForFunction(
        () => navigator.serviceWorker?.controller instanceof ServiceWorker,
        null,
        { timeout: 30000 }
    );
    await page.reload();
    await attendreApplicationPrete(page);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'commit' });
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
});
