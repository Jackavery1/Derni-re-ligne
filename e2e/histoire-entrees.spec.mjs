import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    lancerMondeDepuisCarte,
    attendreSceneCutsceneActive,
    ETAT_ENTREE_MIROIR,
    ETAT_ENTREE_TRAME,
    ETAT_PARADOXE_DEBLOQUE,
    ETAT_AVANT_FIN_NORMALE,
} from './helpers.mjs';
import {
    SCENES_ENTREE_CAMPAGNE,
    SCENES_ENTREE_SECRETS,
    HUMEURS_ENTREE_PIVOT,
} from './helpers-narratif-donnees.mjs';
import {
    assertScenePngCutsceneChargee,
    assertHumeurPortraitCutscene,
    avancerCutsceneJusquaPivot,
} from './helpers-narratif.mjs';
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

        await expect
            .poll(() =>
                page.evaluate(() => {
                    const cutscene = document.getElementById('ecran-histoire-cutscene');
                    return (
                        cutscene?.classList.contains('actif') ||
                        Boolean(
                            document.getElementById('btn-cutscene-suivant')?.offsetParent ||
                            document.getElementById('btn-cutscene-passer')?.offsetParent
                        )
                    );
                })
            )
            .toBe(true);
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
            await assertScenePngCutsceneChargee(page, cfg.scene, 20000);
            return;
        }

        await expect(page.locator('#ecran-histoire-cutscene')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#ecran-histoire-cutscene')).toContainText(cfg.marqueur);
        const sceneSecret = SCENES_ENTREE_SECRETS[cfg.mondeId];
        if (sceneSecret) {
            await assertScenePngCutsceneChargee(page, sceneSecret, 20000);
        }
    });
}

const ENTREES_HUMEUR_CAMPAGNE = MONDES_CAMPAGNE_PRINCIPALE.filter((id) => HUMEURS_ENTREE_PIVOT[id]);

for (const mondeId of ENTREES_HUMEUR_CAMPAGNE) {
    const cfg = HUMEURS_ENTREE_PIVOT[mondeId];
    test(`entree ${mondeId} — humeur ${cfg.personnage} ${cfg.humeur} (audit D)`, async ({
        page,
    }) => {
        test.setTimeout(90000);
        const etat = preparerEtatPremiereEntree(mondeId);
        await ouvrirCarteHistoire(page, etat);
        await lancerMondeDepuisCarte(page, mondeId);
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 15000,
        });
        await avancerCutsceneJusquaPivot(page, cfg.pivot);
        await assertHumeurPortraitCutscene(page, cfg.personnage, cfg.humeur);
    });
}

const ENTREES_HUMEUR_SECRETS = [
    { mondeId: 'monde_miroir', etat: ETAT_ENTREE_MIROIR, humeurCle: 'monde_miroir' },
    { mondeId: 'monde_trame', etat: ETAT_ENTREE_TRAME, humeurCle: 'monde_trame' },
    { mondeId: 'monde_paradoxe', etat: ETAT_PARADOXE_DEBLOQUE, humeurCle: 'monde_paradoxe' },
    { mondeId: 'monde_finale', etat: ETAT_AVANT_FIN_NORMALE, humeurCle: 'monde_finale' },
    {
        mondeId: 'monde_finale',
        etat: {
            ...ETAT_AVANT_FIN_NORMALE,
            mondesCompletes: [...ETAT_AVANT_FIN_NORMALE.mondesCompletes, 'monde_miroir'],
            conditionsTrame: {
                ...ETAT_AVANT_FIN_NORMALE.conditionsTrame,
                miroirComplete: true,
            },
        },
        humeurCle: 'monde_finale_miroir',
        label: 'monde_finale_miroir',
    },
].filter((e) => HUMEURS_ENTREE_PIVOT[e.humeurCle]);

for (const { mondeId, etat, humeurCle, label } of ENTREES_HUMEUR_SECRETS) {
    const cfg = HUMEURS_ENTREE_PIVOT[humeurCle];
    const nomTest = label ?? mondeId;
    test(`entree ${nomTest} — humeur ${cfg.personnage} ${cfg.humeur} (audit D)`, async ({
        page,
    }) => {
        test.setTimeout(90000);
        await ouvrirCarteHistoire(page, etat);
        await lancerMondeDepuisCarte(page, mondeId);
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 15000,
        });
        await avancerCutsceneJusquaPivot(page, cfg.pivot);
        await assertHumeurPortraitCutscene(page, cfg.personnage, cfg.humeur);
    });
}

test('humeurs entree — couvre les 21 pivots HUMEURS_ENTREE_PIVOT', () => {
    const couverts = new Set([
        ...ENTREES_HUMEUR_CAMPAGNE,
        ...ENTREES_HUMEUR_SECRETS.map((e) => e.humeurCle),
    ]);
    expect([...couverts].sort()).toEqual(Object.keys(HUMEURS_ENTREE_PIVOT).sort());
});
