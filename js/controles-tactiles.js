import { lireStockage, ecrireStockage } from './progression-stockage.js';

const CLE_CONTROLES_TACTILES = 'derniereLigne_controlesTactiles';

function estEnvironnementTactileParDefaut() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const petitViewport = window.matchMedia('(max-width: 768px), (max-height: 600px)').matches;
    return coarse || petitViewport;
}

export function controlesTactilesActifs() {
    const pref = lireStockage(CLE_CONTROLES_TACTILES, '');
    if (pref === 'true') return true;
    if (pref === 'false') return false;
    return estEnvironnementTactileParDefaut();
}

export function definirControlesTactilesActifs(actif) {
    ecrireStockage(CLE_CONTROLES_TACTILES, actif ? 'true' : 'false');
    appliquerControlesTactilesDepuisStockage();
}

export function appliquerControlesTactilesDepuisStockage() {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('controles-tactiles-actifs', controlesTactilesActifs());
}
