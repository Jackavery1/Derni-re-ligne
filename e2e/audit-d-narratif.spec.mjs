import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, lireTexteCutsceneActive, SCENES_VICTOIRE_BOSS } from './helpers.mjs';
import { ETAT_HISTOIRE_BOSS_BRASIER } from './etats-histoire.mjs';

const ETAT_AVANT_BOSS_SENTINELLE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    chapitreActuel: 'chapitre_3',
    mondesCompletes: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
    ],
    bossVaincus: ['brasier'],
    mondesDejaMontres: [
        'monde_prologue',
        'monde_lave',
        'monde_rouille',
        'monde_ocean',
        'monde_foret',
        'monde_glace',
        'monde_boss_2',
    ],
};

/** @param {import('@playwright/test').Page} page */
async function attendreCutsceneVictoireBoss(page) {
    await page
        .waitForFunction(
            () => {
                const recap = document
                    .getElementById('overlay-recap-monde')
                    ?.classList.contains('objectif-overlay-visible');
                const cutscene = document.getElementById('ecran-histoire-cutscene');
                const dialogue =
                    cutscene?.classList.contains('actif') ||
                    cutscene?.classList.contains('cutscene-mode-dialogue');
                return recap || dialogue;
            },
            null,
            { timeout: 15000 }
        )
        .catch(() => {});

    const recapVisible = await page
        .locator('#overlay-recap-monde')
        .evaluate((el) => el.classList.contains('objectif-overlay-visible'))
        .catch(() => false);
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
        await page.waitForTimeout(300);
    }

    await expect(page.locator('#btn-cutscene-suivant')).toBeVisible({ timeout: 10000 });
}

/** @param {import('@playwright/test').Page} page */
async function cliquerCutsceneSuivant(page) {
    await page.evaluate(() => {
        document.getElementById('btn-cutscene-suivant')?.click();
    });
}

/** @param {import('@playwright/test').Page} page @param {RegExp} pivot @param {string} [sceneFin] @param {number} [max] */
async function avancerCutsceneJusquaPivot(page, pivot, sceneFin, max = 40) {
    let sceneFinVue = false;
    for (let i = 0; i < max; i++) {
        const scene = await page.evaluate(
            () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
        );
        if (sceneFin && scene === sceneFin) sceneFinVue = true;

        const t = await lireTexteCutsceneActive(page);
        if (pivot.test(t)) {
            if (sceneFin) {
                expect(sceneFinVue || scene === sceneFin).toBe(true);
            }
            return t;
        }
        await cliquerCutsceneSuivant(page);
        await page.waitForTimeout(200);
    }
    if (sceneFin) expect(sceneFinVue).toBe(true);
    return lireTexteCutsceneActive(page);
}

test('victoire Brasier — transition seuil_brasier → labo (audit D)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_boss_1', 99);
    });
    await attendreCutsceneVictoireBoss(page);

    const sceneDebut = await page.evaluate(
        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
    );
    expect(sceneDebut).toBe(SCENES_VICTOIRE_BOSS.brasier.debut);

    await avancerCutsceneJusquaPivot(
        page,
        SCENES_VICTOIRE_BOSS.brasier.pivot,
        SCENES_VICTOIRE_BOSS.brasier.fin
    );
});

test('victoire Brasier — humeur ROBO triste (audit D)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_boss_1', 99);
    });
    await attendreCutsceneVictoireBoss(page);

    await avancerCutsceneJusquaPivot(page, /Moi non plus je ne sais pas comment m'arrêter/i);

    await expect
        .poll(() =>
            page.evaluate(() => window.__NEO_TEST__?.obtenirHumeurPortraitCutscene?.() ?? null)
        )
        .toBe('triste');
});

test('victoire Sentinelle — transition seuil_sentinelle → labo (audit D)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_BOSS_SENTINELLE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_boss_2', 99);
    });
    await attendreCutsceneVictoireBoss(page);

    const sceneDebut = await page.evaluate(
        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
    );
    expect(sceneDebut).toBe(SCENES_VICTOIRE_BOSS.sentinelle.debut);

    await avancerCutsceneJusquaPivot(
        page,
        SCENES_VICTOIRE_BOSS.sentinelle.pivot,
        SCENES_VICTOIRE_BOSS.sentinelle.fin
    );
});
