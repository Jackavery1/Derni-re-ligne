import { test, expect } from '@playwright/test';
import { terminerCutscenesVersEcranFin } from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { parcourirCampagneFinSecreteNarratif } from './helpers-campagne-narratif.mjs';

test('campagne complete — flags fin secrete avec narratif post-victoire (audit D9) @slow', async ({
    page,
}) => {
    test.setTimeout(3_600_000);
    const etatDepart = {
        ...ETAT_HISTOIRE_VIDE,
        mondesDejaMontres: ['monde_prologue'],
    };

    await parcourirCampagneFinSecreteNarratif(page, etatDepart);

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
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_secrete');
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
