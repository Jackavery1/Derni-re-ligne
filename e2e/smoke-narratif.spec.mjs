import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    selectionnerMondeCarte,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_FIN_VRAIE_PRET,
} from './helpers.mjs';

test('carte histoire — briefing distorsion accessible (smoke narratif)', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await selectionnerMondeCarte(page, 'monde_boss_4');
    await expect(page.locator('#btn-histoire-briefing-distorsion')).not.toHaveClass(
        /element-masque/
    );
});

test('carte histoire — modal trame accessible (smoke narratif)', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_FIN_VRAIE_PRET);
    await expect(page.locator('#histoire-prog-trame')).toContainText(/TRAME/i, { timeout: 10000 });
    await page.locator('#btn-histoire-trame').click();
    await expect(page.locator('#overlay-trame-conditions')).not.toHaveClass(/element-masque/);
    await page.locator('#btn-trame-fermer').click();
    await expect(page.locator('#overlay-trame-conditions')).toHaveClass(/element-masque/);
});
