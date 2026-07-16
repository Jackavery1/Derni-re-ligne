import { test, expect } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    ouvrirCarteHistoire,
    selectionnerMondeCarte,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_FIN_VRAIE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_CYBER_LABO_PRET,
    selectionnerBiomeVerrouilleConstellation,
} from './helpers.mjs';

test('audit B — constellation biome verrouille oriente vers histoire', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_MONDE_LIBRE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#sel-biome-clavier option[value="eclipse"]')).toBeAttached({
        timeout: 10000,
    });
    await selectionnerBiomeVerrouilleConstellation(page, 'eclipse');
    await expect(page.locator('#panneau-detail-description')).toContainText(/MODE HISTOIRE/i);
    await expect(page.locator('#btn-panneau-detail-secondaire')).toContainText(/MODE HISTOIRE/i);
});

test('audit B — codex chemins caches verrouille avec condition', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    await page.locator('.codex-onglet[data-chapitre="chroniques"]').click();
    await expect(page.locator('.codex-item[data-id="chemins_caches"]')).toBeVisible({
        timeout: 10000,
    });
    const entree = page.locator('.codex-item[data-id="chemins_caches"]');
    await expect(entree).toHaveClass(/verrouille/);
    await expect(entree.locator('.codex-item-cond')).toContainText(/Archiviste/i);
});

test('audit B — carte histoire compteur et modal Trame', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_FIN_VRAIE_PRET);
    await expect(page.locator('#histoire-prog-trame')).toContainText(/TRAME\s+2\/4/i, {
        timeout: 10000,
    });
    await page.locator('#btn-histoire-trame').click();
    await expect(page.locator('#overlay-trame-conditions')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#histoire-trame-detail-liste li')).toHaveCount(4);
    await page.locator('#btn-trame-fermer').click();
    await expect(page.locator('#overlay-trame-conditions')).toHaveClass(/element-masque/);
});

test('audit B — briefing Distorsion sur monde finale', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await selectionnerMondeCarte(page, 'monde_boss_4');
    await expect(page.locator('#btn-histoire-briefing-distorsion')).not.toHaveClass(
        /element-masque/
    );
    await page.locator('#btn-histoire-briefing-distorsion').click({ force: true });
    await expect(page.locator('#overlay-tutoriel')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#tutoriel-titre')).toContainText(/DISTORSION/i);
});

test('audit B — briefing mécanique Archiviste sur carte histoire', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_ARCHIVISTE);
    await selectionnerMondeCarte(page, 'monde_boss_3');
    await expect(page.locator('#histoire-detail-avert')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#histoire-detail-avert')).toContainText(/faux fant[oô]me/i);
});

test('audit B — tip respiration cyber sur carte histoire', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_CYBER_LABO_PRET);
    await selectionnerMondeCarte(page, 'monde_cyber');
    await expect(page.locator('#histoire-detail-avert')).not.toHaveClass(/element-masque/);
    await expect(page.locator('#histoire-detail-avert')).toContainText(
        /vague|respiration|accalmie/i
    );
});
