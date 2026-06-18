import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    viderOverlaysHistoireRapide,
    ETAT_FIN_SECRETE_PRET,
    ETAT_PARADOXE_DEBLOQUE,
} from './helpers.mjs';
import { CUTSCENES_POST_MONDE } from '../js/histoire-textes/cutscenes-post-monde.js';

const MONDES_POST_MONDE = Object.keys(CUTSCENES_POST_MONDE);

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
function etatPourPostMonde(mondeId) {
    return mondeId === 'monde_paradoxe' ? ETAT_PARADOXE_DEBLOQUE : ETAT_FIN_SECRETE_PRET;
}

/** @param {import('@playwright/test').Page} page @param {string} mondeId */
async function declencherPostMondeEtAttendreCutscene(page, mondeId) {
    await page.evaluate(async (id) => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.(id);
    }, mondeId);

    const recapVisible = await page
        .locator('#overlay-recap-monde')
        .evaluate((el) => el.classList.contains('objectif-overlay-visible'))
        .catch(() => false);
    if (recapVisible) {
        await page.locator('#btn-recap-continuer').click({ force: true });
    }

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });

    const scene = CUTSCENES_POST_MONDE[mondeId]?.scene;
    if (scene) {
        await page.waitForFunction(
            () => {
                const el = document.getElementById('ecran-histoire-cutscene');
                if (!el?.classList.contains('actif')) return false;
                if (el.classList.contains('cutscene-scene-image')) return true;
                const t =
                    document.getElementById('texte-dialogue-cutscene')?.textContent ??
                    document.getElementById('texte-narration-cutscene')?.textContent ??
                    '';
                return t.trim().length > 4;
            },
            null,
            { timeout: 30000 }
        );
    }
}

test('post-monde — cutscenes pour les 15 mondes narratifs', async ({ page }) => {
    test.setTimeout(420000);

    for (const mondeId of MONDES_POST_MONDE) {
        await ouvrirCarteHistoire(page, etatPourPostMonde(mondeId));
        await declencherPostMondeEtAttendreCutscene(page, mondeId);
        await viderOverlaysHistoireRapide(page, 16);
    }

    expect(MONDES_POST_MONDE).toHaveLength(15);
});
