import { BIOMES } from './config/config.js';
import { obtenirBiomeActif } from './etat/store-jeu.js';
import { modeHistoireEnCours } from './etat/mode-histoire.js';

export function biomeActuelMecanique() {
    if (!modeHistoireEnCours()) return null;
    return BIOMES[obtenirBiomeActif()]?.mecaniqueSpeciale ?? null;
}

export function biomeActuelEstMiroir() {
    const mec = biomeActuelMecanique();
    return mec === 'miroir' || mec === 'paradoxe';
}

export function biomeActuelEstVide() {
    const mec = biomeActuelMecanique();
    return mec === 'vide' || mec === 'paradoxe';
}
