import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    lancerMondeDepuisCarte,
    attendreSceneCutsceneActive,
} from './helpers.mjs';
import { SCENES_ENTREE_CAMPAGNE } from './helpers-narratif-donnees.mjs';
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire-base.mjs';
import { preparerEtatPremiereEntree } from './etats-histoire-entrees.mjs';

for (const mondeId of MONDES_CAMPAGNE_PRINCIPALE) {
    const sceneAttendue = SCENES_ENTREE_CAMPAGNE[mondeId];

    test(`entree ${mondeId} — scene ${sceneAttendue} (audit D)`, async ({ page }) => {
        test.setTimeout(90000);
        expect(sceneAttendue).toBeTruthy();

        const etat = preparerEtatPremiereEntree(mondeId);
        await ouvrirCarteHistoire(page, etat);
        await lancerMondeDepuisCarte(page, mondeId);

        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        await attendreSceneCutsceneActive(page, sceneAttendue);
    });
}

test('entrees campagne — couvre les 16 mondes principaux', () => {
    expect(MONDES_CAMPAGNE_PRINCIPALE).toHaveLength(16);
    for (const mondeId of MONDES_CAMPAGNE_PRINCIPALE) {
        expect(SCENES_ENTREE_CAMPAGNE[mondeId]).toBeTruthy();
    }
});
