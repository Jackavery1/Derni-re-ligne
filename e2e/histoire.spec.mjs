import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
    ouvrirCarteHistoire,
    lancerMondeBossBrasier,
    filtrerViolationsCritiques,
    attendreApplicationPrete,
    passerFluxLancementMonde,
    attendrePartieVisible,
    attendreNotificationsInitiales,
    preparerPremierLancement,
    passerCutsceneHistoire,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

/** État avec le monde Miroir débloqué (3 Tetris CYBER + Archiviste vaincu). */
const ETAT_MIROIR_DEBLOQUE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCachesDebloques: ['monde_miroir'],
    mondesDejaMontres: ['monde_boss_1', 'monde_miroir'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
};

/** État avec le monde Trame débloqué (4 conditions conjonctives réunies). */
const ETAT_TRAME_DEBLOQUE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCachesDebloques: ['monde_miroir', 'monde_trame'],
    mondesDejaMontres: ['monde_boss_1', 'monde_trame'],
    conditionsMiroir: { bossArchivisteVaincu: true, tetrisTriplesCyber: 3 },
    conditionsTrame: {
        miroirComplete: true,
        tousJournauxTrouves: true,
        tousBossSansContinue: true,
        actionDistorsionFaite: true,
    },
};

/** État avec le monde Paradoxe débloqué (fin secrète + 3 tops volontaires prologue). */
const ETAT_PARADOXE_DEBLOQUE = {
    ...ETAT_HISTOIRE_BOSS_BRASIER,
    mondesCachesDebloques: ['monde_paradoxe'],
    mondesDejaMontres: ['monde_boss_1', 'monde_paradoxe'],
    conditionsParadoxe: { finSecreteObtenue: true, topsVolontairesPrologue: 3 },
};

test('intro Jour 2 554 — première visite depuis Nouvelle partie', async ({ page }) => {
    test.setTimeout(60000);
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);

    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
    await page.locator('#btn-nouvelle-partie').click();

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/cutscene-mode-narration/);
    await expect(page.locator('#texte-narration-cutscene')).toContainText(/invent.*jeu/i);

    await passerCutsceneHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();

    const introVue = await page.evaluate(() =>
        localStorage.getItem('derniereLigne_introHistoireVue')
    );
    expect(introVue).toBe('1');
});

test('nouvelle partie après progression — reset et rejoue l intro', async ({ page }) => {
    test.setTimeout(60000);
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript(() => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem(
            'derniereLigne_histoire',
            JSON.stringify({
                chapitreActuel: 'prologue',
                mondesCompletes: ['monde_prologue'],
                bossVaincus: [],
                journauxTrouves: [],
                mondesCachesDebloques: [],
                conditionsMiroir: { bossArchivisteVaincu: false, tetrisTriplesCyber: 0 },
                conditionsTrame: {
                    miroirComplete: false,
                    tousJournauxTrouves: false,
                    tousBossSansContinue: true,
                    actionDistorsionFaite: false,
                },
                conditionsParadoxe: { finSecreteObtenue: false, topsVolontairesPrologue: 0 },
                finObtenue: null,
                toutesFinObtenues: [],
                nbContinuesUtilises: 0,
                enModeHistoire: false,
                mondesDejaMontres: [],
                laboDecouvert: false,
                prouessesHistoire: {
                    blocksRouillesMax: 0,
                    lignesEclipseBasseMax: 0,
                    lignesVideMax: 0,
                    precisionMiroirMax: 0,
                    meilleurTimerBossMs: Infinity,
                },
            })
        );
    });
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);

    await expect(page.locator('#btn-continuer')).toBeVisible();
    await page.locator('#btn-nouvelle-partie').click();
    await expect(page.locator('#dialog-nouvelle-partie')).not.toHaveClass(/element-masque/);
    await page.locator('#btn-confirm-nouvelle-partie').click();

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 15000,
    });
    await expect(page.locator('#texte-narration-cutscene')).toContainText(/invent.*jeu/i);

    await passerCutsceneHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();

    const etat = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('derniereLigne_histoire') ?? '{}')
    );
    expect(etat.mondesCompletes ?? []).toEqual([]);
});

test('carte histoire accessible depuis le menu', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
    await expect(page.locator('#histoire-prog-mondes')).toContainText('MONDES');
});

test('carte histoire sans violations accessibilité critiques', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await page.waitForTimeout(400);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-map').analyze();
    expect(filtrerViolationsCritiques(result.violations)).toEqual([]);
});

test('lancement boss affiche le HUD boss', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await lancerMondeBossBrasier(page);

    await expect(page.locator('#boss-nom-affiche')).toContainText('BRASIER');
    await expect(page.locator('#boss-hp-label')).toHaveText('14 / 14');
    await expect(page.locator('#canvas-boss-portrait')).toBeVisible();
});

test('sélection clavier d un monde sur la carte histoire', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await expect(page.locator('.bouton-jouer-monde')).not.toHaveClass(/element-masque/);
});

test('carte histoire respecte le contraste des couleurs', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    await page.waitForTimeout(400);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-map').analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('lancement prologue depuis la carte histoire', async ({ page }) => {
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
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/);
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await passerFluxLancementMonde(page);
    await attendrePartieVisible(page);
});

test('panneau objectifs prologue mobile sans debordement horizontal', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 390, height: 844 });
    const etatProloguePanneau = {
        ...ETAT_HISTOIRE_VIDE,
        mondesDejaMontres: ['monde_prologue'],
    };
    await ouvrirCarteHistoire(page, etatProloguePanneau);
    await page.locator('#histoire-monde-clavier').selectOption('monde_prologue', { force: true });
    await expect(page.locator('.bouton-jouer-monde')).not.toHaveClass(/element-masque/, {
        timeout: 5000,
    });
    await page.locator('.bouton-jouer-monde').click({ force: true });

    const btnCommencer = page.locator('#btn-objectifs-commencer');
    await expect(btnCommencer).toBeVisible({ timeout: 15000 });

    const metriques = await page.evaluate(() => {
        const doc = document.documentElement;
        const btn = document.getElementById('btn-objectifs-commencer');
        const rect = btn?.getBoundingClientRect();
        return {
            debord: doc.scrollWidth > doc.clientWidth + 1,
            btnH: rect?.height ?? 0,
            btnW: rect?.width ?? 0,
        };
    });

    expect(metriques.debord).toBe(false);
    expect(metriques.btnH).toBeGreaterThanOrEqual(48);
    expect(metriques.btnW).toBeGreaterThan(0);

    await btnCommencer.click({ force: true, noWaitAfter: true });
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 10000 });
    await expect(page.locator('#overlay-objectifs-pre')).not.toHaveClass(
        /objectif-overlay-visible/
    );
});

test('carte histoire utilisable sur viewport mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ouvrirCarteHistoire(page);
    await expect(page.locator('#histoire-monde-clavier')).toBeVisible();
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();

    const metriques = await page.evaluate(() => {
        const doc = document.documentElement;
        const retour = document.getElementById('btn-histoire-retour');
        const rect = retour?.getBoundingClientRect();
        return {
            debord: doc.scrollWidth > doc.clientWidth + 1,
            retourH: rect?.height ?? 0,
            retourW: rect?.width ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.retourH).toBeGreaterThanOrEqual(48);
    expect(metriques.retourW).toBeGreaterThanOrEqual(48);
});

test('cutscene mobile — boutons tactiles et pas de débordement', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 390, height: 844 });
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

    const cutscene = page.locator('#ecran-histoire-cutscene');
    await expect(cutscene).toHaveClass(/actif/, { timeout: 15000 });

    const metriques = await page.evaluate(() => {
        const doc = document.documentElement;
        const suivant = document.getElementById('btn-cutscene-suivant');
        const passer = document.getElementById('btn-cutscene-passer');
        const rs = suivant?.getBoundingClientRect();
        const rp = passer?.getBoundingClientRect();
        return {
            debord: doc.scrollWidth > doc.clientWidth + 1,
            suivantH: rs?.height ?? 0,
            passerH: rp?.height ?? 0,
        };
    });
    expect(metriques.debord).toBe(false);
    expect(metriques.suivantH).toBeGreaterThanOrEqual(48);
    expect(metriques.passerH).toBeGreaterThanOrEqual(48);

    const portraitDessine = await page.evaluate(() => {
        const canvas = document.getElementById('canvas-portrait-gauche');
        if (!(canvas instanceof HTMLCanvasElement)) return false;
        if (canvas.classList.contains('absent')) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) return true;
        }
        return false;
    });
    expect(portraitDessine).toBe(true);

    const portraitsStables = await page.evaluate(() => {
        const gauche = document.getElementById('canvas-portrait-gauche');
        const droite = document.getElementById('canvas-portrait-droite');
        const rects = [gauche, droite]
            .filter((c) => c instanceof HTMLCanvasElement && !c.classList.contains('absent'))
            .map((c) => c.getBoundingClientRect());
        return rects.every((r) => r.width >= 48 && r.height >= 48 && r.top >= 0 && r.left >= 0);
    });
    expect(portraitsStables).toBe(true);
});

test('scroll molette sur la carte histoire ne provoque pas d erreur', async ({ page }) => {
    await ouvrirCarteHistoire(page);
    const canvas = page.locator('#canvas-histoire-map');
    await canvas.hover();
    await page.mouse.wheel(0, 400);
    await page.mouse.wheel(0, -200);
    await expect(canvas).toBeVisible();
    await expect(page.locator('#histoire-prog-mondes')).toContainText('MONDES');
});

test('monde caché Miroir jouable une fois débloqué', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_MIROIR_DEBLOQUE);
    await page.locator('#histoire-monde-clavier').selectOption('monde_miroir', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await passerFluxLancementMonde(page);
    await expect(page.locator('#interface-jeu [data-label="score"]')).toHaveText('REFLET');
});

test('monde caché Trame jouable une fois débloqué', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_TRAME_DEBLOQUE);
    await page.locator('#histoire-monde-clavier').selectOption('monde_trame', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await passerFluxLancementMonde(page);
    await expect(page.locator('#interface-jeu [data-label="score"]')).toHaveText('RÉSONANCE');
});

test('monde caché Paradoxe affiche sa cutscene puis revient à la carte', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_PARADOXE_DEBLOQUE);
    await page.locator('#histoire-monde-clavier').selectOption('monde_paradoxe', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
    });
    for (let i = 0; i < 4; i++) {
        if (
            await page
                .locator('#ecran-histoire-map')
                .evaluate((el) => el.classList.contains('actif'))
        ) {
            break;
        }
        const passer = page.locator('#btn-cutscene-passer');
        if (await passer.isVisible().catch(() => false)) {
            await passer.click({ force: true });
        } else {
            await page.waitForTimeout(200);
        }
    }
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 10000 });
});

test('cutscene narration active le mode voix off', async ({ page }) => {
    const etatPremiereVisiteBoss = {
        ...ETAT_HISTOIRE_BOSS_BRASIER,
        mondesDejaMontres: [],
    };
    await ouvrirCarteHistoire(page, etatPremiereVisiteBoss);
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, { timeout: 10000 });
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/cutscene-mode-narration/);
    await expect(page.locator('#texte-narration-cutscene')).toBeVisible();
});

test('mondes cachés non débloqués absents de la sélection clavier', async ({ page }) => {
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_BOSS_BRASIER);
    await expect(
        page.locator('#histoire-monde-clavier option[value="monde_prologue"]')
    ).toBeAttached({
        timeout: 10000,
    });
    const options = await page.locator('#histoire-monde-clavier option').allInnerTexts();
    const valeurs = await page
        .locator('#histoire-monde-clavier option')
        .evaluateAll((opts) => opts.map((o) => o.value));
    expect(valeurs).not.toContain('monde_miroir');
    expect(valeurs).not.toContain('monde_trame');
    expect(valeurs).not.toContain('monde_paradoxe');
    expect(options.length).toBeGreaterThan(0);
});
