import { test, expect } from '@playwright/test';
import {
    ouvrirCarteHistoire,
    attendreApplicationPrete,
    attendreNotificationsInitiales,
    fermerRecapPostMonde,
    appliquerSafeAreaIphone,
    ANNOTATION_C11,
    creerPageIphone14,
    passerCutsceneEntiere,
    attendreJournalHistoire,
    lancerMondeDepuisCarte,
    avancerCutsceneJusquaPivot,
    assertHumeurPortraitCutscene,
    lancerMondeBossBrasier,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_CYBER_LABO_PRET,
    ETAT_INFERNO_PRET,
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

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });

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

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });

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

test('cutscene ultra-etroit 319px — portraits visibles sans debordement (audit D8)', async ({
    page,
}) => {
    test.setTimeout(60000);
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
    await lancerMondeDepuisCarte(page, 'monde_prologue');
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    await avancerCutsceneJusquaPivot(page, /Robo, tu m'entends/i);
    await assertHumeurPortraitCutscene(page, 'vera', 'douce');

    const metriques = await page.evaluate(() => {
        const gauche = document.getElementById('canvas-portrait-gauche');
        const droite = document.getElementById('canvas-portrait-droite');
        const dialogue = document.getElementById('texte-dialogue-cutscene');
        const rectG = gauche?.getBoundingClientRect();
        const rectD = droite?.getBoundingClientRect();
        const styleDialogue = dialogue ? getComputedStyle(dialogue) : null;
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            portraitGaucheVisible: Boolean(
                gauche && !gauche.classList.contains('absent') && (rectG?.width ?? 0) > 0
            ),
            portraitDroiteVisible: Boolean(
                droite && !droite.classList.contains('absent') && (rectD?.width ?? 0) > 0
            ),
            dialogueFontSize: parseFloat(styleDialogue?.fontSize ?? '0') || 0,
            dansEcran: Boolean(
                rectG &&
                rectD &&
                rectG.right <= window.innerWidth + 2 &&
                rectD.left >= -2 &&
                rectG.bottom <= window.innerHeight + 2
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.portraitGaucheVisible || metriques.portraitDroiteVisible).toBe(true);
    expect(metriques.dialogueFontSize).toBeGreaterThanOrEqual(12);
    expect(metriques.dansEcran).toBe(true);
});

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
    await ouvrirCarteHistoire(page, ETAT_INFERNO_PRET);
    await page.locator('#histoire-monde-clavier').selectOption('monde_lave', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });

    await expect(page.locator('#overlay-objectifs-pre')).toHaveClass(/objectif-overlay-visible/, {
        timeout: 10000,
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

test('boss HUD 480px — portrait visible sans debordement (audit D8)', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 480, height: 800 });
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    await expect(page.locator('#canvas-boss-portrait')).toBeVisible();
    await expect(page.locator('#boss-nom-affiche')).toContainText('BRASIER');

    const metriques = await page.evaluate(() => {
        const portrait = document.getElementById('canvas-boss-portrait');
        const nom = document.getElementById('boss-nom-affiche');
        const rectP = portrait?.getBoundingClientRect();
        const rectN = nom?.getBoundingClientRect();
        return {
            debord: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            portraitW: rectP?.width ?? 0,
            portraitH: rectP?.height ?? 0,
            dansEcran: Boolean(
                rectP &&
                rectN &&
                rectP.left >= -2 &&
                rectP.right <= window.innerWidth + 2 &&
                rectN.bottom <= window.innerHeight + 2
            ),
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.portraitW).toBeGreaterThan(0);
    expect(metriques.portraitH).toBeGreaterThan(0);
    expect(metriques.dansEcran).toBe(true);
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

test('iphone — cutscene respecte encoche simulee (audit C11)', async ({ browser }) => {
    test.info().annotations.push(ANNOTATION_C11);

    const { context, page } = await creerPageIphone14(browser);
    await page.addInitScript((etat) => {
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
    }, ETAT_HISTOIRE_VIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await appliquerSafeAreaIphone(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-continuer').click();
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
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
