import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, terminerCutscenesVersEcranFin } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire.mjs';
import {
    OPTIONS_CAMPAGNE_BULK,
    OPTIONS_CAMPAGNE_JALON,
    parcourirMondesCampagneNarratif,
    victoireMondeAvecNarratif,
    preparerConditionsTrameOrganiques,
} from './helpers-campagne-narratif.mjs';

const CAMPAGNE_NARRATIF_PARTIE_1 = MONDES_CAMPAGNE_PRINCIPALE.slice(0, 8);
const CAMPAGNE_NARRATIF_PARTIE_2 = MONDES_CAMPAGNE_PRINCIPALE.slice(8);

test.describe.serial('audit D9b — campagne complete avec narratif', () => {
    test('partie principale — mondes 1 à 8', async ({ page }) => {
        test.setTimeout(300000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesDejaMontres: ['monde_prologue'],
        };
        await ouvrirCarteHistoire(page, etatDepart);
        await parcourirMondesCampagneNarratif(
            page,
            CAMPAGNE_NARRATIF_PARTIE_1,
            OPTIONS_CAMPAGNE_BULK
        );
    });

    test('partie principale — mondes 9 à 16', async ({ page }) => {
        test.setTimeout(300000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesCompletes: [...CAMPAGNE_NARRATIF_PARTIE_1],
            bossVaincus: ['brasier', 'sentinelle'],
            mondesDejaMontres: ['monde_prologue', ...CAMPAGNE_NARRATIF_PARTIE_1],
        };
        await ouvrirCarteHistoire(page, etatDepart);
        await parcourirMondesCampagneNarratif(
            page,
            CAMPAGNE_NARRATIF_PARTIE_2,
            OPTIONS_CAMPAGNE_BULK
        );
    });

    test('secrets et fin secrete — narratif complet', async ({ page }) => {
        test.setTimeout(240000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesCompletes: [...MONDES_CAMPAGNE_PRINCIPALE],
            mondesCachesDebloques: ['monde_miroir'],
            mondesDejaMontres: ['monde_prologue', ...MONDES_CAMPAGNE_PRINCIPALE],
            bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde'],
            conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
        };
        await ouvrirCarteHistoire(page, etatDepart);

        await victoireMondeAvecNarratif(page, 'monde_miroir', OPTIONS_CAMPAGNE_JALON);
        await preparerConditionsTrameOrganiques(page);
        await parcourirMondesCampagneNarratif(
            page,
            ['monde_trame', 'monde_finale'],
            OPTIONS_CAMPAGNE_JALON
        );

        await page.evaluate(async () => {
            await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
        });
        await terminerCutscenesVersEcranFin(page);
        await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute(
            'data-fin',
            'fin_secrete'
        );
        await expect(page.locator('#histoire-fin-titre')).toContainText(/LIGNE PARFAITE/i);
    });
});
