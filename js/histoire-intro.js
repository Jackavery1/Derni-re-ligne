/**
 * js/histoire-intro.js
 * Séquence d'introduction « Jour 2 554 », jouée une seule fois au tout
 * premier lancement du Mode Histoire, avant l'apparition de la carte.
 */
import { lireStockage, ecrireStockage } from './progression.js';
import { obtenirHistoireTextesSync, chargerHistoireTextes } from './charger-histoire-textes.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';

const CLE_INTRO_VUE = 'derniereLigne_introHistoireVue';

export function introHistoireDejaVue() {
    return lireStockage(CLE_INTRO_VUE, '0') === '1';
}

export function marquerIntroHistoireVue() {
    ecrireStockage(CLE_INTRO_VUE, '1');
    logger.debug('[intro] flag derniereLigne_introHistoireVue ecrit');
}

export function obtenirSequenceIntro() {
    return obtenirHistoireTextesSync().INTRO_HISTOIRE;
}

/** Point d'entrée unique depuis le menu titre (pas retournerACarte). */
export async function ouvrirModeHistoireDepuisMenu() {
    logger.debug('[intro] entree handler btn-mode-histoire');
    const dejaVue = introHistoireDejaVue();
    logger.debug('[intro] introHistoireDejaVue =', dejaVue);

    const { afficherEcran } = await import('./navigation-ecrans.js');

    if (dejaVue) {
        logger.debug('[intro] branche carte directe (intro deja vue)');
        afficherEcran(ECRANS.HISTOIRE_MAP);
        return;
    }

    try {
        await chargerHistoireTextes();
        logger.debug('[intro] textes histoire charges');

        const seq = obtenirSequenceIntro();
        logger.debug('[intro] lancement cutscene,', seq.length, 'lignes');

        const { afficherCutsceneHistoire } = await import('./histoire-manager-ui.js');

        await new Promise((resolve, reject) => {
            try {
                const demarre = afficherCutsceneHistoire(
                    seq.map((l) => l.texte),
                    seq.map((l) => l.personnage),
                    () => {
                        logger.debug(
                            '[intro] callback fin cutscene (jouee ou passee par le joueur)'
                        );
                        marquerIntroHistoireVue();
                        resolve();
                    },
                    { intro: true }
                );
                if (!demarre) {
                    reject(new Error('Cutscene intro : elements DOM introuvables'));
                }
            } catch (err) {
                reject(err);
            }
        });

        logger.debug('[intro] affichage carte histoire');
        afficherEcran(ECRANS.HISTOIRE_MAP);
    } catch (err) {
        logger.error('[intro] echec flux intro (flag non modifie):', err);
        afficherEcran(ECRANS.TITRE);
    }
}
