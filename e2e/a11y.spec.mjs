import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    filtrerViolationsCritiques,
    terminerPartieCourante,
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    ETAT_DEBLOCAGE_COMPLET,
    ouvrirCarteHistoire,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './helpers.mjs';

test('écran titre sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-titre').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('écran titre — contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    const result = await new AxeBuilder({ page })
        .include('#ecran-titre')
        .withRules(['color-contrast'])
        .analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('sélection biome — contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page })
        .include('#ecran-selection')
        .withRules(['color-contrast'])
        .analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('achievements — contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page })
        .include('#ecran-achievements')
        .withRules(['color-contrast'])
        .analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('profil — contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-profil').click();
    await expect(page.locator('#ecran-profil')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page })
        .include('#ecran-profil')
        .withRules(['color-contrast'])
        .analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('codex — contraste des couleurs', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page })
        .include('#ecran-codex')
        .withRules(['color-contrast'])
        .analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('achievements sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-achievements').click();
    await expect(page.locator('#ecran-achievements')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-achievements').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('profil sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-profil').click();
    await expect(page.locator('#ecran-profil')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-profil').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('sélection biome sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-selection').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('pause sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartie(page);
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
    await page.keyboard.press('p');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-pause').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('game over sans violations accessibilité critiques', async ({ page }) => {
    await demarrerPartie(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });
    const result = await new AxeBuilder({ page }).include('#ecran-game-over').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('codex sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-codex').click();
    await expect(page.locator('#ecran-codex')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-codex').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('options sans violations accessibilité critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-options').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('cutscene histoire sans violations accessibilité critiques', async ({ page }) => {
    const etatPremiereVisiteBoss = {
        ...ETAT_HISTOIRE_BOSS_BRASIER,
        mondesDejaMontres: [],
    };
    await ouvrirCarteHistoire(page, etatPremiereVisiteBoss);
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
    await page.waitForTimeout(300);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-cutscene').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('selection biome paysage mobile — sans violations critiques (audit C)', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).include('#ecran-selection').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('carte histoire paysage mobile — sans violations critiques (audit C)', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await ouvrirCarteHistoire(page, ETAT_DEBLOCAGE_COMPLET);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-map').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});
