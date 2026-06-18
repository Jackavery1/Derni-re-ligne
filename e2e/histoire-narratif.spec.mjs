import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    passerCutsceneEntiere,
    passerFluxLancementMonde,
    terminerCutscenesVersEcranFin,
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

    for (let tentative = 0; tentative < 24; tentative++) {
        const etat = await page.evaluate(() => {
            const brut = localStorage.getItem('derniereLigne_histoire');
            const sauve = brut ? JSON.parse(brut) : {};
            return {
                laboDecouvert: sauve.laboDecouvert === true,
                journal7: sauve.journauxTrouves?.includes('journal_7') === true,
            };
        });
        if (etat.laboDecouvert && etat.journal7) break;

        const cutsceneActive = await page
            .locator('#ecran-histoire-cutscene')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (cutsceneActive) {
            await page.evaluate(() => {
                document.getElementById('btn-cutscene-passer')?.click();
            });
            continue;
        }

        const journalActif = await page
            .locator('#ecran-histoire-journal')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (journalActif) {
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }

        await page.waitForTimeout(250);
    }

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

test('apres fin secrete — monde paradoxe jouable avec cutscene entree', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_FIN_SECRETE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_secrete');
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_secrete');

    const apresFin = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        return sauve.toutesFinObtenues ?? [];
    });
    expect(apresFin).toContain('fin_secrete');

    await ouvrirCarteHistoire(page, {
        ...ETAT_FIN_SECRETE_PRET,
        mondesCachesDebloques: [...ETAT_FIN_SECRETE_PRET.mondesCachesDebloques, 'monde_paradoxe'],
        mondesDejaMontres: [...ETAT_FIN_SECRETE_PRET.mondesDejaMontres, 'monde_paradoxe'],
        conditionsParadoxe: { finSecreteObtenue: true, topsVolontairesPrologue: 3 },
        finObtenue: 'fin_secrete',
        toutesFinObtenues: ['fin_secrete'],
    });
    await page.locator('#histoire-monde-clavier').selectOption('monde_paradoxe', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
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
