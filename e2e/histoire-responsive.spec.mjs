import { test, expect, devices } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    fermerRecapPostMonde,
    appliquerEncocheSimulee,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

test('cutscene paysage mobile — boutons dans la zone visible', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.addInitScript((etat) => {
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
    }, ETAT_HISTOIRE_VIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-continuer').click();
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 15000 });

    const metriques = await page.evaluate(() => {
        const suivant = document.getElementById('btn-cutscene-suivant');
        const rect = suivant?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            h: rect?.height ?? 0,
            dansEcran: Boolean(rect && rect.bottom <= window.innerHeight && rect.top >= 0),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.h).toBeGreaterThanOrEqual(48);
    expect(metriques.dansEcran).toBe(true);
});

test('cutscene ultra-etroit 319px — pas de debordement', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 319, height: 568 });
    await page.addInitScript((etat) => {
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
    }, ETAT_HISTOIRE_VIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-continuer').click();
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 15000 });

    const metriques = await page.evaluate(() => {
        const suivant = document.getElementById('btn-cutscene-suivant');
        const passer = document.getElementById('btn-cutscene-passer');
        const rectS = suivant?.getBoundingClientRect();
        const rectP = passer?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            suivantH: rectS?.height ?? 0,
            passerH: rectP?.height ?? 0,
            dansEcran: Boolean(
                rectS &&
                rectP &&
                rectS.bottom <= window.innerHeight &&
                rectP.bottom <= window.innerHeight
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.suivantH).toBeGreaterThanOrEqual(48);
    expect(metriques.passerH).toBeGreaterThanOrEqual(48);
    expect(metriques.dansEcran).toBe(true);
});

test('recap post-monde paysage mobile — panneau scrollable', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 844, height: 390 });
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_lave');
    });

    await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });

    const metriques = await page.evaluate(() => {
        const panneau = document.querySelector('#overlay-recap-monde .objectif-panneau');
        const bouton = document.getElementById('btn-recap-continuer');
        const panneauRect = panneau?.getBoundingClientRect();
        const boutonRect = bouton?.getBoundingClientRect();
        const style = panneau ? getComputedStyle(panneau) : null;
        return {
            overflowY: style?.overflowY ?? '',
            panneauDansEcran: Boolean(
                panneauRect && panneauRect.bottom <= window.innerHeight + 2 && panneauRect.top >= -2
            ),
            boutonH: boutonRect?.height ?? 0,
        };
    });
    expect(metriques.panneauDansEcran).toBe(true);
    expect(metriques.overflowY).toBe('auto');
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
    await fermerRecapPostMonde(page);
});

test('carte histoire paysage mobile — header et retour accessibles', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await ouvrirCarteHistoire(page);

    const metriques = await page.evaluate(() => {
        const header = document.getElementById('histoire-map-header');
        const retour = document.getElementById('btn-histoire-retour');
        const headerStyle = header ? getComputedStyle(header) : null;
        const rect = retour?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            paddingTop: headerStyle?.paddingTop ?? '',
            retourH: rect?.height ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.paddingTop).not.toBe('0px');
    expect(metriques.retourH).toBeGreaterThanOrEqual(48);
});

test('iphone — cutscene respecte encoche simulee (audit C11)', async ({ browser }) => {
    test.info().annotations.push({
        type: 'note',
        description:
            'Validation physique sur iPhone reelle non automatisable ; simulation --safe-top: 47px.',
    });

    const context = await browser.newContext({ ...devices['iPhone 14'] });
    const page = await context.newPage();
    await page.addInitScript((etat) => {
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
    }, ETAT_HISTOIRE_VIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await appliquerEncocheSimulee(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-continuer').click();
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });

    const metriques = await page.evaluate(() => {
        const cutscene = document.getElementById('ecran-histoire-cutscene');
        const suivant = document.getElementById('btn-cutscene-suivant');
        const style = cutscene ? getComputedStyle(cutscene) : null;
        const rect = suivant?.getBoundingClientRect();
        return {
            paddingTop: style?.paddingTop ?? '',
            safeTop: getComputedStyle(document.documentElement)
                .getPropertyValue('--safe-top')
                .trim(),
            boutonDansEcran: Boolean(rect && rect.bottom <= window.innerHeight && rect.top >= 46),
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
    });
    expect(metriques.safeTop).toBe('47px');
    expect(metriques.paddingTop).toMatch(/47px|calc/);
    expect(metriques.boutonDansEcran).toBe(true);
    expect(metriques.debord).toBe(false);

    await context.close();
});
