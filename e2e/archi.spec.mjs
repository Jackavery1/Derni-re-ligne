import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    filtrerViolationsCritiques,
    preparerPageSansSw,
    attendreApplicationPrete,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ouvrirPremierNiveauArchitecte,
} from './helpers.mjs';

test('écran sélection constellation sans violations critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('écran options sans violations critiques', async ({ page }) => {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-options').click();
    await expect(page.locator('#ecran-options')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('navigation vers la sélection architecte', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    await expect(page.locator('#archi-sel-grille')).toBeVisible();
});

test('sélection architecte sans violations critiques', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    const result = await new AxeBuilder({ page }).analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('lancement niveau architecte affiche le plateau', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#zone-jeu-archi canvas')).toBeVisible();
});

test('retour menu depuis sélection architecte', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await page.locator('#archi-sel-retour').click();
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/);
});

test('undo architecte restaure un placement', async ({ page }) => {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const piecesAvant = await page.locator('#archi-pieces-used').textContent();
    await page.keyboard.press('Enter');
    await expect(page.locator('#archi-pieces-used')).not.toHaveText(piecesAvant ?? '0');
    await page.keyboard.press('Backspace');
    await expect(page.locator('#archi-pieces-used')).toHaveText(piecesAvant ?? '0');
});

test('architecte tactile paysage — valider via bouton', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#controles-archi-paysage')).toBeVisible();

    const piecesAvant = (await page.locator('#archi-pieces-used').textContent()) ?? '0';
    await page.locator('#btn-archi-valider-p').click();
    await expect(page.locator('#archi-pieces-used')).not.toHaveText(piecesAvant);

    const metriques = await page.evaluate(() => {
        const btn = document.getElementById('btn-archi-valider-p');
        const rect = btn?.getBoundingClientRect();
        return { h: rect?.height ?? 0, w: rect?.width ?? 0 };
    });
    expect(metriques.h).toBeGreaterThanOrEqual(48);
    expect(metriques.w).toBeGreaterThanOrEqual(48);
});

test('architecte portrait — jeu accessible sans overlay bloquant', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#overlay-orientation')).toHaveCount(0);
});

test('sélection architecte mobile — grille et filtres utilisables', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await expect(page.locator('#ecran-archi-selection')).toHaveClass(/actif/);
    await expect(page.locator('#archi-sel-grille')).toBeVisible();

    const metriques = await page.evaluate(() => {
        const doc = document.documentElement;
        const filtre = document.querySelector('.archi-filtre-btn');
        const rect = filtre?.getBoundingClientRect();
        return {
            debord: doc.scrollWidth > doc.clientWidth + 1,
            filtreH: rect?.height ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.filtreH).toBeGreaterThanOrEqual(48);
});

test('architecte paysage tablette — contrôles paysage visibles', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const layout = await page.evaluate(() => {
        const portrait = document.getElementById('controles-archi');
        const paysage = document.getElementById('controles-archi-paysage');
        const styleP = portrait ? getComputedStyle(portrait) : null;
        const styleL = paysage ? getComputedStyle(paysage) : null;
        return {
            paysageVisible: styleL?.display !== 'none' && styleL?.visibility !== 'hidden',
            portraitMasque: styleP?.display === 'none' || styleP?.visibility === 'hidden',
        };
    });
    expect(layout.paysageVisible).toBe(true);
    expect(layout.portraitMasque).toBe(true);

    const piecesAvant = (await page.locator('#archi-pieces-used').textContent()) ?? '0';
    await page.locator('#btn-archi-valider-p').click();
    await expect(page.locator('#archi-pieces-used')).not.toHaveText(piecesAvant);
});

test('architecte telephone paysage — panneau stats scrollable', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const metriques = await page.evaluate(() => {
        const panneau = document.querySelector('#interface-jeu-archi .panneau-archi');
        const objectif = document.getElementById('archi-par');
        const style = panneau ? getComputedStyle(panneau) : null;
        const rect = objectif?.getBoundingClientRect();
        return {
            overflowY: style?.overflowY ?? '',
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            objectifVisible: Boolean(rect && rect.height > 0),
            paysageCtrl: getComputedStyle(
                document.getElementById('controles-archi-paysage') ?? document.body
            ).display,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.overflowY).toBe('auto');
    expect(metriques.objectifVisible).toBe(true);
    expect(metriques.paysageCtrl).not.toBe('none');
});
