import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    ouvrirCarteHistoire,
    lancerMondeBossBrasier,
    filtrerViolationsCritiques,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

test('carte histoire accessible depuis le menu', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
    await expect(page.locator('#histoire-prog-mondes')).toContainText('MONDES');
});

test('carte histoire sans violations accessibilité critiques', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-map').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('lancement boss affiche le HUD boss', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    const sectionBoss = page.locator('#section-boss');
    await expect(sectionBoss).toBeVisible();
    await expect(page.locator('#boss-nom-affiche')).toContainText('BRASIER');
    await expect(page.locator('#boss-hp-label')).toHaveText('8 / 8');
    await expect(page.locator('#canvas-boss-portrait')).toBeVisible();
});

test('sélection clavier d un monde sur la carte histoire', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1');
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await expect(page.locator('.bouton-jouer-monde')).toBeVisible();
});

test('carte histoire respecte le contraste des couleurs', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-map').analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('lancement prologue depuis la carte histoire', async ({ page }) => {
    await page.addInitScript((etat) => {
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
    }, ETAT_HISTOIRE_VIDE);
    await page.goto('/');
    await page.locator('#btn-mode-histoire').click();
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue');
    await page.locator('.bouton-jouer-monde').click();
    const passerCutscene = page.locator('#btn-cutscene-passer');
    if (await passerCutscene.isVisible().catch(() => false)) {
        await passerCutscene.click();
    }
    await expect(page.locator('#interface-jeu')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#canvas-plateau')).toBeVisible();
});

test('carte histoire utilisable sur viewport mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrirCarteHistoire(page);
    await expect(page.locator('#histoire-monde-clavier')).toBeVisible();
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
});
