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
    };
}
