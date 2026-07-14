import { test } from '@playwright/test';
import { ouvrirCarteHistoire, parcourirFluxPostVictoireAvecAssertions } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire.mjs';

test('campagne — cutscenes intermediaires boss et chapitres (audit D15) @slow', async ({
    page,
}) => {
    test.setTimeout(900000);
    const etatDepart = {
        ...ETAT_HISTOIRE_VIDE,
        mondesDejaMontres: ['monde_prologue'],
    };
    await ouvrirCarteHistoire(page, etatDepart);

    for (const mondeId of MONDES_CAMPAGNE_PRINCIPALE) {
        await page.evaluate(async (id) => {
            await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.(id, 99);
        }, mondeId);
        await parcourirFluxPostVictoireAvecAssertions(page, mondeId, undefined, 60, {
            typewriterTimeout: 12000,
            strictTypewriter: true,
        });
    }
});
