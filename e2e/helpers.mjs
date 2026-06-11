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

/** État vierge : aucun déblocage, comme un premier lancement. */
export async function preparerPremierLancement(page) {
    await page.addInitScript(() => {
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.removeItem('derniereLigne_histoire');
    });
}

/** Désactive le cache stale en tests locaux et débloque le mode libre. */
export async function preparerPageSansSw(page, etatHistoire = ETAT_DEBLOCAGE_MONDE_LIBRE) {
    await page.addInitScript((etat) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        if ('serviceWorker' in navigator) {
            void navigator.serviceWorker.getRegistrations().then((regs) => {
                for (const reg of regs) void reg.unregister();
            });
        }
    }, etatHistoire);
}

/** @param {import('@playwright/test').Page} page */
export async function attendreApplicationPrete(page) {
    await expect(page.locator('body')).toHaveAttribute('data-neo-test-ready', '1', {
        timeout: 15000,
    });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreEcranTitre(page) {
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/, { timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page @param {{ index?: number, value?: string }} option */
export async function selectionnerBiomeClavier(page, option = { value: 'classique' }) {
    const select = page.locator('#sel-biome-clavier');
    const valeur = option.value ?? 'classique';
    await expect(select.locator(`option[value="${valeur}"]`)).toBeAttached({ timeout: 10000 });
    await select.selectOption(option.value ? option : { value: valeur }, { force: true });
    await page.evaluate((id) => {
        const el = document.getElementById('sel-biome-clavier');
        if (!el || el.value === id) return;
        el.value = id;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, valeur);
    await expect(page.locator('#panneau-detail')).not.toHaveClass(/element-masque/, {
        timeout: 5000,
    });
    await expect(page.locator('#btn-panneau-detail-jouer')).toBeVisible({ timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page */
export async function attendrePartieVisible(page) {
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 15000 });
    await expect(page.locator('#conteneur-principal')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#canvas-plateau')).toBeVisible({ timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreNotificationsInitiales(page) {
    for (const sel of ['#notif-achievement', '#notif-niveau', '#notif-codex']) {
        const el = page.locator(sel);
        if (await el.isVisible().catch(() => false)) {
            await expect(el).not.toHaveClass(/visible/, { timeout: 20000 });
        }
    }
}

/**
 * Passe cutscenes, tutoriel et panneau objectifs jusqu'à la partie active.
 * @param {import('@playwright/test').Page} page
 */
export async function passerFluxLancementMonde(page) {
    for (let i = 0; i < 24; i++) {
        if (await page.locator('body').evaluate((el) => el.classList.contains('partie-active'))) {
            break;
        }

        const commencer = page.locator('#btn-objectifs-commencer');
        if (await commencer.isVisible().catch(() => false)) {
            await commencer.click();
            continue;
        }

        const passer = page.locator('#btn-cutscene-passer');
        if (await passer.isVisible().catch(() => false)) {
            await passer.click({ force: true });
            continue;
        }

        const suivant = page.locator('#btn-cutscene-suivant');
        if (await suivant.isVisible().catch(() => false)) {
            await suivant.click({ force: true });
            continue;
        }

        const tutoriel = page.locator('#btn-tutoriel-fermer');
        if (await tutoriel.isVisible().catch(() => false)) {
            await tutoriel.click();
            continue;
        }

        await page.waitForTimeout(200);
    }

    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartie(page) {
    await preparerPageSansSw(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.locator('#btn-panneau-detail-jouer').click({ force: true });
    await attendrePartieVisible(page);
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
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('derniereLigne_histoire', JSON.stringify(etat));
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
    }, etatHistoire);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    const continuer = page.locator('#btn-continuer');
    if (await continuer.isVisible().catch(() => false)) {
        await continuer.click();
    } else {
        await page.locator('#btn-nouvelle-partie').click();
    }
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/);
}

/** @param {import('@playwright/test').Page} page */
export async function lancerMondeBossBrasier(page) {
    await page.locator('#histoire-monde-clavier').selectOption('monde_boss_1', { force: true });
    await expect(page.locator('#histoire-monde-details')).not.toHaveClass(
        /histoire-panneau-masque/
    );
    await page.locator('.bouton-jouer-monde').click({ force: true });
    await passerFluxLancementMonde(page);
    await expect(page.locator('#section-boss')).toBeVisible();
    await expect(page.locator('#boss-nom-affiche')).not.toHaveText('BOSS');
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieViaClavier(page) {
    await preparerPageSansSw(page);
    await page.goto('/');
    const fermerTutoriel = page.locator('#btn-tutoriel-fermer');
    if (await fermerTutoriel.isVisible().catch(() => false)) {
        await fermerTutoriel.click();
    }
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.locator('#btn-panneau-detail-jouer').click({ force: true });
    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await page.locator('#btn-jouer').click();
    await page.locator('#toggle-coop').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.locator('#btn-panneau-detail-jouer').click({ force: true });
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
