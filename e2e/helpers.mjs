import { expect } from '@playwright/test';

export {
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ETAT_HISTOIRE_BOSS_BRASIER,
    ETAT_AVANT_BOSS_SENTINELLE,
    ETAT_AVANT_BOSS_ARCHIVISTE,
    ETAT_AVANT_BOSS_AVANTGARDE,
    ETAT_FIN_SECRETE_PRET,
    ETAT_AVANT_FIN_SECRETE,
    ETAT_INFERNO_PRET,
    ETAT_FIN_VRAIE_PRET,
    ETAT_OCEAN_FRAGMENT_PRET,
    ETAT_FORET_FRAGMENT_PRET,
    ETAT_GLACE_FRAGMENT_PRET,
    ETAT_CYBER_LABO_PRET,
    ETAT_AVANT_DESERT,
    ETAT_PARADOXE_DEBLOQUE,
    ETAT_AVANT_FIN_VRAIE,
    ETAT_ENTREE_COSMOS,
    ETAT_ENTREE_VIDE,
    ETAT_ENTREE_TRAME,
    MONDES_CAMPAGNE_PRINCIPALE,
    MONDES_SECRETS_FIN_SECRETE,
} from './etats-histoire.mjs';

import {
    ETAT_DEBLOCAGE_MONDE_LIBRE,
    ETAT_DEBLOCAGE_META_RAPIDE,
    ETAT_HISTOIRE_BOSS_BRASIER,
} from './etats-histoire.mjs';
import { attendreTypewriterInactif } from './helpers-narratif.mjs';
import { basculerCoopDepuisSelection } from './helpers-audit-b.mjs';

/** Filtre les violations Axe bloquantes (hors contraste optionnel). */
export function filtrerViolationsCritiques(violations, { inclureContraste = false } = {}) {
    return violations.filter((v) => {
        if (v.impact === 'critical') return true;
        if (v.impact === 'serious' && v.id !== 'color-contrast') return true;
        if (inclureContraste && v.id === 'color-contrast') return true;
        return false;
    });
}

/** @param {import('@playwright/test').Page} page @param {string} selector */
export async function boutonEstVisible(page, selector) {
    const loc = page.locator(selector);
    if ((await loc.count()) === 0) return false;
    return loc.isVisible();
}

/** @param {import('@playwright/test').Page} page */
export async function fermerPanneauDetailSiOuvert(page) {
    if (await page.locator('#overlay-orientation.visible').count()) return;
    const panneau = page.locator('#panneau-detail');
    if ((await panneau.count()) === 0) return;
    if ((await panneau.getAttribute('aria-hidden')) !== 'false') return;
    await page.locator('#btn-panneau-detail-fermer').click();
    await expect(panneau).toHaveAttribute('aria-hidden', 'true');
}

/** @param {import('@playwright/test').Page} page */
export async function activerPausePartie(page) {
    await fermerPanneauDetailSiOuvert(page);
    const pauseMobile = page.locator('#btn-pause-mobile');
    if (await pauseMobile.isVisible()) {
        await pauseMobile.click();
        return;
    }
    await page.locator('#btn-pause').click();
}

/** @param {import('@playwright/test').Page} page */
export async function activerPausePartieTactile(page) {
    await fermerPanneauDetailSiOuvert(page);
    const pauseViaDom = await page.evaluate(() => {
        const mobile = document.getElementById('btn-pause-mobile');
        if (mobile && getComputedStyle(mobile).display !== 'none') {
            mobile.click();
            return true;
        }
        document.getElementById('btn-pause')?.click();
        return true;
    });
    expect(pauseViaDom).toBe(true);
}

/** @param {import('@playwright/test').Page} page @param {string} elementId @param {string} className */
export async function elementAClasse(page, elementId, className) {
    return page.evaluate(
        ([id, cls]) => document.getElementById(id)?.classList.contains(cls) === true,
        [elementId, className]
    );
}

/** Lance l'intro Jour 2 554 depuis l'écran titre (première visite). */
export async function ouvrirIntroHistoire(page) {
    await preparerPremierLancement(page);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-nouvelle-partie').click();
    await expect(page.locator('#ecran-histoire-cutscene')).toHaveClass(/actif/, {
        timeout: 20000,
    });
}

/** @param {import('@playwright/test').Page} page */
export async function attendreRenduCarteHistoire(page) {
    await expect(page.locator('#canvas-histoire-map')).toBeVisible();
    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const canvas = document.getElementById('canvas-histoire-map');
                    if (!(canvas instanceof HTMLCanvasElement)) return false;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return false;
                    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] > 0) return true;
                    }
                    return false;
                }),
            { timeout: 5000, intervals: [80, 150, 250] }
        )
        .toBe(true);
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
        timeout: 25000,
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
        if (await boutonEstVisible(page, sel)) {
            await expect(page.locator(sel)).not.toHaveClass(/visible/, { timeout: 20000 });
        }
    }
}

/** @param {import('@playwright/test').Page} page */
export async function fermerInfobulleContexteSiVisible(page) {
    const overlay = page.locator('#overlay-infobulle-contexte');
    if (await boutonEstVisible(page, '#overlay-infobulle-contexte')) {
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
        if (await boutonEstVisible(page, '#btn-objectifs-commencer')) {
            await commencer.click();
            continue;
        }

        if (await boutonEstVisible(page, '#btn-cutscene-passer')) {
            await page.locator('#btn-cutscene-passer').click({ force: true });
            continue;
        }

        if (await boutonEstVisible(page, '#btn-cutscene-suivant')) {
            await page.locator('#btn-cutscene-suivant').click({ force: true });
            continue;
        }

        if (await boutonEstVisible(page, '#btn-tutoriel-fermer')) {
            await page.locator('#btn-tutoriel-fermer').click();
            continue;
        }

        if (await boutonEstVisible(page, '#btn-journal-fermer')) {
            await page.locator('#btn-journal-fermer').click({ force: true });
            continue;
        }

        try {
            await attendreTypewriterInactif(page, 500);
        } catch {
            /* attente courte entre étapes du flux */
        }
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

export {
    MARQUEURS_NARRATIFS_CAMPAGNE,
    SCENES_VICTOIRE_BOSS,
    appliquerEncocheSimulee,
    lireTexteCutsceneActive,
    cliquerCutsceneSuivant,
    attendreCutsceneVictoireBoss,
    avancerCutsceneJusquaPivot,
    attendreSceneCutsceneActive,
    simulerVictoireBossHistoire,
    assertHumeurPortraitCutscene,
    parcourirVictoireBossJusquaPivot,
    attendreJournalHistoire,
    lancerMondeDepuisCarte,
    parcourirFluxPostVictoireAvecAssertions,
    viderOverlaysHistoireRapide,
    passerCutsceneEntiere,
    terminerCutscenesVersEcranFin,
    obtenirScenePostMonde,
    attendreFinOverlaysHistoire,
    attendreTypewriterInactif,
} from './helpers-narratif.mjs';

export {
    installerJournalVibrations,
    preparerSelectionPremiereVisiteModes,
    selectionnerBiomeVerrouilleConstellation,
    selectionnerMondeCarte,
    attendreBarreModesPretes,
    reinitialiserInfobulleMode,
    attendreInfobulleMode,
    basculerDefiJourDepuisSelection,
    basculerSprintDepuisSelection,
    basculerOracleDepuisSelection,
    basculerCoopDepuisSelection,
} from './helpers-audit-b.mjs';

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
    if (await boutonEstVisible(page, '#btn-continuer')) {
        await continuer.click();
    } else {
        await page.locator('#btn-nouvelle-partie').click();
    }
    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/);
    await expect(page.locator('#histoire-prog-mondes')).toContainText(/\d+\/\d+\s+MONDES/i, {
        timeout: 15000,
    });
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
    if (await boutonEstVisible(page, '#btn-tutoriel-fermer')) {
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
export async function activerPauseCoopTactile(page) {
    const viaTest = await page.evaluate(async () => {
        if (typeof window.__NEO_TEST__?.basculerPauseCoop === 'function') {
            await window.__NEO_TEST__.basculerPauseCoop();
            return true;
        }
        return false;
    });
    if (!viaTest) {
        const clique = await page.evaluate(() => {
            for (const id of ['btn-pause-coop-mobile', 'btn-pause-coop']) {
                const btn = document.getElementById(id);
                if (btn && getComputedStyle(btn).display !== 'none') {
                    btn.click();
                    return true;
                }
            }
            return false;
        });
        if (!clique) await page.keyboard.press('KeyP');
    }
    await expect(page.locator('#ecran-pause-coop')).toHaveClass(/actif/, { timeout: 10000 });
}

/** @param {import('@playwright/test').Page} page */
export async function demarrerPartieCoop(page) {
    await preparerPageSansSw(page, ETAT_DEBLOCAGE_META_RAPIDE);
    await page.goto('/');
    await attendreApplicationPrete(page);
    await attendreNotificationsInitiales(page);
    await page.locator('#btn-jouer').click();
    await expect(page.locator('#ecran-selection')).toHaveClass(/actif/);
    await fermerInfobulleContexteSiVisible(page);
    await fermerPanneauDetailSiOuvert(page);
    await basculerCoopDepuisSelection(page);
    await expect(page.locator('#coop-toggle-label')).toHaveText('COOP : ON');
    await expect(page.locator('#conteneur-principal-coop')).toBeAttached({ timeout: 10000 });
    await selectionnerBiomeClavier(page);
    await page.evaluate(() => document.getElementById('btn-panneau-detail-jouer')?.click());
    await expect(page.locator('body')).toHaveClass(/coop-active/, { timeout: 15000 });
    await expect(page.locator('#conteneur-principal-coop')).toBeVisible({ timeout: 10000 });
}

/** @param {import('@playwright/test').Page} page */
export async function terminerPartieCoopCourante(page) {
    await expect(page.locator('body')).toHaveClass(/coop-active/, { timeout: 15000 });
    const declenche = await page.evaluate(async () => {
        if (typeof window.__NEO_TEST__?.terminerPartieCoop === 'function') {
            await window.__NEO_TEST__.terminerPartieCoop();
            return true;
        }
        return false;
    });
    expect(declenche).toBe(true);
    await expect(page.locator('#ecran-game-over-coop')).toHaveClass(/actif/, { timeout: 5000 });
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
        if (await elementAClasse(page, 'ecran-histoire-map', 'actif')) {
            return;
        }

        if (await boutonEstVisible(page, '#btn-cutscene-passer')) {
            await page.locator('#btn-cutscene-passer').click({ force: true });
            continue;
        }

        if (await boutonEstVisible(page, '#btn-cutscene-suivant')) {
            await page.locator('#btn-cutscene-suivant').click({ force: true });
            continue;
        }

        if (await boutonEstVisible(page, '#btn-tutoriel-fermer')) {
            await page.locator('#btn-tutoriel-fermer').click();
            continue;
        }

        try {
            await attendreTypewriterInactif(page, 400);
        } catch {
            /* typewriter ou cutscene inactive */
        }
    }

    await expect(page.locator('#ecran-histoire-map')).toHaveClass(/actif/, { timeout: 20000 });
}
