import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    fermerRecapPostMonde,
    appliquerSafeAreaIphone,
    creerPageIphone14,
    passerCutsceneEntiere,
    attendreJournalHistoire,
    lancerMondeDepuisCarte,
    lancerMondeBossBrasier,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_CYBER_LABO_PRET,
} from './helpers.mjs';
import { preparerEtatPremiereEntree } from './etats-histoire-entrees.mjs';
import { mesurerBossPortraitHud, assertBossPortraitDansEcran } from './helpers-narratif-mobile.mjs';
import { assertFocusPiegeOverlay } from './helpers-responsive-metriques.mjs';

test('journal mobile ultra-etroit 319px — contenu scrollable (audit D8)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 319, height: 568 });
    await ouvrirCarteHistoire(page, ETAT_CYBER_LABO_PRET);
    await appliquerSafeAreaIphone(page);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_cyber', 99);
    });
    await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await attendreJournalHistoire(page);

    const metriques = await page.evaluate(() => {
        const contenu = document.getElementById('histoire-journal-contenu');
        const texteWrap = document.getElementById('histoire-journal-texte');
        const fermer = document.getElementById('btn-journal-fermer');
        const styleTexte = texteWrap ? getComputedStyle(texteWrap) : null;
        const para = document.querySelector('.histoire-journal-para');
        const paraStyle = para ? getComputedStyle(para) : null;
        const rectFermer = fermer?.getBoundingClientRect();
        const rectContenu = contenu?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowY: styleTexte?.overflowY ?? '',
            paraFontSize: parseFloat(paraStyle?.fontSize ?? '0') || 0,
            fermerH: rectFermer?.height ?? 0,
            dansEcran: Boolean(
                rectContenu &&
                rectContenu.bottom <= window.innerHeight + 2 &&
                rectFermer &&
                rectFermer.bottom <= window.innerHeight + 2 &&
                rectFermer.top >= 0
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.overflowY).toBe('auto');
    expect(metriques.paraFontSize).toBeGreaterThanOrEqual(12);
    expect(metriques.fermerH).toBeGreaterThanOrEqual(48);
    expect(metriques.dansEcran).toBe(true);
});

test('carte histoire 319px — overlay objectifs pre-partie lisible (audit D8)', async ({ page }) => {
    await page.setViewportSize({ width: 319, height: 568 });
    const etatLavePanneau = {
        ...preparerEtatPremiereEntree('monde_lave'),
        mondesDejaMontres: ['monde_prologue', 'monde_lave'],
    };
    await ouvrirCarteHistoire(page, etatLavePanneau);
    await lancerMondeDepuisCarte(page, 'monde_lave');
    await expect(page.locator('#overlay-objectifs-pre')).toHaveClass(/objectif-overlay-visible/, {
        timeout: 15000,
    });

    const metriques = await page.evaluate(() => {
        const panneau = document.querySelector('#overlay-objectifs-pre .objectif-panneau');
        const commencer = document.getElementById('btn-objectifs-commencer');
        const stylePanneau = panneau ? getComputedStyle(panneau) : null;
        const styleBtn = commencer ? getComputedStyle(commencer) : null;
        const rectBtn = commencer?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowY: stylePanneau?.overflowY ?? '',
            btnH: rectBtn?.height ?? 0,
            btnMinH: parseFloat(styleBtn?.minHeight ?? '0') || 0,
            titre: document.getElementById('objectif-monde-nom')?.textContent?.trim() ?? '',
        };
    });

    expect(metriques.debord).toBe(false);
    expect(metriques.overflowY).toBe('auto');
    expect(metriques.btnH).toBeGreaterThanOrEqual(48);
    expect(metriques.btnMinH).toBeGreaterThanOrEqual(48);
    expect(metriques.titre.length).toBeGreaterThan(3);

    await assertFocusPiegeOverlay(page, {
        overlayId: 'overlay-objectifs-pre',
        boutonId: 'btn-objectifs-commencer',
    });
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

    await assertFocusPiegeOverlay(page, {
        overlayId: 'overlay-recap-monde',
        boutonId: 'btn-recap-continuer',
    });

    await page.keyboard.press('Escape');
    await expect(page.locator('#overlay-recap-monde')).not.toBeVisible({ timeout: 5000 });
});

test('boss HUD 480px — portrait visible sans debordement (audit D8)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 480, height: 800 });
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    await expect(page.locator('#canvas-boss-portrait')).toBeVisible();
    await expect(page.locator('#boss-nom-affiche')).toContainText('BRASIER');

    assertBossPortraitDansEcran(await mesurerBossPortraitHud(page));
});

test('recap post-monde portrait 319px — panneau scrollable (audit D8)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 319, height: 568 });
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
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowY: style?.overflowY ?? '',
            panneauDansEcran: Boolean(
                panneauRect && panneauRect.bottom <= window.innerHeight + 2 && panneauRect.top >= -2
            ),
            boutonH: boutonRect?.height ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.panneauDansEcran).toBe(true);
    expect(metriques.overflowY).toBe('auto');
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
    await fermerRecapPostMonde(page);
});

test('iphone — recap post-victoire respecte encoche simulee (audit D8/D11)', async ({
    browser,
}) => {
    test.setTimeout(60000);
    const { context, page } = await creerPageIphone14(browser);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await appliquerSafeAreaIphone(page);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.declencherPostMondeNarratif?.('monde_lave');
    });

    await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });

    const metriques = await page.evaluate(() => {
        const panneau = document.querySelector('#overlay-recap-monde .objectif-panneau');
        const bouton = document.getElementById('btn-recap-continuer');
        const panneauRect = panneau?.getBoundingClientRect();
        const boutonRect = bouton?.getBoundingClientRect();
        return {
            safeTop: getComputedStyle(document.documentElement)
                .getPropertyValue('--safe-top')
                .trim(),
            panneauDansEcran: Boolean(
                panneauRect && panneauRect.bottom <= window.innerHeight + 2 && panneauRect.top >= 46
            ),
            boutonH: boutonRect?.height ?? 0,
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
    });
    expect(metriques.safeTop).toBe('47px');
    expect(metriques.debord).toBe(false);
    expect(metriques.panneauDansEcran).toBe(true);
    expect(metriques.boutonH).toBeGreaterThanOrEqual(48);
    await context.close();
});

test('journal mobile paysage — contenu scrollable (audit D8)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 844, height: 390 });
    await ouvrirCarteHistoire(page, ETAT_CYBER_LABO_PRET);
    await page.evaluate(async () => {
        await window.__NEO_TEST__?.simulerVictoireMondeHistoire?.('monde_cyber', 99);
    });
    await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });
    await fermerRecapPostMonde(page);
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await passerCutsceneEntiere(page);
    await attendreJournalHistoire(page);

    const metriques = await page.evaluate(() => {
        const contenu = document.getElementById('histoire-journal-contenu');
        const texteWrap = document.getElementById('histoire-journal-texte');
        const fermer = document.getElementById('btn-journal-fermer');
        const illust = document.getElementById('canvas-journal-illust');
        const styleTexte = texteWrap ? getComputedStyle(texteWrap) : null;
        const styleFermer = fermer ? getComputedStyle(fermer) : null;
        const para = document.querySelector('.histoire-journal-para');
        const paraStyle = para ? getComputedStyle(para) : null;
        const rectFermer = fermer?.getBoundingClientRect();
        const rectIllust = illust?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowY: styleTexte?.overflowY ?? '',
            dansEcran: Boolean(
                contenu &&
                contenu.getBoundingClientRect().bottom <= window.innerHeight + 2 &&
                contenu.getBoundingClientRect().top >= -2
            ),
            fermerH: rectFermer?.height ?? 0,
            fermerMinH: parseFloat(styleFermer?.minHeight ?? '0') || 0,
            illustVisible: Boolean(rectIllust && rectIllust.width > 0),
            texte: document.getElementById('histoire-journal-texte')?.textContent ?? '',
            paraFontSize: parseFloat(paraStyle?.fontSize ?? '0') || 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.overflowY).toBe('auto');
    expect(metriques.dansEcran).toBe(true);
    expect(metriques.fermerMinH).toBeGreaterThanOrEqual(48);
    expect(metriques.fermerH).toBeGreaterThanOrEqual(48);
    expect(metriques.illustVisible).toBe(true);
    expect(metriques.paraFontSize).toBeGreaterThanOrEqual(12);
    expect(metriques.texte).toMatch(/Si tu lis ceci|laboratoire|Trame/i);
});

test('carte histoire paysage mobile — header et retour accessibles', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await ouvrirCarteHistoire(page);

    const metriques = await page.evaluate(() => {
        const header = document.getElementById('histoire-map-header');
        const retour = document.getElementById('btn-histoire-retour');
        const trame = document.getElementById('btn-histoire-trame');
        const headerStyle = header ? getComputedStyle(header) : null;
        const rect = retour?.getBoundingClientRect();
        const rectTrame = trame?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            paddingTop: headerStyle?.paddingTop ?? '',
            retourH: rect?.height ?? 0,
            trameH: rectTrame?.height ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.paddingTop).not.toBe('0px');
    expect(metriques.retourH).toBeGreaterThanOrEqual(48);
    if (metriques.trameH > 0) {
        expect(metriques.trameH).toBeGreaterThanOrEqual(48);
    }
});
