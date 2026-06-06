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

/** État histoire minimal pour débloquer le mode libre (Chapitre I complété). */
export const ETAT_DEBLOCAGE_MONDE_LIBRE = {
    chapitreActuel: 'chapitre_2',
    mondesCompletes: ['monde_prologue', 'monde_lave', 'monde_rouille'],
    bossVaincus: ['brasier'],
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
};

/** État histoire pour Oracle, Coop, Codex et Architecte débloqués. */
export const ETAT_DEBLOCAGE_COMPLET = {
    ...ETAT_DEBLOCAGE_MONDE_LIBRE,
    bossVaincus: ['brasier', 'sentinelle', 'archiviste', 'avantgarde', 'distorsion'],
    mondesCompletes: ['monde_prologue'],
};

/** Désactive le cache stale en tests locaux et débloque le mode libre. */
export async function preparerPageSansSw(page, etatHistoire = ETAT_DEBLOCAGE_MONDE_LIBRE) {
    await page.addInitScript((etat) => {
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
    }, etatHistoire);
}

/** @param {import('@playwright/test').Page} page */
export async function attendreEcranTitre(page) {
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/, { timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartie(page) {
    await preparerPageSansSw(page);
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#sel-biome-clavier')).toBeVisible();
    await page.locator('#sel-biome-clavier').selectOption({ index: 1 });
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
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
    }, etatHistoire);
    await page.goto('/');
    await page.locator('#btn-mode-histoire').click();
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
    await preparerPageSansSw(page);
    await page.goto('/');
    const fermerTutoriel = page.locator('#btn-tutoriel-fermer');
    if (await fermerTutoriel.isVisible().catch(() => false)) {
        await fermerTutoriel.click();
    }
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#sel-biome-clavier')).toBeVisible({ timeout: 10000 });
    await page.locator('#sel-biome-clavier').selectOption({ index: 1 });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu')).toBeVisible();
    await expect(page.locator('#canvas-plateau')).toBeVisible();
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await page.locator('#btn-jouer').click();
    await page.locator('#toggle-coop').click();
    await expect(page.locator('#sel-biome-clavier')).toBeVisible();
    await page.locator('#sel-biome-clavier').selectOption({ index: 1 });
    await page.locator('#sel-btn-jouer').click();
    await expect(page.locator('#interface-jeu-coop')).toBeVisible({ timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page */
export async function terminerPartieCourante(page) {
    const declenche = await page.evaluate(() => {
        if (typeof window.__NEO_TEST__?.terminerPartie === 'function') {
            window.__NEO_TEST__.terminerPartie(false);
            return true;
        }
        return false;
    });
    if (!declenche) {
        await page.evaluate(() => {
            document.querySelectorAll('.ecran.actif').forEach((el) => el.classList.remove('actif'));
            document.getElementById('ecran-game-over')?.classList.add('actif');
        });
    } else {
        await page.waitForTimeout(600);
    }
}
