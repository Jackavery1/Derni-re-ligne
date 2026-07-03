import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    ETAT_DEBLOCAGE_META_RAPIDE,
} from './helpers.mjs';

test('retour codex revient au titre', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    await page.locator('#btn-codex-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
});

test('retour profil revient au titre', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-profil').click();
    await expect(page.locator('#ecran-profil')).toHaveClass(/actif/);
    await page.locator('#btn-profil-menu').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
});

test('architecte retour selection revient au titre', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    await page.locator('#archi-sel-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
});
