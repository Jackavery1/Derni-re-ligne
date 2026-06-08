import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    demarrerPartie,
    demarrerPartieViaClavier,
    terminerPartieCourante,
    filtrerViolationsCritiques,
    preparerPageSansSw,
    attendreApplicationPrete,
} from './helpers.mjs';

test('aucune bannière erreur au démarrage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
});

test('écran titre et navigation vers la sélection', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
        timeout: 15000,
    });
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await expect(page.locator('#canvas-constellation')).toBeVisible();
});

test('lancement partie via constellation affiche le plateau', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#affichage-temps')).not.toHaveText('00:00', { timeout: 5000 });
});

test('pause puis quitter retourne au menu', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
    await page.keyboard.press('p');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    await page.locator('#btn-pause-quitter').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await expect(page.locator('#interface-jeu')).not.toBeVisible();
});

test('écran titre sans violations accessibilité critiques', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('écran titre respecte le contraste des couleurs', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page }).analyze();
    const contrast = result.violations.filter((v) => v.id === 'color-contrast');
    expect(contrast).toEqual([]);
});

test('interface jeu sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartie(page);
    const result = await new AxeBuilder({ page }).include('#interface-jeu').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('options affiche l’onglet contrôles', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
    await page.locator('#tab-controles').click();
    await expect(page.locator('#panneau-controles')).toBeVisible();
    await expect(page.locator('#panneau-controles')).not.toHaveAttribute('hidden');
});

test('sélection biome au clavier démarre une partie', async ({ page }) => {
    await demarrerPartieViaClavier(page);
    await expect(page.locator('#affichage-temps')).not.toHaveText('00:00', { timeout: 5000 });
});

test('toggle marathon sprint retiré de l écran titre', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#btn-mode-sprint')).toHaveCount(0);
    await expect(page.locator('#btn-mode-marathon')).toHaveCount(0);
});

test('game over affiche l écran dédié', async ({ page }) => {
    await demarrerPartieViaClavier(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
});

test('options respecte le contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    const result = await new AxeBuilder({ page }).include('#ecran-options').analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('écran titre utilisable sur viewport mobile', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('#btn-jouer')).toBeVisible();
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#sel-biome-clavier')).toBeVisible();
});
