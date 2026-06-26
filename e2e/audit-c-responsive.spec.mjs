import { test, expect, devices } from '@playwright/test';
import {
    preparerPageSansSw,
    attendreApplicationPrete,
    demarrerPartie,
    demarrerPartieViaClavier,
    terminerPartieCourante,
    appliquerEncocheSimulee,
    ouvrirCarteHistoire,
    ETAT_DEBLOCAGE_COMPLET,
} from './helpers.mjs';

const ANNOTATION_C11 = {
    type: 'note',
    description:
        'Validation physique sur iPhone reelle non automatisable ; simulation --safe-top: 47px (Dynamic Island).',
};

async function ouvrirPremierNiveauArchitecte(page) {
    await page.locator('.carte-niveau-archi').first().click();
    await expect(page.locator('#panneau-detail-corps')).toHaveClass(/panneau-detail-corps--ouvert/);
    await page.locator('#btn-panneau-detail-jouer').click();
}

test('audit C11 — pause paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await demarrerPartie(page);
    await page.setViewportSize({ width: 667, height: 375 });
    await appliquerEncocheSimulee(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#ecran-pause')).toHaveClass(/actif/);

    const metriques = await page.evaluate(() => {
        const ecran = document.getElementById('ecran-pause');
        const style = ecran ? getComputedStyle(ecran) : null;
        const reprendre = document.getElementById('btn-reprendre');
        const rect = reprendre?.getBoundingClientRect();
        return {
            paddingTop: style?.paddingTop ?? '',
            topBouton: rect?.top ?? -1,
            boutonH: rect?.height ?? 0,
            safeTop: getComputedStyle(document.documentElement)
                .getPropertyValue('--safe-top')
                .trim(),
        };
    });
    expect(metriques.safeTop).toBe('47px');
    expect(parseFloat(metriques.paddingTop)).toBeGreaterThanOrEqual(46);
    expect(metriques.topBouton).toBeGreaterThanOrEqual(46);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
});

test('audit C11 — game over paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await page.setViewportSize({ width: 667, height: 375 });
    await demarrerPartieViaClavier(page);
    await appliquerEncocheSimulee(page);
    await terminerPartieCourante(page);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 10000 });

    const metriques = await page.evaluate(() => {
        const ecran = document.getElementById('ecran-game-over');
        const style = ecran ? getComputedStyle(ecran) : null;
        const bouton = document.querySelector('#ecran-game-over .go-boutons .bouton');
        const rect = bouton?.getBoundingClientRect();
        return {
            paddingTop: style?.paddingTop ?? '',
            topBouton: rect?.top ?? -1,
            boutonH: rect?.height ?? 0,
        };
    });
    expect(parseFloat(metriques.paddingTop)).toBeGreaterThanOrEqual(46);
    expect(metriques.topBouton).toBeGreaterThanOrEqual(46);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
});

test('audit C11 — architecte paysage respecte encoche simulee', async ({ page }) => {
    test.info().annotations.push(ANNOTATION_C11);
    await page.setViewportSize({ width: 667, height: 375 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await appliquerEncocheSimulee(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const metriques = await page.evaluate(() => {
        const conteneur = document.getElementById('conteneur-principal-archi');
        const style = conteneur ? getComputedStyle(conteneur) : null;
        const valider = document.getElementById('btn-archi-valider-p');
        const rect = valider?.getBoundingClientRect();
        return {
            paddingTop: style?.paddingTop ?? '',
            validerH: rect?.height ?? 0,
            validerW: rect?.width ?? 0,
            paysageVisible:
                getComputedStyle(
                    document.getElementById('controles-archi-paysage') ?? document.body
                ).display !== 'none',
        };
    });
    expect(parseFloat(metriques.paddingTop)).toBeGreaterThanOrEqual(46);
    expect(metriques.paysageVisible).toBe(true);
    expect(metriques.validerH).toBeGreaterThanOrEqual(48);
    expect(metriques.validerW).toBeGreaterThanOrEqual(48);
});

test('audit C1 — architecte telephone paysage tactile valider', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-architecte').click();
    await ouvrirPremierNiveauArchitecte(page);
    await expect(page.locator('#interface-jeu-archi')).toBeVisible({ timeout: 5000 });

    const piecesAvant = (await page.locator('#archi-pieces-used').textContent()) ?? '0';
    await page.locator('#btn-archi-valider-p').click();
    await expect(page.locator('#archi-pieces-used')).not.toHaveText(piecesAvant);

    const metriques = await page.evaluate(() => {
        const ids = [
            'btn-archi-gauche-p',
            'btn-archi-droite-p',
            'btn-archi-bas-p',
            'btn-archi-tourner-p',
            'btn-archi-valider-p',
        ];
        return ids.map((id) => {
            const rect = document.getElementById(id)?.getBoundingClientRect();
            return { id, h: rect?.height ?? 0, w: rect?.width ?? 0 };
        });
    });
    for (const btn of metriques) {
        expect(btn.h, btn.id).toBeGreaterThanOrEqual(48);
        expect(btn.w, btn.id).toBeGreaterThanOrEqual(48);
    }
});

test('audit C11 — carte histoire iPhone respecte encoche simulee', async ({ browser }) => {
    test.info().annotations.push(ANNOTATION_C11);
    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await ouvrirCarteHistoire(page, ETAT_DEBLOCAGE_COMPLET);
    await appliquerEncocheSimulee(page);

    const metriques = await page.evaluate(() => {
        const header = document.getElementById('histoire-map-header');
        const retour = document.getElementById('btn-histoire-retour');
        const style = header ? getComputedStyle(header) : null;
        const rect = retour?.getBoundingClientRect();
        return {
            paddingTop: style?.paddingTop ?? '',
            topRetour: rect?.top ?? -1,
            retourH: rect?.height ?? 0,
            safeTop: getComputedStyle(document.documentElement)
                .getPropertyValue('--safe-top')
                .trim(),
        };
    });
    expect(metriques.safeTop).toBe('47px');
    expect(parseFloat(metriques.paddingTop)).toBeGreaterThanOrEqual(46);
    expect(metriques.topRetour).toBeGreaterThanOrEqual(46);
    expect(metriques.retourH).toBeGreaterThanOrEqual(48);
    await context.close();
});
