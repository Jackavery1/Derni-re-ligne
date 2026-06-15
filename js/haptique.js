/** Retour haptique (Vibration API) — respecte effets réduits et préférence joueur. */
import { ecouter } from './bus-jeu.js';
import { obtenirReduireEffetsAccessibilite } from './accessibilite.js';
import { lireStockage, ecrireStockage } from './progression-stockage.js';

const CLE_HAPTIQUE = 'derniereLigne_haptique';

const MOTIFS = {
    deplacement: 8,
    rotation: 12,
    chute: 18,
    verrou: 14,
    ligne: [10, 30, 10],
    tetris: [15, 40, 15, 40, 20],
    gameOver: [80, 50, 80],
    victoire: [20, 30, 20, 30, 40],
};

let initialises = false;

export function haptiqueActif() {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
    if (obtenirReduireEffetsAccessibilite()) return false;
    return lireStockage(CLE_HAPTIQUE, 'true') !== 'false';
}

export function definirHaptiqueActif(actif) {
    ecrireStockage(CLE_HAPTIQUE, actif ? 'true' : 'false');
}

export function vibrer(type) {
    if (!haptiqueActif()) return;
    const motif = MOTIFS[type];
    if (motif === undefined) return;
    try {
        navigator.vibrate(motif);
    } catch {
        /* API indisponible */
    }
}

export function initialiserHaptique() {
    if (initialises || typeof window === 'undefined') return;
    initialises = true;

    ecouter('piece:son', ({ type }) => {
        if (type === 'deplacement') vibrer('deplacement');
        else if (type === 'verrou') vibrer('verrou');
    });

    ecouter('lignes:effacees', ({ nbSupprimees }) => {
        if (nbSupprimees >= 4) vibrer('tetris');
        else if (nbSupprimees > 0) vibrer('ligne');
    });
}

export function vibrerRotation() {
    vibrer('rotation');
}

export function vibrerChuteRapide() {
    vibrer('chute');
}

export function vibrerFinPartie(victoire) {
    vibrer(victoire ? 'victoire' : 'gameOver');
}
