/** Point d'entrée unique pour détecter le mode de jeu actif (solo, coop, archi, histoire). */
import { archi, modeArchiActif } from '../logique/archi-logique.js';
import { coop, modeCoopActif } from '../logique/coop-logique.js';
import { modeHistoireEnCours } from './mode-histoire.js';

export { modeHistoireEnCours };

export const MODES_JEU = Object.freeze({
    SOLO: 'solo',
    COOP: 'coop',
    ARCHI: 'archi',
    HISTOIRE: 'histoire',
});

/** @returns {'solo' | 'coop' | 'archi' | 'histoire'} */
export function obtenirModeActif() {
    if (archi.actif) return MODES_JEU.ARCHI;
    if (coop.actif) return MODES_JEU.COOP;
    if (modeHistoireEnCours()) return MODES_JEU.HISTOIRE;
    return MODES_JEU.SOLO;
}

export function modeArchiEnCours() {
    return archi.actif;
}

export function modeCoopEnCours() {
    return coop.actif;
}

export function modeSoloEnCours() {
    return obtenirModeActif() === MODES_JEU.SOLO;
}

export function partieSpecialiseeActive() {
    return archi.actif || coop.actif;
}

export function boucleSoloActive() {
    return !partieSpecialiseeActive();
}

export { modeArchiActif, archi, modeCoopActif, coop };
