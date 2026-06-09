import { test, expect } from '@playwright/test';
import {
    demarrerPartie,
    terminerPartieCourante,
    preparerPageSansSw,
    preparerPremierLancement,
    attendreApplicationPrete,
} from './helpers.mjs';

test('réserve hold accepte une pièce via clavier', async ({ page }) => {
    await demarrerPartie(page);
    await page.locator('#canvas-plateau').focus();
    await page.keyboard.press('c');
    await page.waitForTimeout(300);
    const reserveRemplie = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-reserve');
        if (!(canvas instanceof HTMLCanvasElement)) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return true;
        }
        return false;
    });
    expect(reserveRemplie).toBe(true);
});

test('game over affiche l écran de fin', async ({ page }) => {
    await demarrerPartie(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/);
});

test('modes verrouillés masqués au premier lancement', async ({ page }) => {
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#btn-jouer')).toBeHidden();
    await expect(page.locator('#btn-codex')).toBeHidden();
    await expect(page.locator('#menu-bloc-libre')).toBeHidden();
    await expect(page.locator('#menu-bloc-collection')).toBeHidden();
});

test('mode libre débloqué après progression histoire', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#btn-jouer')).toBeEnabled();
    await expect(page.locator('#btn-jouer')).not.toHaveClass(/btn-verrouille/);
});
