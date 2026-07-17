/**
 * js/histoire-intro.js
 * Séquence d'introduction « Jour 2 554 », jouée une seule fois au tout
 * premier lancement du Mode Histoire, avant l'apparition de la carte.
 */
import { lireStockage, ecrireStockage } from '../io/progression.js';
import { obtenirHistoireTextesSync, chargerHistoireTextes } from '../io/charger-histoire-textes.js';
import { ECRANS } from '../ui/ecrans-config.js';
import { logger } from '../io/logger.js';
import { activerModeHistoire } from '../etat/mode-histoire.js';
import { afficherEcranDiffereAsync } from '../ui/navigation-actions.js';
import { precchargerNavigation } from '../ui/navigation-lazy.js';
import { assurerActionsHistoire } from './histoire-assurer-actions.js';

const CLE_INTRO_VUE = 'derniereLigne_introHistoireVue';

export function introHistoireDejaVue() {
    return lireStockage(CLE_INTRO_VUE, '0') === '1';
}

export function marquerIntroHistoireVue() {
    ecrireStockage(CLE_INTRO_VUE, '1');
    logger.debug('[intro] flag derniereLigne_introHistoireVue ecrit');
}

export function reinitialiserIntroHistoire() {
    try {
        localStorage.removeItem(CLE_INTRO_VUE);
    } catch {
        /* ignore */
    }
}

export function obtenirSequenceIntro() {
    return obtenirHistoireTextesSync().INTRO_HISTOIRE;
}

/** Point d'entrée unique depuis le menu titre (pas retournerACarte). */
export async function ouvrirModeHistoireDepuisMenu() {
    logger.debug('[intro] entree menu campagne');
    const dejaVue = introHistoireDejaVue();
    logger.debug('[intro] introHistoireDejaVue =', dejaVue);

    await Promise.all([assurerActionsHistoire(), precchargerNavigation()]);

    if (dejaVue) {
        logger.debug('[intro] branche carte directe (intro deja vue)');
        activerModeHistoire();
        await afficherEcranDiffereAsync(ECRANS.HISTOIRE_MAP);
        return;
    }

    try {
        await chargerHistoireTextes();
        logger.debug('[intro] textes histoire charges');

        const seq = obtenirSequenceIntro();
        const lignesIntro = Array.isArray(seq) ? seq : (seq.lignes ?? []);
        logger.debug('[intro] lancement cutscene,', lignesIntro.length, 'lignes');

        const { afficherCutsceneHistoire } = await import('./histoire-manager-ui.js');

        await new Promise((resolve, reject) => {
            try {
                let termine = false;
                let cutsceneJouee = false;
                const demarre = afficherCutsceneHistoire(
                    seq,
                    null,
                    () => {
                        if (termine) return;
                        termine = true;
                        logger.debug(
                            '[intro] callback fin cutscene (jouee ou passee par le joueur)'
                        );
                        if (cutsceneJouee && lignesIntro.length > 0) {
                            marquerIntroHistoireVue();
                        }
                        resolve();
                    },
                    { intro: true }
                );
                cutsceneJouee = demarre;
                if (!demarre && !termine) {
                    reject(new Error('Cutscene intro : demarrage impossible'));
                }
            } catch (err) {
                reject(err);
            }
        });

        logger.debug('[intro] affichage carte histoire');
        activerModeHistoire();
        await afficherEcranDiffereAsync(ECRANS.HISTOIRE_MAP);
    } catch (err) {
        logger.error('[intro] echec flux intro (flag non modifie):', err);
        await precchargerNavigation();
        await afficherEcranDiffereAsync(ECRANS.TITRE);
    }
}
