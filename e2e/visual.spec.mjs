import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    ETAT_DEBLOCAGE_COMPLET,
} from './helpers.mjs';

test.describe('régressions visuelles', () => {
    test.beforeEach(async ({ page }) => {
        await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('écran titre', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
            timeout: 15000,
        });
        await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-titre')).toHaveScreenshot('ecran-titre.png', {
            animations: 'disabled',
        });
    });

    test('écran options', async ({ page }) => {
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').click();
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-options')).toHaveScreenshot('ecran-options.png', {
            animations: 'disabled',
        });
    });

    test('écran codex', async ({ page }) => {
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-codex').click();
        await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-codex')).toHaveScreenshot('ecran-codex.png', {
            animations: 'disabled',
        });
    });

    test('écran sélection', async ({ page }) => {
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-jouer').click();
        await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
        await expect(page.locator('#ecran-selection')).toHaveScreenshot('ecran-selection.png', {
            animations: 'disabled',
        });
    });

    test('écran sélection tablette paysage sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-jouer').click();
        await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
        const metriques = await page.evaluate(() => ({
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            constellation: Boolean(document.getElementById('canvas-constellation')),
        }));
        expect(metriques.debord).toBe(false);
        expect(metriques.constellation).toBe(true);
    });
});
