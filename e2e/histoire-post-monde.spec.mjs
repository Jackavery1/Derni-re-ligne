import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, ETAT_FIN_SECRETE_PRET, ETAT_PARADOXE_DEBLOQUE } from './helpers.mjs';
import {
    MARQUEURS_NARRATIFS_POST_MONDE,
    SCENES_POST_MONDE,
    parcourirFluxPostVictoireAvecAssertions,
    viderOverlaysHistoireRapide,
} from './helpers-narratif.mjs';
import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';

const MONDES_POST_MONDE = Object.keys(CUTSCENES_POST_MONDE);

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

    const recapVisible = await page
        .locator('#overlay-recap-monde')
        .evaluate((el) => el.classList.contains('objectif-overlay-visible'))
        .catch(() => false);
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
    }

    const sceneAttendue = SCENES_POST_MONDE[mondeId];
    if (sceneAttendue) {
        await expect
            .poll(() =>
                page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null)
            )
            .toBe(sceneAttendue);
    }
}

test('post-monde — cutscenes pour les 15 mondes narratifs', async ({ page }) => {
    test.setTimeout(420000);

    for (const mondeId of MONDES_POST_MONDE) {
        await ouvrirCarteHistoire(page, etatPourPostMonde(mondeId));
        await declencherPostMonde(page, mondeId);

        await parcourirFluxPostVictoireAvecAssertions(
            page,
            mondeId,
            MARQUEURS_NARRATIFS_POST_MONDE[mondeId] ?? []
        );
        await viderOverlaysHistoireRapide(page, 16);
    }

    expect(MONDES_POST_MONDE).toHaveLength(15);
});
