import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    terminerPartieCourante,
    ETAT_DEBLOCAGE_META_RAPIDE,
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

    test('Enter sur options ouvre et retour ferme', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/, { timeout: 10000 });
        await page.locator('#btn-options-retour').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    });

    test('fleches clavier basculent les onglets options', async ({ page }) => {
        await preparerPageSansSw(page);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-options').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-options')).toHaveClass(/actif/, { timeout: 10000 });
        await page.locator('#tab-reglages').focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('#tab-controles')).toBeFocused();
        await expect(page.locator('#panneau-controles')).toHaveClass(/actif/);
        await expect(page.locator('#panneau-reglages')).not.toHaveClass(/actif/);
        await page.keyboard.press('ArrowLeft');
        await expect(page.locator('#tab-reglages')).toBeFocused();
        await expect(page.locator('#panneau-reglages')).toHaveClass(/actif/);
    });

    test('Enter sur codex ouvre et retour ferme', async ({ page }) => {
        await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
        await page.goto('/');
        await attendreApplicationPrete(page);
        await page.locator('#btn-codex').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-codex')).toHaveClass(/actif/, { timeout: 10000 });
        await page.locator('#btn-codex-retour').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
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

    test('game over — Enter sur rejouer relance', async ({ page }) => {
        await demarrerPartie(page);
        await terminerPartieCourante(page);
        await page.locator('#btn-rejouer').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#ecran-game-over')).not.toHaveClass(/actif/, { timeout: 10000 });
        await expect(page.locator('body')).toHaveClass(/partie-active/);
    });
});
