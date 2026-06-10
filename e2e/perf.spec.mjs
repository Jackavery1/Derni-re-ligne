import { test, expect } from '@playwright/test';
import { preparerPageSansSw, attendreApplicationPrete } from './helpers.mjs';

test('budget chargement ecran titre (dist)', async ({ page }) => {
    await preparerPageSansSw(page);
    const debut = Date.now();
    await page.goto('/');
    await attendreApplicationPrete(page);
    const dureeMs = Date.now() - debut;
    expect(dureeMs).toBeLessThan(8000);

    const nav = await page.evaluate(() => {
        const entree = performance.getEntriesByType('navigation')[0];
        if (!entree) return null;
        return {
            domContentLoaded: entree.domContentLoadedEventEnd,
            load: entree.loadEventEnd,
        };
    });

    if (nav?.domContentLoaded) {
        expect(nav.domContentLoaded).toBeLessThan(5000);
    }
});
