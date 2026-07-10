import { expect } from '@playwright/test';
import { attendreNotificationsInitiales } from './helpers-page.mjs';
export {
    obtenirScenePostMonde,
    MARQUEURS_NARRATIFS_POST_MONDE,
    MARQUEURS_NARRATIFS_CAMPAGNE,
    SCENES_VICTOIRE_BOSS,
    HUMEURS_POST_MONDE_PIVOT,
} from './helpers-narratif-donnees.mjs';
export {
    attendreTypewriterInactif,
    attendreFinOverlaysHistoire,
    lireTexteCutsceneActive,
    avancerCutsceneUneLigne,
    assertAudioNarratifCutscene,
} from './helpers-narratif-core.mjs';
export { parcourirFluxPostVictoireAvecAssertions } from './helpers-narratif-flux-post.mjs';
export {
    viderOverlaysHistoireRapide,
    passerCutsceneEntiere,
    terminerCutscenesVersEcranFin,
} from './helpers-narratif-overlays.mjs';

import {
    attendreTypewriterInactif,
    lireTexteCutsceneActive,
    avancerCutsceneUneLigne,
} from './helpers-narratif-core.mjs';
import { SCENES_VICTOIRE_BOSS } from './helpers-narratif-donnees.mjs';

/** @param {import('@playwright/test').Page} page */
export async function cliquerCutsceneSuivant(page) {
    await page.evaluate(() => {
        document.getElementById('btn-cutscene-suivant')?.click();
    });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreCutsceneVictoireBoss(page) {
    await page.waitForFunction(
        () => {
            const recap = document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible');
            const cutscene = document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('actif');
            return recap || cutscene;
        },
        null,
        { timeout: 30000 }
    );

    const recapVisible = await page.evaluate(() =>
        document
            .getElementById('overlay-recap-monde')
            ?.classList.contains('objectif-overlay-visible')
    );
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
    }

    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const cutscene = document.getElementById('ecran-histoire-cutscene');
                    if (cutscene?.classList.contains('actif')) return true;
                    return Boolean(document.getElementById('btn-cutscene-suivant')?.offsetParent);
                }),
            { timeout: 30000 }
        )
        .toBe(true);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {RegExp} pivot
 * @param {string} [sceneFin]
 * @param {number} [max]
 */
export async function avancerCutsceneJusquaPivot(page, pivot, sceneFin, max = 80) {
    const delaiTypewriter = 12000;
    let sceneFinVue = false;
    const corpus = [];
    for (let i = 0; i < max; i++) {
        await attendreTypewriterInactif(page, delaiTypewriter, { strict: true });
        const actif = await page.evaluate(() =>
            document.getElementById('ecran-histoire-cutscene')?.classList.contains('actif')
        );
        if (!actif) break;

        const scene = await page.evaluate(
            () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
        );
        if (sceneFin && scene === sceneFin) sceneFinVue = true;

        const t = await lireTexteCutsceneActive(page);
        if (t.trim()) corpus.push(t);
        const texteAccumule = corpus.join('\n');
        if (pivot.test(t) || pivot.test(texteAccumule)) {
            if (sceneFin) {
                expect(sceneFinVue || scene === sceneFin).toBe(true);
            }
            return t;
        }

        const avant = t;
        await cliquerCutsceneSuivant(page);
        await attendreTypewriterInactif(page, delaiTypewriter, { strict: true });
        const apres = await lireTexteCutsceneActive(page);
        if (apres === avant && apres.trim().length > 0) {
            await cliquerCutsceneSuivant(page);
            await attendreTypewriterInactif(page, delaiTypewriter, { strict: true });
        }

        const sceneApres = await page.evaluate(
            () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
        );
        if (sceneFin && sceneApres === sceneFin) sceneFinVue = true;
    }
    await attendreTypewriterInactif(page, delaiTypewriter, { strict: true });
    const texteFinal = corpus.join('\n');
    if (sceneFin) {
        expect(sceneFinVue).toBe(true);
        expect(pivot.test(texteFinal)).toBe(true);
        return texteFinal;
    }
    expect(pivot.test(texteFinal)).toBe(true);
    return texteFinal;
}

/** @param {import('@playwright/test').Page} page @param {string} sceneId @param {number} [timeout] */
export async function attendreSceneCutsceneActive(page, sceneId, timeout = 15000) {
    await expect
        .poll(
            () => page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null),
            { timeout }
        )
        .toBe(sceneId);
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId @param {number} [lignes] */
export async function simulerVictoireBossHistoire(page, mondeId, lignes = 99) {
    await page.evaluate(
        async ([id, n]) => {
            await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.(id, n);
        },
        [mondeId, lignes]
    );
    await attendreNotificationsInitiales(page);
}

/** @param {import('@playwright/test').Page} page @param {string} personnageId @param {string} humeur @param {number} [timeout] */
export async function assertHumeurPortraitCutscene(page, personnageId, humeur, timeout = 15000) {
    await attendreTypewriterInactif(page, 10000);
    await expect
        .poll(
            () =>
                page.evaluate(
                    (id) => window.__NEO_TEST__?.obtenirHumeurPortraitCutscene?.(id) ?? null,
                    personnageId
                ),
            { timeout }
        )
        .toBe(humeur);
}

/** @param {import('@playwright/test').Page} page @param {number} [timeout] */
export async function attendreJournalHistoire(page, timeout = 30000) {
    await expect(page.locator('#ecran-histoire-journal')).toHaveClass(/actif/, { timeout });
}

/** @param {import('@playwright/test').Page} page @param {'brasier' | 'sentinelle' | 'archiviste' | 'avantgarde' | 'distorsion'} bossKey */
export async function parcourirVictoireBossJusquaPivot(page, bossKey) {
    const cfg = SCENES_VICTOIRE_BOSS[bossKey];
    await attendreSceneCutsceneActive(page, cfg.debut);

    const scenesCibles = [];
    if (cfg.sceneIntermediaire) scenesCibles.push(cfg.sceneIntermediaire);
    if (cfg.fin) scenesCibles.push(cfg.fin);

    for (const sceneCible of scenesCibles) {
        await expect
            .poll(
                async () => {
                    const scene = await page.evaluate(
                        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
                    );
                    if (scene === sceneCible) return sceneCible;
                    const actif = await page.evaluate(() =>
                        document
                            .getElementById('ecran-histoire-cutscene')
                            ?.classList.contains('actif')
                    );
                    if (!actif) return '__CUTSCENE_INACTIVE__';
                    await avancerCutsceneUneLigne(page, 12000, true);
                    return scene ?? '__VIDE__';
                },
                { timeout: 90000, intervals: [150, 250, 400] }
            )
            .toBe(sceneCible);
    }
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
export async function lancerMondeDepuisCarte(page, mondeId) {
    await page.locator('#histoire-monde-clavier').selectOption(mondeId, { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect
        .poll(async () => {
            return page.evaluate(() => {
                const cutscene = document.getElementById('ecran-histoire-cutscene');
                const cutsceneVisible =
                    cutscene &&
                    (cutscene.classList.contains('actif') ||
                        cutscene.classList.contains('cutscene-mode-dialogue') ||
                        cutscene.classList.contains('cutscene-mode-narration'));
                const partie = document.body.classList.contains('partie-active');
                return cutsceneVisible || partie;
            });
        })
        .toBe(true);
    await attendreTypewriterInactif(page, 10000);
}
