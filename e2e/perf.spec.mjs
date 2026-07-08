import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    selectionnerBiomeClavier,
} from './helpers.mjs';

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

    const ressourcesIcones = await page.evaluate(() =>
        performance
            .getEntriesByType('resource')
            .filter((e) => e.name.includes('icones-pixel.json'))
            .map((e) => ({ duration: e.duration, startTime: e.startTime }))
    );
    if (ressourcesIcones.length > 0) {
        expect(ressourcesIcones[0].startTime).toBeGreaterThan(0);
    }
});

test('budget navigation selection avec icones pixel (dist)', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#btn-jouer')).toBeVisible({ timeout: 5000 });
    const debut = Date.now();
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#canvas-constellation')).toBeVisible();
    expect(Date.now() - debut).toBeLessThan(2500);
});

test('sprint 40L — victoire simulee en moins de 3 s', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await expect(page.locator('#btn-jouer')).toBeVisible({ timeout: 5000 });
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.evaluate(() => {
        document.getElementById('toggle-sprint')?.click();
    });
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 10000 });

    const debut = Date.now();
    const victoire = await page.evaluate(() => {
        if (typeof window.__NEO_TEST__?.simulerVictoireSprint !== 'function') return false;
        window.__NEO_TEST__.simulerVictoireSprint();
        return true;
    });
    expect(victoire).toBe(true);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 5000 });
    expect(Date.now() - debut).toBeLessThan(3000);
});
