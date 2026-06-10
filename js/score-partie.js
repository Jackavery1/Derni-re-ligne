/** Calcul de score testable (solo, coop, archi). */
import {
    calculerPointsLignes,
    calculerNiveauDepuisLignes,
    calculerPointsTSpin,
} from './logique-pure.js';

/**
 * @param {{ score: number, lignes: number, niveau: number, combo: number, dernierEtaitTetris: boolean }} etatPartie
 * @param {number} nbLignes
 * @param {null | 'mini' | 'full'} [tSpin]
 * @param {{ niveauScore?: number, ignorerLevelUp?: boolean }} [options]
 */
export function appliquerScoreLignes(etatPartie, nbLignes, tSpin = null, options = {}) {
    const niveauScore = options.niveauScore ?? etatPartie.niveau;
    let points = 0;
    let levelUp = false;
    let tetris = false;
    let backToBack = false;

    if (nbLignes === 0) {
        etatPartie.combo = 0;
        if (tSpin) points = calculerPointsTSpin(tSpin, 0, niveauScore);
    } else {
        etatPartie.combo++;
        if (nbLignes === 4) {
            tetris = true;
            backToBack = etatPartie.dernierEtaitTetris;
            etatPartie.dernierEtaitTetris = true;
        } else {
            etatPartie.dernierEtaitTetris = false;
        }

        points = calculerPointsLignes(nbLignes, niveauScore);
        if (etatPartie.combo >= 2) {
            points = Math.floor(points * (1 + 0.25 * (etatPartie.combo - 1)));
        }
        if (backToBack) {
            points = Math.floor(points * 1.5);
        }
        if (tSpin) {
            points += calculerPointsTSpin(tSpin, nbLignes, niveauScore);
        }
    }

    etatPartie.score += points;
    etatPartie.lignes += nbLignes;

    if (!options.ignorerLevelUp) {
        const nouveauNiveau = calculerNiveauDepuisLignes(etatPartie.lignes);
        if (nouveauNiveau > etatPartie.niveau) {
            etatPartie.niveau = nouveauNiveau;
            levelUp = true;
        }
    }

    return { points, combo: etatPartie.combo, tetris, backToBack, levelUp, tSpin };
}
