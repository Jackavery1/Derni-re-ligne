import { BIOMES } from './config.js';
import { obtenirBiomeActif } from './store-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';

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
