import { test, expect } from '@playwright/test';
import { attendreApplicationPrete } from './helpers.mjs';

/** @param {import('@playwright/test').Page} page */
async function attendrePrecacheShell(page) {
    await page.waitForFunction(
        async () => {
            const cles = await caches.keys();
            const shell = cles.find((c) => c.startsWith('dl-shell'));
            if (!shell) return false;
            const cache = await caches.open(shell);
            const main = (await cache.match('./js/main.js')) || (await cache.match('/js/main.js'));
            const index =
                (await cache.match('./index.html')) ||
                (await cache.match('/index.html')) ||
                (await cache.match('./'));
            return Boolean(main) && Boolean(index) && (await cache.keys()).length >= 20;
        },
        null,
        { timeout: 180000, polling: 500 }
    );
}

test('application charge hors ligne après precache', async ({ page, context }) => {
    test.setTimeout(240000);

    const swPromise = context.waitForEvent('serviceworker', { timeout: 180000 });

    await page.goto('/?pwa=1', { waitUntil: 'load' });
    await swPromise;
    await attendreApplicationPrete(page);
    await attendrePrecacheShell(page);

    await context.setOffline(true);
    await expect(page.locator('#ecran-titre')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#btn-options')).toBeVisible();
});
