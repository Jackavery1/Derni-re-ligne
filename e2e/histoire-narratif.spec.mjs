import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    passerCutsceneEntiere,
    passerFluxLancementMonde,
    terminerCutscenesVersEcranFin,
    lireTexteCutsceneActive,
    attendreApplicationPrete,
    preparerPremierLancement,
    attendreTypewriterInactif,
    elementAClasse,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_FIN_SECRETE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_AVANT_FIN_VRAIE,
    ETAT_FIN_VRAIE_PRET,
    ETAT_OCEAN_FRAGMENT_PRET,
    ETAT_CYBER_LABO_PRET,
    ETAT_AVANT_DESERT,
} from './helpers.mjs';

test('post-monde monde lave — fond scene seuil_brasier', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_lave');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
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
        { mondeId: 'monde_ocean', etat: ETAT_OCEAN_FRAGMENT_PRET },
        { mondeId: 'monde_cyber', etat: ETAT_CYBER_LABO_PRET },
    ];

    for (const { mondeId, etat } of cas) {
        await ouvrirCarteHistoire(page, etat);
        await page.evaluate(async (id) => {
            await window.__NEO_TEST__?.declencherPostMondeNarratif?.(id);
        }, mondeId);
        await fermerRecapPostMonde(page);
        await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
            timeout: 15000,
        });
        const musique = await page.evaluate(() => window.__NEO_TEST__?.obtenirMusiqueActive?.());
        expect(musique).toBe('narratif_cutscene');
        await passerCutsceneEntiere(page);
    }
});

test('fragment VERA ocean — signal parasite visible', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_OCEAN_FRAGMENT_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_ocean');
    });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await page.waitForFunction(
        () => {
            const t =
                document.getElementById('texte-dialogue-cutscene')?.textContent ??
                document.getElementById('texte-narration-cutscene')?.textContent ??
                '';
            return /SIGNAL PARASITE/i.test(t);
        },
        null,
        { timeout: 15000 }
    );
});

test('interlude rouille — gardiens detectes', async ({ page }) => {
    test.setTimeout(60000);
    const etat = {
        ...ETAT_HISTOIRE_BOSS_BRASIER,
        fragmentsVusIds: ['apres_rouille'],
        interludesVusIds: [],
    };
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
    await page.waitForFunction(
        () => {
            const t =
                document.getElementById('texte-dialogue-cutscene')?.textContent ??
                document.getElementById('texte-narration-cutscene')?.textContent ??
                '';
            return /GARDIEN/i.test(t);
        },
        null,
        { timeout: 15000 }
    );
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

test('fin secrete — victoire finale detecte fin_secrete', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_finale', 99);
    });
    await fermerRecapPostMonde(page);

    const typeFin = await page.evaluate(async () => {
        return window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
    });
    expect(typeFin).toBe('fin_secrete');

    const mondesCompletes = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        if (!brut) return [];
        return JSON.parse(brut).mondesCompletes ?? [];
    });
    expect(mondesCompletes).toContain('monde_finale');
    expect(mondesCompletes).toContain('monde_trame');

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });
});

test('fin secrete — outro et ecran de fin', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_FIN_SECRETE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_secrete');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/LIGNE PARFAITE/i);
});

test('fin vraie — victoire finale detecte fin_vraie', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_VRAIE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_finale', 99);
    });
    await fermerRecapPostMonde(page);

    const typeFin = await page.evaluate(async () => {
        return window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
    });
    expect(typeFin).toBe('fin_vraie');
    expect(ETAT_AVANT_FIN_VRAIE.conditionsTrame.actionDistorsionFaite).toBe(false);
});

test('fin vraie — outro harmonie et ecran de fin', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_FIN_VRAIE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_vraie');
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_vraie');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/HARMONIE/i);
});

test('apres fin secrete — debloque paradoxe organiquement sans reinjection etat', async ({
    page,
}) => {
    test.setTimeout(120000);
    await ouvrirCarteHistoire(page, ETAT_FIN_SECRETE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_secrete');

    await page.locator('#btn-fin-rejouer').click({ force: true });
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 10000 });

    for (let i = 0; i < 3; i++) {
        await page.evaluate(async () => {
            await window.__NEO_TEST__?.simulerTopVolontairePrologue?.();
        });
    }

    const debloque = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        return {
            tops: sauve.conditionsParadoxe?.topsVolontairesPrologue ?? 0,
            caches: sauve.mondesCachesDebloques ?? [],
        };
    });
    expect(debloque.tops).toBeGreaterThanOrEqual(3);
    expect(debloque.caches).toContain('monde_paradoxe');

    await page.locator('#btn-histoire-retour').click({ force: true });
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/, { timeout: 10000 });
    await page.locator('#btn-continuer').click();
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 15000 });

    await page.locator('#histoire-monde-clavier').selectOption('monde_paradoxe', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
});

test('intro — changement de scene entre lignes d une cutscene', async ({ page }) => {
    test.setTimeout(60000);
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-nouvelle-partie').click();
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });

    const sceneObservatoire = await page.evaluate(
        () => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null
    );
    expect(sceneObservatoire).toBe('observatoire');

    for (let i = 0; i < 6; i++) {
        const t = await lireTexteCutsceneActive(page);
        if (/Trame/i.test(t)) break;
        await page.locator('#btn-cutscene-suivant').click({ force: true });
        await attendreTypewriterInactif(page, 2000);
    }

    await expect
        .poll(() =>
            page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null)
        )
        .toBe('trame');

    for (let i = 0; i < 6; i++) {
        const t = await lireTexteCutsceneActive(page);
        if (/JOURNAL DE BORD/i.test(t)) break;
        await page.locator('#btn-cutscene-suivant').click({ force: true });
        await attendreTypewriterInactif(page, 2000);
    }

    await expect
        .poll(() =>
            page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null)
        )
        .toBe('observatoire');

    for (let i = 0; i < 8; i++) {
        const t = await lireTexteCutsceneActive(page);
        if (/Jour 2 191/i.test(t)) break;
        await page.locator('#btn-cutscene-suivant').click({ force: true });
        await attendreTypewriterInactif(page, 2000);
    }

    await expect
        .poll(() =>
            page.evaluate(() => window.__NEO_TEST__?.obtenirSceneCutsceneActive?.() ?? null)
        )
        .toBe('fragmentation');
});

test('trame organique — typeFin fin_secrete sans API inject', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_SECRETE);
    const typeFin = await page.evaluate(async () => {
        return window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
    });
    expect(typeFin).toBe('fin_secrete');
    expect(ETAT_AVANT_FIN_SECRETE.conditionsTrame.actionDistorsionFaite).toBe(true);
});
