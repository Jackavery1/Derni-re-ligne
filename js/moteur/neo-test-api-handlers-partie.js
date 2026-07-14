import { demarrerJeu } from '../logique/partie.js';
import { definirBiomeActif, etat } from '../etat/store-jeu.js';
import { sauvegarderBiomeActif } from '../io/progression.js';
import { obtenirActions } from '../logique/actions-jeu.js';
import { boucleSecondaireActive } from '../logique/planificateur-raf.js';
import { CONFIG } from '../config/config-jeu.js';
import { AudioMoteur } from '../audio/audio.js';

export function creerHandlersPartie() {
    return {
        terminerPartie: (victoire, options) => obtenirActions().terminerPartie?.(victoire, options),
        demarrerPartieLibre: (biomeId = 'classique') => {
            definirBiomeActif(biomeId);
            sauvegarderBiomeActif(biomeId);
            demarrerJeu();
        },
        boucleMenuUnifieActive: () => boucleSecondaireActive('menu-unifie'),
        simulerVictoireSprint: () => {
            etat.modeJeu = 'sprint';
            etat.lignes = CONFIG.sprintLignes;
            obtenirActions().terminerPartie?.(true, { immediat: true });
        },
        obtenirColonnePieceActive: () =>
            typeof etat.pieceActuelle?.x === 'number' ? etat.pieceActuelle.x : null,
        obtenirMusiqueActive: () => AudioMoteur.biomeMusique,
        obtenirDelaiPremierEvenementVivant: async (biomeId = 'lave') => {
            const { COMPORTEMENTS_VIVANT } = await import('../logique/vivant-comportements.js');
            const { delaiMinimumVivantEffectif } = await import('../logique/vivant.js');
            const config = COMPORTEMENTS_VIVANT[biomeId];
            if (!config) return null;
            const delaiMs = delaiMinimumVivantEffectif(config, 1);
            const frames60 = Math.floor((delaiMs * 60) / 1000);
            return { biomeId, delaiMs, frames60, delaiMinimumConfig: config.delaiMinimum };
        },
        evaluerDelaisPremiersObstaclesVivants: async () => {
            const { COMPORTEMENTS_VIVANT } = await import('../logique/vivant-comportements.js');
            const { delaiMinimumVivantEffectif } = await import('../logique/vivant.js');
            const seuilFrames = 120;
            const biomes = Object.entries(COMPORTEMENTS_VIVANT)
                .filter(([, config]) => config != null)
                .map(([id, config]) => {
                    const delaiMs = delaiMinimumVivantEffectif(config, 1);
                    const frames60 = Math.floor((delaiMs * 60) / 1000);
                    return {
                        biomeId: id,
                        delaiMs,
                        frames60,
                        delaiMinimumConfig: config.delaiMinimum,
                    };
                });
            const minimum = biomes.reduce(
                (acc, entree) => (entree.frames60 < acc.frames60 ? entree : acc),
                biomes[0] ?? null
            );
            return {
                seuilFrames,
                biomes,
                minimum,
                tousAuDessusSeuil: biomes.every((b) => b.frames60 >= seuilFrames),
            };
        },
    };
}
