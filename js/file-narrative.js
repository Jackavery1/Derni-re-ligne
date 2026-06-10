import { logger } from './logger.js';

/**
 * @typedef {{ id: string, condition?: () => boolean, executer: (suivant: () => void) => void }} EtapeNarrative
 */

/**
 * @param {string} nomDebug
 */
export function creerFile(nomDebug) {
    /** @type {EtapeNarrative[]} */
    const etapes = [];
    let index = 0;
    let termine = false;

    function avancer() {
        if (termine) return;

        while (index < etapes.length) {
            const etape = etapes[index++];
            if (etape.condition && !etape.condition()) {
                logger.debug(`[narratif] skip ${etape.id} (condition)`);
                continue;
            }

            logger.debug(`[narratif] ${nomDebug} → ${etape.id}`);
            let suivantAppele = false;
            const suivant = () => {
                if (suivantAppele) {
                    logger.warn(
                        `[narratif] ${nomDebug} : suivant() ignore (deuxieme appel, etape ${etape.id})`
                    );
                    return;
                }
                suivantAppele = true;
                avancer();
            };

            etape.executer(suivant);
            return;
        }

        termine = true;
    }

    return {
        /** @param {EtapeNarrative} etape */
        ajouter(etape) {
            etapes.push(etape);
        },
        demarrer() {
            index = 0;
            termine = false;
            avancer();
        },
    };
}
