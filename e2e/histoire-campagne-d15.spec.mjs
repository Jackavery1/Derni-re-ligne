import { test } from '@playwright/test';
import { ouvrirCarteHistoire, parcourirFluxPostVictoireAvecAssertions } from './helpers.mjs';
import {
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_AVANT_BOSS_SENTINELLE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_AVANT_BOSS_AVANTGARDE,
} from './etats-histoire.mjs';

const SMOKE_D15_BOSS = [
    { mondeId: 'monde_boss_1', etat: ETAT_HISTOIRE_BOSS_BRASIER },
    { mondeId: 'monde_boss_2', etat: ETAT_AVANT_BOSS_SENTINELLE },
    { mondeId: 'monde_boss_3', etat: ETAT_AVANT_BOSS_ARCHIVISTE },
    { mondeId: 'monde_boss_4', etat: ETAT_AVANT_BOSS_AVANTGARDE },
];

test('campagne — smoke cutscenes 4 boss (audit D15)', async ({ page }) => {
    test.setTimeout(360000);

    for (const { mondeId, etat } of SMOKE_D15_BOSS) {
        await ouvrirCarteHistoire(page, etat);
        await page.evaluate(async (id) => {
            await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.(id, 99);
        }, mondeId);
        await parcourirFluxPostVictoireAvecAssertions(page, mondeId, undefined, 60, {
            typewriterTimeout: 12000,
            strictTypewriter: true,
        });
    }
});
