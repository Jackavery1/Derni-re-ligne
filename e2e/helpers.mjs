import { expect } from '@playwright/test';

export {
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_DEBLOCAGE_COMPLET,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_FIN_SECRETE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_INFERNO_PRET,
    ETAT_FIN_VRAIE_PRET,
    ETAT_OCEAN_FRAGMENT_PRET,
    ETAT_CYBER_LABO_PRET,
    ETAT_AVANT_DESERT,
    MONDES_CAMPAGNE_PRINCIPALE,
    MONDES_SECRETS_FIN_SECRETE,
} from './etats-histoire.mjs';

import {
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_DEBLOCAGE_COMPLET,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './etats-histoire.mjs';

/** Filtre les violations Axe bloquantes (hors contraste optionnel). */
export function filtrerViolationsCritiques(violations, { inclureContraste = false } = {}) {
    return violations.filter((v) => {
        if (v.impact === 'critical') return true;
        if (v.impact === 'serious' && v.id !== 'color-contrast') return true;
        if (inclureContraste && v.id === 'color-contrast') return true;
        return false;
    });
}

/** État vierge : aucun déblocage, comme un premier lancement. */
export async function preparerPremierLancement(page) {
    await page.addInitScript(() => {
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.removeItem('derniereLigne_histoire');
        localStorage.removeItem('derniereLigne_introHistoireVue');
        localStorage.removeItem('derniereLigne_tutorielVu');
        localStorage.removeItem('derniereLigne_tutorielHistoireVu');
        localStorage.removeItem('derniereLigne_tutorielCoopVu');
        localStorage.removeItem('derniereLigne_tutorielArchitecteVu');
    });
}

/** Désactive le cache stale en tests locaux et débloque le mode libre. */
export async function preparerPageSansSw(page, etatHistoire = ETAT_DEBLOCAGE_MONDE_LIBRE) {
    await page.route('**/sw.js', (route) => route.abort());
    await page.addInitScript((etat) => {
        window.__NEO_SILENT_NOTIFS__ = true;
        localStorage.setItem('dl_migration_v1', '1');
        localStorage.setItem('derniereLigne_tutorielVu', '1');
        localStorage.setItem('derniereLigne_tutorielHistoireVu', '1');
        localStorage.setItem('derniereLigne_tutorielCoopVu', '1');
        localStorage.setItem('derniereLigne_tutorielArchitecteVu', '1');
        localStorage.setItem('derniereLigne_introHistoireVue', '1');
        localStorage.setItem('derniereLigne_infobulleOracleCoop', '1');
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
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/, { timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreEcranTitre(page) {
    await attendreApplicationPrete(page);
    await expect(page.locator('#ecran-titre')).toHaveClass(/actif/, { timeout: 15000 });
}

/** @param {import('@playwright/test').Page} page @param {{ index?: number, value?: string }} option */
export async function selectionnerBiomeClavier(page, option = { value: 'classique' }) {
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/, { timeout: 10000 });
    const select = page.locator('#sel-biome-clavier');
    const valeur = option.value ?? 'classique';
    await expect(select.locator(`option[value="${valeur}"]`)).toBeAttached({ timeout: 15000 });
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

/** @param {import('@playwright/test').Page} page @param {string} [biomeId] */
async function confirmerDemarragePartie(page, biomeId = 'classique') {
    await page.evaluate(() => {
        document.getElementById('btn-panneau-detail-jouer')?.click();
    });
    const demarre = await page.evaluate((biome) => {
        if (document.body.classList.contains('partie-active')) return true;
        const demarrer = window.__NEO_TEST__?.demarrerPartieLibre;
        if (typeof demarrer === 'function') {
            demarrer(biome);
            return document.body.classList.contains('partie-active');
        }
        return false;
    }, biomeId);
    if (!demarre) {
        await page.locator('#btn-panneau-detail-jouer').click({ force: true });
    }
}

/** @param {import('@playwright/test').Page} page */
export async function attendrePartieVisible(page) {
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 20000 });
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

/** @param {import('@playwright/test').Page} page */
export async function fermerInfobulleContexteSiVisible(page) {
    const overlay = page.locator('#overlay-infobulle-contexte');
    if (await overlay.isVisible().catch(() => false)) {
        await page.locator('#btn-infobulle-contexte-fermer').click({ force: true });
        await expect(overlay).toHaveClass(/element-masque/, { timeout: 5000 });
    }
    await page.evaluate(() => {
        document.getElementById('overlay-infobulle-contexte')?.classList.add('element-masque');
    });
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

        const journal = page.locator('#btn-journal-fermer');
        if (await journal.isVisible().catch(() => false)) {
            await journal.click({ force: true });
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
    await confirmerDemarragePartie(page);
    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function fermerRecapPostMonde(page) {
    await expect(page.locator('#overlay-recap-monde')).toBeVisible({ timeout: 10000 });
    await page.locator('#btn-recap-continuer').click({ force: true });
}

/** Ferme recap, journal et cutscenes sans assertion stricte (parcours campagne long). */
/** @param {import('@playwright/test').Page} page @param {number} [max] */
export async function viderOverlaysHistoireRapide(page, max = 12) {
    for (let i = 0; i < max; i++) {
        const etat = await page.evaluate(() => ({
            recap: document
                .getElementById('overlay-recap-monde')
                ?.classList.contains('objectif-overlay-visible'),
            cutscene: document
                .getElementById('ecran-histoire-cutscene')
                ?.classList.contains('actif'),
            journal: document.getElementById('ecran-histoire-journal')?.classList.contains('actif'),
        }));
        if (!etat.recap && !etat.cutscene && !etat.journal) return;
        if (etat.recap) {
            await page.locator('#btn-recap-continuer').click({ force: true });
            continue;
        }
        if (etat.journal) {
            await page.evaluate(() => {
                document.getElementById('btn-journal-fermer')?.click();
            });
            continue;
        }
        if (etat.cutscene) {
            await page.evaluate(() => {
                document.getElementById('btn-cutscene-passer')?.click();
            });
            continue;
        }
        await page.waitForTimeout(150);
    }
}

/** @param {import('@playwright/test').Page} page */
export async function passerCutsceneEntiere(page) {
    await page.evaluate(() => {
        document.getElementById('btn-cutscene-passer')?.click();
    });
}

/** Passe toutes les cutscenes actives jusqu'à l'écran de fin histoire. */
/** @param {import('@playwright/test').Page} page */
export async function terminerCutscenesVersEcranFin(page) {
    for (let tentative = 0; tentative < 20; tentative++) {
        const finActif = await page
            .locator('#ecran-histoire-fin')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (finActif) return;

        const cutActif = await page
            .locator('#ecran-histoire-cutscene')
            .evaluate((el) => el.classList.contains('actif'))
            .catch(() => false);
        if (cutActif) {
            await page.locator('#btn-cutscene-passer').click({ force: true });
            continue;
        }
        await page.waitForTimeout(200);
    }
    await expect(page.locator('#ecran-histoire-fin')).toHaveClass(/actif/, { timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page */
export async function passerCutsceneActive(page) {
    await page.evaluate(() => {
        const passer = document.getElementById('btn-cutscene-passer');
        if (passer) {
            passer.click();
            return;
        }
        document.getElementById('btn-cutscene-suivant')?.click();
    });
}

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
    await confirmerDemarragePartie(page);
    await attendrePartieVisible(page);
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_COMPLET);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await fermerInfobulleContexteSiVisible(page);
    await page.locator('#toggle-coop').click({ force: true });
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await selectionnerBiomeClavier(page);
    await page.locator('#btn-panneau-detail-jouer').click({ force: true });
    await expect(page.locator('#interface-jeu-coop')).toBeVisible({ timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page */
export async function terminerPartieCourante(page) {
    await expect(page.locator('body')).toHaveClass(/partie-active/, { timeout: 15000 });

    const declenche = await page.evaluate(() => {
        if (typeof window.__NEO_TEST__?.terminerPartie === 'function') {
            window.__NEO_TEST__.terminerPartie(false, { immediat: true });
            return true;
        }
        return false;
    });
    expect(declenche).toBe(true);
    await expect(page.locator('#ecran-game-over')).toHaveClass(/actif/, { timeout: 5000 });
}

/** @param {import('@playwright/test').Page} page */
export async function passerCutsceneHistoire(page) {
    for (let i = 0; i < 40; i++) {
        if (
            await page
                .locator('#ecran-histoire-map')
                .evaluate((el) => el.classList.contains('actif'))
        ) {
            return;
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

    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 20000 });
}

/** @param {import('@playwright/test').Page} page */
export async function passerFluxPremierLancementCampagne(page) {
    await passerCutsceneHistoire(page);
}
