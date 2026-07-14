import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    lancerMondeDepuisCarte,
    avancerCutsceneJusquaPivot,
    assertHumeurPortraitCutscene,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

test('cutscene paysage mobile — boutons dans la zone visible', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 844, height: 390 });
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });

    const metriques = await page.evaluate(() => {
        const suivant = document.getElementById('btn-cutscene-suivant');
        const rect = suivant?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            h: rect?.height ?? 0,
            dansEcran: Boolean(rect && rect.bottom <= window.innerHeight && rect.top >= 0),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.h).toBeGreaterThanOrEqual(48);
    expect(metriques.dansEcran).toBe(true);
});

test('cutscene ultra-etroit 319px — pas de debordement', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 319, height: 568 });
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });

    const metriques = await page.evaluate(() => {
        const suivant = document.getElementById('btn-cutscene-suivant');
        const passer = document.getElementById('btn-cutscene-passer');
        const rectS = suivant?.getBoundingClientRect();
        const rectP = passer?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            suivantH: rectS?.height ?? 0,
            passerH: rectP?.height ?? 0,
            dansEcran: Boolean(
                rectS &&
                rectP &&
                rectS.bottom <= window.innerHeight &&
                rectP.bottom <= window.innerHeight
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.suivantH).toBeGreaterThanOrEqual(48);
    expect(metriques.passerH).toBeGreaterThanOrEqual(48);
    expect(metriques.dansEcran).toBe(true);
});

test('cutscene ultra-etroit 319px — portraits visibles sans debordement (audit D8)', async ({
    page,
}) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 319, height: 568 });
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await avancerCutsceneJusquaPivot(page, /Robo, tu m'entends/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'douce');

    const metriques = await page.evaluate(() => {
        const gauche = document.getElementById('canvas-portrait-gauche');
        const droite = document.getElementById('canvas-portrait-droite');
        const dialogue = document.getElementById('texte-dialogue-cutscene');
        const rectG = gauche?.getBoundingClientRect();
        const rectD = droite?.getBoundingClientRect();
        const styleDialogue = dialogue ? getComputedStyle(dialogue) : null;
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            portraitGaucheVisible: Boolean(
                gauche && !gauche.classList.contains('absent') && (rectG?.width ?? 0) > 0
            ),
            portraitDroiteVisible: Boolean(
                droite && !droite.classList.contains('absent') && (rectD?.width ?? 0) > 0
            ),
            dialogueFontSize: parseFloat(styleDialogue?.fontSize ?? '0') || 0,
            dansEcran: Boolean(
                rectG &&
                rectD &&
                rectG.right <= window.innerWidth + 2 &&
                rectD.left >= -2 &&
                rectG.bottom <= window.innerHeight + 2
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.portraitGaucheVisible || metriques.portraitDroiteVisible).toBe(true);
    expect(metriques.dialogueFontSize).toBeGreaterThanOrEqual(12);
    expect(metriques.dansEcran).toBe(true);
});
