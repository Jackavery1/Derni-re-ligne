import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    ETAT_DEBLOCAGE_META_RAPIDE,
} from './helpers.mjs';

test('navigation achievements affiche le memorial et la grille', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    await expect(page.locator('#ach-compteur')).toContainText('/');
    await expect(page.locator('#ach-galerie-grille .ach-carte').first()).toBeVisible();
    await expect(page.locator('#fond-meta-memorial')).toBeVisible();
});

test('filtres achievements activent un bouton', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    const filtreScore = page.locator('.ach-filtre-btn[data-filtre="score"]');
    await filtreScore.click();
    await expect(filtreScore).toHaveClass(/actif/);
});

test('retour depuis achievements revient au titre', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    await page.locator('#btn-achievements-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
});
