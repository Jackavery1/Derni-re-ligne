import { assurerFragmentsPartie } from '../ui/charger-ecrans.js';
import { assurerCanvasPartie } from '../logique/partie-canvas.js';
import { chargerDifficulteMondes } from './difficulte-mondes-chargement.js';
import { chargerAchievementsDonnees } from '../achievements/achievements-donnees-chargement.js';
import { lierCouleursTetrominos } from '../logique/piece-jeu.js';

/** @type {Promise<void> | null} */
let _prefetchPromise = null;

/** Précharge fragments partie + JSON métier (idempotent). */
export function prefetchRessourcesPartie() {
    if (!_prefetchPromise) {
        _prefetchPromise = Promise.all([
            assurerFragmentsPartie(),
            chargerDifficulteMondes(),
            chargerAchievementsDonnees(),
        ])
            .then(() => {
                if (assurerCanvasPartie()) lierCouleursTetrominos();
            })
            .then(() => undefined);
    }
    return _prefetchPromise;
}

/** Garantit que la partie peut démarrer (fragments DOM + données). */
export function assurerRessourcesPartie() {
    return prefetchRessourcesPartie();
}
