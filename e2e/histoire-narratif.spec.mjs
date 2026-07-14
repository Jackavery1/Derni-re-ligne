import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    passerCutsceneEntiere,
    passerFluxLancementMonde,
    elementAClasse,
    attendreApplicationPrete,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_CYBER_LABO_PRET,
    ETAT_AVANT_DESERT,
} from './helpers.mjs';
import { assertScenePngCutsceneChargee } from './helpers-narratif.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import {
    preparerEtatInterludePremiereCompletion,
    preparerEtatPremiereCompletionFragment,
} from './helpers-narratif-fragments.mjs';

test('post-monde monde lave — fond scene seuil_brasier', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_lave');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    const musique = await page.evaluate(() => window.__NEO_TEST__?.obtenirMusiqueActive?.());
    expect(musique).toBe('narratif_cutscene');
    await page.waitForFunction(
        () =>
            document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('cutscene-scene-image'),
        null,
        { timeout: 30000 }
    );
});

test('post-monde — audio narratif_cutscene sur mondes representatifs', async ({ page }) => {
    test.setTimeout(180000);
    const cas = [
        { mondeId: 'monde_lave', etat: ETAT_HISTOIRE_BOSS_BRASIER },
        { mondeId: 'monde_ocean', etat: preparerEtatPremiereCompletionFragment('monde_ocean') },
        { mondeId: 'monde_cyber', etat: ETAT_CYBER_LABO_PRET },
    ];

    for (const { mondeId, etat } of cas) {
        await ouvrirCarteHistoire(page, etat);
        await page.evaluate(async (id) => {
            await window.__NEO_TEST__?.declencherPostMondeNarratif?.(id);
        }, mondeId);
        await fermerRecapPostMonde(page);
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 10000,
        });
        const musique = await page.evaluate(() => window.__NEO_TEST__?.obtenirMusiqueActive?.());
        expect(musique).toBe('narratif_cutscene');
        await passerCutsceneEntiere(page);
    }
});

test('victoire objectif prologue — pipeline difficulte vers narratif (audit D)', async ({
    page,
}) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireObjectifHistoire?.('monde_prologue');
    });
    const { parcourirFluxPostVictoireAvecAssertions } = await import('./helpers-narratif.mjs');
    await parcourirFluxPostVictoireAvecAssertions(page, 'monde_prologue', undefined, 80, {
        exigerCorpus: true,
        verifierAudio: true,
    });
});

test('interlude rouille — gardiens detectes', async ({ page }) => {
    test.setTimeout(60000);
    const etat = preparerEtatInterludePremiereCompletion('monde_rouille');
    await ouvrirCarteHistoire(page, etat);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_rouille');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await expect
        .poll(async () => {
            const t = await page.evaluate(
                () => document.getElementById('ecran-histoire-cutscene')?.textContent ?? ''
            );
            return /GARDIEN/i.test(t);
        })
        .toBe(true);
    await assertScenePngCutsceneChargee(page, 'interlude_gardiens');
});

test('interlude eclipse — La Distorsion laisse passer', async ({ page }) => {
    test.setTimeout(60000);
    const etat = preparerEtatInterludePremiereCompletion('monde_eclipse');
    await ouvrirCarteHistoire(page, etat);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_eclipse');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await expect
        .poll(async () => {
            const t = await page.evaluate(
                () => document.getElementById('ecran-histoire-cutscene')?.textContent ?? ''
            );
            return /Ailleurs|centre de la Trame|Laissez-le passer|61% DES FRAGMENTS/i.test(t);
        })
        .toBe(true);
    await assertScenePngCutsceneChargee(page, 'interlude_elle');
});

test('interlude vide — veille avant la finale', async ({ page }) => {
    test.setTimeout(60000);
    const etat = preparerEtatInterludePremiereCompletion('monde_vide');
    await ouvrirCarteHistoire(page, etat);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_vide');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await expect
        .poll(async () => {
            const t = await page.evaluate(
                () => document.getElementById('ecran-histoire-cutscene')?.textContent ?? ''
            );
            return /Au seuil de la Finale|Deux silhouettes|renvoie-le/i.test(t);
        })
        .toBe(true);
    await assertScenePngCutsceneChargee(page, 'interlude_veille');
});

test('decouverte labo cyber — journal VERA', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_CYBER_LABO_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_cyber', 99);
    });
    await fermerRecapPostMonde(page);

    await expect
        .poll(
            async () => {
                const etat = await page.evaluate(() => {
                    const brut = localStorage.getItem('derniereLigne_histoire');
                    const sauve = brut ? JSON.parse(brut) : {};
                    return {
                        laboDecouvert: sauve.laboDecouvert === true,
                        journal7: sauve.journauxTrouves?.includes('journal_7') === true,
                    };
                });
                if (etat.laboDecouvert && etat.journal7) return true;

                if (await elementAClasse(page, 'ecran-histoire-cutscene', 'actif')) {
                    await page.evaluate(() => {
                        document.getElementById('btn-cutscene-passer')?.click();
                    });
                    return false;
                }

                if (await elementAClasse(page, 'ecran-histoire-journal', 'actif')) {
                    const texteJournal = await page
                        .locator('#histoire-journal-texte')
                        .textContent();
                    expect(texteJournal ?? '').toMatch(/Si tu lis ceci|laboratoire|Trame/i);
                    await page.evaluate(() => {
                        document.getElementById('btn-journal-fermer')?.click();
                    });
                    return false;
                }

                return false;
            },
            { timeout: 30000, intervals: [150, 250, 400] }
        )
        .toBe(true);

    const final = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        return {
            laboDecouvert: sauve.laboDecouvert === true,
            journal7: sauve.journauxTrouves?.includes('journal_7') === true,
        };
    });
    expect(final.laboDecouvert).toBe(true);
    expect(final.journal7).toBe(true);
});

test('victoire monde desert — enchaine vers eclipse', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_DESERT);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_desert', 99);
    });
    await fermerRecapPostMonde(page);
    await passerCutsceneEntiere(page);
    await passerCutsceneEntiere(page);
    await passerFluxLancementMonde(page);
    await expect(page.locator('body')).toHaveClass(/partie-active/);
    await expect(page.locator('body')).toHaveAttribute('data-biome', 'eclipse');
});

test('condition Trame — attente distorsion validee bout en bout (audit D7)', async ({ page }) => {
    test.setTimeout(30000);
    await page.goto('/');
    await attendreApplicationPrete(page);

    const resultat = await page.evaluate(async () => {
        return window.__NEO_TEST__?.simulerTickConditionTrameDistorsion?.();
    });

    expect(resultat?.actionDistorsionFaite).toBe(true);
    expect(resultat?.persistee).toBe(true);
});
