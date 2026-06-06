import { test, expect } from '@playwright/test';

test.describe('régressions visuelles', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('derniereLigne_tutorielVu', '1');
            localStorage.setItem('dl_migration_v1', '1');
        });
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('écran titre', async ({ page }) => {
        await page.goto('/');
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
