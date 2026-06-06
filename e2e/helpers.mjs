import { expect } from '@playwright/test';

/** Filtre les violations Axe bloquantes (hors contraste optionnel). */
export function filtrerViolationsCritiques(violations, { inclureContraste = false } = {}) {
    return violations.filter((v) => {
        if (v.impact === 'critical') return true;
        if (v.impact === 'serious' && v.id !== 'color-contrast') return true;
        if (inclureContraste && v.id === 'color-contrast') return true;
        return false;
    });
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartie(page) {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    const canvas = page.locator('#canvas-constellation');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    await canvas.click({
        position: { x: box.width * 0.5, y: box.height * 0.5 },
    });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu')).toBeVisible();
    await expect(page.locator('#canvas-plateau')).toBeVisible();
}

/** État histoire minimal pour jouer le boss Brasier (monde_boss_1). */
export const ETAT_HISTOIRE_BOSS_BRASIER = {
    chapitreActuel: 'chapitre_1',
    mondesCompletes: ['monde_prologue', 'monde_lave', 'monde_rouille'],
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
    mondesDejaMontres: ['monde_boss_1'],
    laboDecouvert: false,
    prouessesHistoire: {
        blocksRouillesMax: 0,
        lignesEclipseBasseMax: 0,
        lignesVideMax: 0,
        precisionMiroirMax: 0,
        meilleurTimerBossMs: Infinity,
    },
};

/** @param {import('@playwright/test').Page} page @param {object} [etatHistoire] */
export async function ouvrirCarteHistoire(page, etatHistoire = ETAT_HISTOIRE_BOSS_BRASIER) {
    await page.addInitScript((etat) => {
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
    }, etatHistoire);
    await page.goto('/');
    await page.locator('#btn-histoire').click();
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/);
}

/** @param {import('@playwright/test').Page} page */
export async function lancerMondeBossBrasier(page) {
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1');
    await page.locator('.bouton-jouer-monde').click();
    await expect(page.locator('#interface-jeu')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#canvas-plateau')).toBeVisible();
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieViaClavier(page) {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#sel-biome-clavier')).toBeVisible();
    await page.locator('#sel-biome-clavier').selectOption({ index: 1 });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu')).toBeVisible();
    await expect(page.locator('#canvas-plateau')).toBeVisible();
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await page.locator('#toggle-coop').click();
    const canvas = page.locator('#canvas-constellation');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    await canvas.click({
        position: { x: box.width * 0.5, y: box.height * 0.5 },
    });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu-coop')).toBeVisible({ timeout: 5000 });
}
