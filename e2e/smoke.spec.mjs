import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function demarrerPartie(page) {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    const canvas = page.locator('#canvas-constellation');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    await canvas.click({
        position: { x: box.width * 0.5, y: box.height * 0.5 },
    });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu')).toBeVisible();
    await expect(page.locator('#canvas-plateau')).toBeVisible();
}

test('aucune bannière erreur au démarrage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#banniere-erreur')).not.toHaveClass(/visible/);
});

test('écran titre et navigation vers la sélection', async ({ page }) => {
    await page.goto('/');
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
    await page.locator('#btn-pause').click();
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);
    await page.locator('#btn-pause-quitter').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
    await expect(page.locator('#interface-jeu')).not.toBeVisible();
});

test('écran titre sans violations accessibilité critiques', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page }).analyze();
    const bloquantes = result.violations.filter(
        (v) => v.impact === 'critical' || (v.impact === 'serious' && v.id !== 'color-contrast')
    );
    expect(bloquantes).toEqual([]);
});

test('écran titre respecte le contraste des couleurs', async ({ page }) => {
    await page.goto('/');
    const result = await new AxeBuilder({ page }).analyze();
    const contrast = result.violations.filter((v) => v.id === 'color-contrast');
    expect(contrast).toEqual([]);
});

test('options affiche l’onglet contrôles', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
    await page.locator('#tab-controles').click();
    await expect(page.locator('#panneau-controles')).toBeVisible();
    await expect(page.locator('#panneau-controles')).not.toHaveAttribute('hidden');
});
