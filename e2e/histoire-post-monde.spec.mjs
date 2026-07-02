import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, ETAT_FIN_SECRETE_PRET, ETAT_PARADOXE_DEBLOQUE } from './helpers.mjs';
import {
    MARQUEURS_NARRATIFS_POST_MONDE,
    MARQUEURS_NARRATIFS_CAMPAGNE,
    obtenirScenePostMonde,
    parcourirFluxPostVictoireAvecAssertions,
    viderOverlaysHistoireRapide,
} from './helpers-narratif.mjs';
import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';

const MONDES_POST_MONDE = Object.keys(CUTSCENES_POST_MONDE);

const MONDES_AVEC_TRANSITION_CHAPITRE = new Set([
    'monde_prologue',
    'monde_boss_1',
    'monde_boss_2',
    'monde_boss_3',
    'monde_boss_4',
]);

/** @param {string} mondeId */
function marqueursPourPostMonde(mondeId) {
    if (MONDES_AVEC_TRANSITION_CHAPITRE.has(mondeId)) {
        return MARQUEURS_NARRATIFS_CAMPAGNE[mondeId] ?? [];
    }
    return MARQUEURS_NARRATIFS_POST_MONDE[mondeId] ?? [];
}

/** @param {string} mondeId */
function etatPourPostMonde(mondeId) {
    return mondeId === 'monde_paradoxe' ? ETAT_PARADOXE_DEBLOQUE : ETAT_FIN_SECRETE_PRET;
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
async function declencherPostMonde(page, mondeId) {
    await page.evaluate(async (id) => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.(id);
    }, mondeId);

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
        { timeout: 15000 }
    );

    const recapVisible = await page.evaluate(() =>
        document
            .getElementById('overlay-recap-monde')
            ?.classList.contains('objectif-overlay-visible')
    );
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
    }

    const sceneAttendue = obtenirScenePostMonde(mondeId);
    const attendScene = sceneAttendue && !MONDES_AVEC_TRANSITION_CHAPITRE.has(mondeId);
    if (attendScene) {
        await expect
            .poll(
                () =>
                    page.evaluate(
                        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
                    ),
                { timeout: 20000 }
            )
            .toBe(sceneAttendue);
    } else {
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 20000,
        });
    }
}

test('post-monde — cutscenes pour les 15 mondes narratifs', async ({ page }) => {
    test.setTimeout(600000);

    for (const mondeId of MONDES_POST_MONDE) {
        await ouvrirCarteHistoire(page, etatPourPostMonde(mondeId));
        await declencherPostMonde(page, mondeId);

        await parcourirFluxPostVictoireAvecAssertions(
            page,
            mondeId,
            marqueursPourPostMonde(mondeId)
        );
        await viderOverlaysHistoireRapide(page, 16);
    }

    expect(MONDES_POST_MONDE).toHaveLength(15);
});
