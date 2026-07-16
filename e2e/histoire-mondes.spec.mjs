import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    passerFluxLancementMonde,
    elementAClasse,
    boutonEstVisible,
    attendreTypewriterInactif,
    lancerMondeDepuisCarte,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './helpers.mjs';
import {
    ETAT_PARADOXE_DEBLOQUE,
    ETAT_ENTREE_COSMOS,
    ETAT_ENTREE_VIDE,
    ETAT_ENTREE_TRAME,
} from './etats-histoire.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

const ETAT_MIROIR_DEBLOQUE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCachesDebloques: ['monde_miroir'],
    mondesDejaMontres: ['monde_boss_1', 'monde_miroir'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
};

const ETAT_TRAME_DEBLOQUE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCachesDebloques: ['monde_miroir', 'monde_trame'],
    mondesDejaMontres: ['monde_boss_1', 'monde_trame'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
    conditionsTrame: {
        miroirComplete: true,
        tousJournauxTrouves: true,
        tousBossSansContinue: true,
        actionDistorsionFaite: true,
    },
};

test('monde caché Miroir jouable une fois débloqué', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_MIROIR_DEBLOQUE);
    await lancerMondeDepuisCarte(page, 'monde_miroir');
    await passerFluxLancementMonde(page);
    await expect(page.locator('#interface-jeu [data-label="score"]')).toHaveText('REFLET');
});

test('monde caché Trame jouable une fois débloqué', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_TRAME_DEBLOQUE);
    await lancerMondeDepuisCarte(page, 'monde_trame');
    await passerFluxLancementMonde(page);
    await expect(page.locator('#interface-jeu [data-label="score"]')).toHaveText('RÉSONANCE');
});

test('monde caché Paradoxe affiche sa cutscene puis revient à la carte', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_PARADOXE_DEBLOQUE);
    await lancerMondeDepuisCarte(page, 'monde_paradoxe');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    for (let i = 0; i < 4; i++) {
        if (await elementAClasse(page, 'ecran-histoire-map', 'actif')) {
            break;
        }
        if (await boutonEstVisible(page, '#btn-cutscene-passer')) {
            await page.locator('#btn-cutscene-passer').click({ force: true });
        } else {
            await attendreTypewriterInactif(page, 500).catch(() => {});
        }
    }
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 10000 });
});

test('cutscene entree monde lave — fond scene seuil_brasier', async ({ page }) => {
    test.setTimeout(60000);
    const etatLave = {
        ...ETAT_HISTOIRE_VIDE,
        mondesCompletes: ['monde_prologue'],
        mondesDejaMontres: ['monde_prologue'],
    };
    await ouvrirCarteHistoire(page, etatLave);
    await lancerMondeDepuisCarte(page, 'monde_lave');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await page.waitForFunction(
        () =>
            document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('cutscene-scene-image'),
        null,
        { timeout: 10000 }
    );
    const statsCanvas = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-cutscene-bg');
        if (!canvas || canvas.width < 16 || canvas.height < 16) return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 16) continue;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            n++;
        }
        if (n === 0) return null;
        return { r: r / n, g: g / n, b: b / n, n };
    });
    expect(statsCanvas).not.toBeNull();
    expect(statsCanvas.n).toBeGreaterThan(1000);
    expect(statsCanvas.r).toBeGreaterThan(statsCanvas.g);
});

/** @param {import('@playwright/test').Page} page */
async function attendreCutsceneSceneImage(page) {
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await page.waitForFunction(
        () =>
            document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('cutscene-scene-image'),
        null,
        { timeout: 10000 }
    );
}

/** @param {import('@playwright/test').Page} page @param {object} etat @param {string} mondeId */
async function lancerMondeEtAttendreScene(page, etat, mondeId) {
    await ouvrirCarteHistoire(page, etat);
    await lancerMondeDepuisCarte(page, mondeId);
    await attendreCutsceneSceneImage(page);
}

test('cutscene entree monde cosmos — fond scene observatoire', async ({ page }) => {
    await lancerMondeEtAttendreScene(page, ETAT_ENTREE_COSMOS, 'monde_cosmos');
});

test('cutscene entree monde vide — fond scene vide_errance', async ({ page }) => {
    await lancerMondeEtAttendreScene(page, ETAT_ENTREE_VIDE, 'monde_vide');
});

test('cutscene entree monde trame — fond scene trame', async ({ page }) => {
    await lancerMondeEtAttendreScene(page, ETAT_ENTREE_TRAME, 'monde_trame');
});

test('cutscene narration active le mode voix off', async ({ page }) => {
    const etatPremiereVisiteBoss = {
        ...ETAT_HISTOIRE_BOSS_BRASIER,
        mondesDejaMontres: [],
    };
    await ouvrirCarteHistoire(page, etatPremiereVisiteBoss);
    await lancerMondeDepuisCarte(page, 'monde_boss_1');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/cutscene-mode-narration/);
    await expect(page.locator('#texte-narration-cutscene')).toBeVisible();
});

test('mondes cachés non débloqués absents de la sélection clavier', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await expect(
        page.locator('#histoire-monde-clavier option[value="monde_prologue"]')
    ).toBeAttached({
        timeout: 10000,
    });
    const options = await page.locator('#histoire-monde-clavier option').allInnerTexts();
    const valeurs = await page
        .locator('#histoire-monde-clavier option')
        .evaluateAll((opts) => opts.map((o) => o.value));
    expect(valeurs).not.toContain('monde_miroir');
    expect(valeurs).not.toContain('monde_trame');
    expect(valeurs).not.toContain('monde_paradoxe');
    expect(options.length).toBeGreaterThan(0);
});
