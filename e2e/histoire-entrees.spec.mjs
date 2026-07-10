import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    lancerMondeDepuisCarte,
    attendreSceneCutsceneActive,
    ETAT_ENTREE_MIROIR,
    ETAT_ENTREE_TRAME,
    ETAT_PARADOXE_DEBLOQUE,
} from './helpers.mjs';
import { SCENES_ENTREE_CAMPAGNE, SCENES_ENTREE_SECRETS } from './helpers-narratif-donnees.mjs';
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

const ENTREES_SECRETS = [
    {
        mondeId: 'monde_miroir',
        etat: ETAT_ENTREE_MIROIR,
        marqueur: /Ce lieu n'aurait pas dû exister/i,
    },
    {
        mondeId: 'monde_trame',
        etat: ETAT_ENTREE_TRAME,
        marqueur: /Trame Primordiale/i,
    },
    {
        mondeId: 'monde_paradoxe',
        etat: ETAT_PARADOXE_DEBLOQUE,
        scene: SCENES_ENTREE_SECRETS.monde_paradoxe,
    },
];

for (const cfg of ENTREES_SECRETS) {
    test(`entree ${cfg.mondeId} — scene ${SCENES_ENTREE_SECRETS[cfg.mondeId]} (audit D)`, async ({
        page,
    }) => {
        test.setTimeout(90000);
        expect(SCENES_ENTREE_SECRETS[cfg.mondeId]).toBeTruthy();

        await ouvrirCarteHistoire(page, cfg.etat);
        await lancerMondeDepuisCarte(page, cfg.mondeId);

        if (cfg.scene) {
            await attendreSceneCutsceneActive(page, cfg.scene, 20000);
            return;
        }

        await expect(page.locator('#ecran-histoire-cutscene')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#ecran-histoire-cutscene')).toContainText(cfg.marqueur);
    });
}
