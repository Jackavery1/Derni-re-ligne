import { CONFIG } from './config.js';
import { dessinerCelluleStyle } from './rendu-blocs.js';
import {
    etat,
    couleurAmbRgb,
    obtenirBiomeActif,
    obtenirEffetsReduits,
    obtenirPrefererMoinsAnimations,
} from './store-jeu.js';
import { obtenirCouleurPieceParType, hexVersRgb } from './piece-jeu.js';

export function dessinerCellule(ctx2d, x, y, couleur, taille = CONFIG.taille, opacite = 1) {
    dessinerCelluleStyle(ctx2d, x, y, couleur, taille, opacite, obtenirBiomeActif(), {
        effetsReduits: obtenirEffetsReduits(),
        prefererMoinsAnimations: obtenirPrefererMoinsAnimations(),
    });
}

export function mettreAJourAmbiante(dt) {
    if (!etat.pieceActuelle) return;
    const cible = hexVersRgb(obtenirCouleurPieceParType(etat.pieceActuelle.type));
    const t = Math.min(1, dt / 200);
    for (let i = 0; i < 3; i++) {
        couleurAmbRgb[i] += (cible[i] - couleurAmbRgb[i]) * t;
    }
}
