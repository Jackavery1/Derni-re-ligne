import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    terminerCutscenesVersEcranFin,
    attendreApplicationPrete,
    preparerPremierLancement,
    ETAT_FIN_SECRETE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_AVANT_FIN_VRAIE,
    ETAT_AVANT_FIN_NORMALE,
    ETAT_FIN_NORMALE_PRET,
    ETAT_FIN_VRAIE_PRET,
    avancerCutsceneJusquaPivot,
    attendreSceneCutsceneActive,
} from './helpers.mjs';

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
        timeout: 10000,
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

test('fin normale — victoire finale detecte fin_normale', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_finale', 99);
    });
    await fermerRecapPostMonde(page);

    const typeFin = await page.evaluate(async () => {
        return window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
    });
    expect(typeFin).toBe('fin_normale');
    expect(ETAT_AVANT_FIN_NORMALE.conditionsTrame.miroirComplete).toBe(false);

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
});

test('fin normale — outro et ecran de fin', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirCarteHistoire(page, ETAT_FIN_NORMALE_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherFinHistoire?.('fin_normale');
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_normale');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/LE CYCLE/i);
    await expect(page.locator('#histoire-fin-hint')).toContainText(/D'autres fins existent/i);
});

test('fin normale — parcours victoire jusqu a outro et ecran de fin (audit D7)', async ({
    page,
}) => {
    test.setTimeout(180000);
    await ouvrirCarteHistoire(page, ETAT_AVANT_FIN_NORMALE);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_finale', 99);
    });
    await fermerRecapPostMonde(page);

    const typeFin = await page.evaluate(async () => {
        return window.__NEO_TEST__?.obtenirTypeFinHistoire?.();
    });
    expect(typeFin).toBe('fin_normale');

    await terminerCutscenesVersEcranFin(page);
    await expect(page.locator('#ecran-histoire-fin')).toHaveAttribute('data-fin', 'fin_normale');
    await expect(page.locator('#histoire-fin-titre')).toContainText(/LE CYCLE/i);

    const apresOutro = await page.evaluate(() => {
        const brut = localStorage.getItem('derniereLigne_histoire');
        const sauve = brut ? JSON.parse(brut) : {};
        return {
            finObtenue: sauve.finObtenue,
            toutesFin: sauve.toutesFinObtenues ?? [],
        };
    });
    expect(apresOutro.finObtenue).toBe('fin_normale');
    expect(apresOutro.toutesFin).toContain('fin_normale');
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
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 10000 });

    await page.locator('#histoire-monde-clavier').selectOption('monde_paradoxe', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
});

test('intro — changement de scene entre lignes d une cutscene', async ({ page }) => {
    test.setTimeout(120000);
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-nouvelle-partie').click();
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });

    await attendreSceneCutsceneActive(page, 'observatoire');
    await avancerCutsceneJusquaPivot(page, /il y a la Trame/i, 'trame');
    await attendreSceneCutsceneActive(page, 'trame');
    await avancerCutsceneJusquaPivot(page, /JOURNAL DE BORD/i);
    await attendreSceneCutsceneActive(page, 'observatoire');
    await avancerCutsceneJusquaPivot(page, /Jour 2 191/i, 'fragmentation');
    await attendreSceneCutsceneActive(page, 'fragmentation');
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
