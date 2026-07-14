import { test, expect } from '@playwright/test';
import { ouvrirCarteHistoire, terminerCutscenesVersEcranFin } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import { MONDES_CAMPAGNE_PRINCIPALE } from './etats-histoire.mjs';
import {
    OPTIONS_CAMPAGNE_D9,
    OPTIONS_CAMPAGNE_JALON,
    parcourirMondesCampagneNarratif,
    victoireMondeAvecNarratif,
    preparerConditionsTrameOrganiques,
    capturerEtatHistoireCampagne,
    chargerEtatHistoireCampagne,
} from './helpers-campagne-narratif.mjs';

const CAMPAGNE_PARTIE_1 = MONDES_CAMPAGNE_PRINCIPALE.slice(0, 8);
const CAMPAGNE_PARTIE_2 = MONDES_CAMPAGNE_PRINCIPALE.slice(8);

test.describe.serial('audit D9 — campagne complete avec narratif @slow', () => {
    test('partie principale — mondes 1 à 8', async ({ page }) => {
        test.setTimeout(300_000);
        const etatDepart = {
            ...ETAT_HISTOIRE_VIDE,
            mondesDejaMontres: ['monde_prologue'],
        };
        await ouvrirCarteHistoire(page, etatDepart);
        await parcourirMondesCampagneNarratif(page, CAMPAGNE_PARTIE_1, OPTIONS_CAMPAGNE_D9);
        await capturerEtatHistoireCampagne(page, 'd9-partie1');
    });

    test('partie principale — mondes 9 à 16', async ({ page }) => {
        test.setTimeout(300_000);
        const etatDepart = chargerEtatHistoireCampagne('d9-partie1');
        expect(etatDepart).toBeTruthy();
        await ouvrirCarteHistoire(page, etatDepart);
        await parcourirMondesCampagneNarratif(page, CAMPAGNE_PARTIE_2, OPTIONS_CAMPAGNE_D9);
        await capturerEtatHistoireCampagne(page, 'd9-partie2');
    });

    test('secrets, fin secrete et flags progression', async ({ page }) => {
        test.setTimeout(360_000);
        const etatSauve = chargerEtatHistoireCampagne('d9-partie2');
        expect(etatSauve).toBeTruthy();
        const etatDepart = {
            ...etatSauve,
            mondesCachesDebloques: [
                ...new Set([...(etatSauve.mondesCachesDebloques ?? []), 'monde_miroir']),
            ],
        };
        await ouvrirCarteHistoire(page, etatDepart);

        await victoireMondeAvecNarratif(page, 'monde_miroir', OPTIONS_CAMPAGNE_JALON);
        await preparerConditionsTrameOrganiques(page);
        await parcourirMondesCampagneNarratif(
            page,
            ['monde_trame', 'monde_finale'],
            OPTIONS_CAMPAGNE_JALON
        );

        const progression = await page.evaluate(async () => {
            const brut = localStorage.getItem('derniereLigne_histoire');
            const sauve = brut ? JSON.parse(brut) : {};
            const typeFin = await window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
            return {
                typeFin,
                mondesCompletes: sauve.mondesCompletes ?? [],
                finSecreteObtenue: sauve.conditionsParadoxe?.finSecreteObtenue === true,
            };
        });

        expect(progression.typeFin).toBe('fin_secrete');
        expect(progression.mondesCompletes).toContain('monde_trame');
        expect(progression.mondesCompletes).toContain('monde_finale');

        await page.evaluate(async () => {
            await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
        });
        await terminerCutscenesVersEcranFin(page);
        await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute(
            'data-fin',
            'fin_secrete'
        );
        await expect(page.locator('#histoire-fin-titre')).toContainText(/LIGNE PARFAITE/i);

        const apresOutro = await page.evaluate(() => {
            const brut = localStorage.getItem('derniereLigne_histoire');
            const sauve = brut ? JSON.parse(brut) : {};
            return {
                finSecreteObtenue: sauve.conditionsParadoxe?.finSecreteObtenue === true,
                toutesFin: sauve.toutesFinObtenues ?? [],
            };
        });
        expect(apresOutro.toutesFin).toContain('fin_secrete');
        expect(apresOutro.finSecreteObtenue).toBe(true);
    });
});
