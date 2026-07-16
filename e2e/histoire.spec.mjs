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
    attendreRenduCarteHistoire,
    lancerMondeDepuisCarte,
} from './helpers.mjs';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';

test('intro Jour 2 554 — première visite depuis Nouvelle partie', async ({ page }) => {
    test.setTimeout(60000);
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);

    await expect(page.locator('#btn-nouvelle-partie')).toBeVisible();
    await page.locator('#btn-nouvelle-partie').click();

    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 10000,
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
        timeout: 10000,
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
    await attendreRenduCarteHistoire(page);
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
    await attendreRenduCarteHistoire(page);
    const result = await new AxeBuilder({ page }).include('#ecran-histoire-map').analyze();
    expect(filtrerViolationsCritiques(result.violations, { inclureContraste: true })).toEqual([]);
});

test('lancement prologue depuis la carte histoire', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrirCarteHistoire(page, ETAT_HISTOIRE_VIDE);
    await lancerMondeDepuisCarte(page, 'monde_prologue');
    await passerFluxLancementMonde(page);
    await attendrePartieVisible(page);
});
