import { test, expect } from '@playwright/test';
import { preparerPageSansSw, ETAT_DEBLOCAGE_COMPLET } from './helpers.mjs';

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
        await page.locator('#btn-options').click();
        await expect(page.locator('#ecran-options')).toHaveScreenshot('ecran-options.png', {
            animations: 'disabled',
        });
    });

    test('écran codex', async ({ page }) => {
        await page.goto('/');
        await page.locator('#btn-codex').click();
        await expect(page.locator('#ecran-codex')).toHaveScreenshot('ecran-codex.png', {
            animations: 'disabled',
        });
    });
});
