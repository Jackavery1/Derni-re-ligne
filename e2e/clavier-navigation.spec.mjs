import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    terminerPartieCourante,
} from './helpers.mjs';

test.describe('clavier navigation', () => {
    test('Tab atteint les controles titre dont jouer', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);

        const focusIds = [];
        for (let i = 0; i < 12; i++) {
            await page.keyboard.press('Tab');
            const focusId = await page.evaluate(() => document.activeElement?.id ?? '');
            if (focusId) focusIds.push(focusId);
        }
        expect(focusIds).toContain('btn-jouer');
    });

    test('Enter sur jouer ouvre la selection', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-jouer').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-selection')).toHaveClass(/actif/, { timeout: 10000 });
    });

    test('Escape bascule pause en partie', async ({ page }) => {
        await demarrerPartie(page);
        await page.keyboard.press('Escape');
        await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
        await page.keyboard.press('Escape');
        await expect(page.locator('#ecran-pause')).not.toHaveClass(/actif/);
    });

    test('touche P bascule pause en partie', async ({ page }) => {
        await demarrerPartie(page);
        await page.keyboard.press('p');
        await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
        await page.keyboard.press('p');
        await expect(page.locator('#ecran-pause')).not.toHaveClass(/actif/);
    });

    test('game over rejouer relance une partie', async ({ page }) => {
        await demarrerPartie(page);
        await terminerPartieCourante(page);
        await page.locator('#btn-rejouer').click();
        await expect(page.locator('#ecran-game-over')).not.toHaveClass(/actif/, { timeout: 10000 });
        await expect(page.locator('body')).toHaveClass(/partie-active/);
    });
});
