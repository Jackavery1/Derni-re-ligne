import { CONFIG, TETROMINOS, BIOMES, RELIQUES } from './config.js';
import { remplirSac as genererSac } from './logique-pure.js';
import { extraireForme, estPositionValideSurPlateau } from './moteur-piece.js';
import { obtenirActions } from './actions-jeu.js';
import {
    etat,
    dasEtat,
    touchesActives,
    obtenirBiomeActif,
    obtenirSacPieces,
    obtenirReliqueEnAttente,
    obtenirNbLockResets,
    obtenirPieceAuSol,
    obtenirCanvasPreview,
    definirReliqueActive,
    definirLockDelayRestant,
    definirNbLockResets,
} from './store-jeu.js';
import { obtenirTouches } from './touches-config.js';

const INDEX_COULEUR_PIECE = { I: 0, O: 1, T: 2, S: 3, Z: 4, J: 5, L: 6 };

export function obtenirCouleurPieceParType(type) {
    const biome = BIOMES[obtenirBiomeActif()] ?? BIOMES.classique;
    const index = INDEX_COULEUR_PIECE[type];
    return biome.couleursBlocs[index] ?? biome.couleursBlocs[0];
}

/** @deprecated Utiliser obtenirCouleurPieceParType — alias conserve pour compatibilite tests */
export const getCouleurPiece = obtenirCouleurPieceParType;

export function lierCouleursTetrominos() {
    for (const type of Object.keys(TETROMINOS)) {
        Object.defineProperty(TETROMINOS[type], 'couleur', {
            get: () => obtenirCouleurPieceParType(type),
            enumerable: true,
            configurable: true,
        });
    }
}

export function creerPlateau() {
    return Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
}

export function remplirSac() {
    const sacPieces = obtenirSacPieces();
    sacPieces.length = 0;
    sacPieces.push(...genererSac());
}

export function creerPieceRelique(relique) {
    const forme = relique.forme;
    return {
        type: 'O',
        rotation: 0,
        x: Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2),
        y: 0,
        reliqueForme: forme.map((ligne) => [...ligne]),
        reliqueData: relique,
    };
}

export function genererProchainePiece() {
    const sacPieces = obtenirSacPieces();
    if (sacPieces.length === 0) remplirSac();
    const type = sacPieces.pop();
    const forme = TETROMINOS[type].rotations[0];
    return {
        type,
        rotation: 0,
        x: Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2),
        y: 0,
    };
}

export function activerReliqueSurPiece(piece) {
    if (piece?.reliqueData) {
        definirReliqueActive(piece.reliqueData);
    }
}

export function mettreAJourIndicateurRelique() {
    const indic = document.getElementById('indicateur-relique');
    const reliqueEnAttente = obtenirReliqueEnAttente();
    const prochaineRelique = reliqueEnAttente
        ? (RELIQUES[obtenirBiomeActif()] ?? RELIQUES.classique)
        : etat.filePieces[0]?.reliqueData;
    const canvasPreview = obtenirCanvasPreview();
    if (canvasPreview) {
        canvasPreview.classList.toggle('relique-imminente', !!prochaineRelique);
    }
    if (!indic) return;
    if (prochaineRelique) {
        indic.style.display = 'block';
        indic.style.color = prochaineRelique.couleur;
        const iconeEl = document.getElementById('relique-icone');
        const nomEl = document.getElementById('relique-nom');
        if (iconeEl) iconeEl.textContent = prochaineRelique.icone + ' ';
        if (nomEl) nomEl.textContent = prochaineRelique.nom;
    } else {
        indic.style.display = 'none';
    }
}

export function reinitialiserLockDelay() {
    if (obtenirPieceAuSol() && obtenirNbLockResets() < CONFIG.maxLockResets) {
        definirLockDelayRestant(CONFIG.lockDelay);
        definirNbLockResets(obtenirNbLockResets() + 1);
    }
}

export function reinitialiserDas(code) {
    if (!dasEtat[code]) dasEtat[code] = { moment: 0, repete: false };
    dasEtat[code].moment = 0;
    dasEtat[code].repete = false;
}

export function mettreAJourDas(deltaTemps) {
    const actions = obtenirActions();
    const touches = obtenirTouches();
    const actionMap = {
        [touches.gauche]: actions.deplacerGauche,
        [touches.droite]: actions.deplacerDroite,
        [touches.bas]: actions.deplacerBas,
    };
    for (const [code, action] of Object.entries(actionMap)) {
        if (!code || code === 'undefined' || !touchesActives[code] || !action) continue;
        if (!dasEtat[code]) dasEtat[code] = { moment: 0, repete: false };
        const das = dasEtat[code];
        das.moment += deltaTemps;
        if (!das.repete && das.moment >= CONFIG.dasDelai) {
            das.repete = true;
            das.moment = 0;
            action();
        } else if (das.repete && das.moment >= CONFIG.arrInterval) {
            das.moment = 0;
            action();
        }
    }
}

export function obtenirForme(piece) {
    return extraireForme(piece);
}

export function obtenirCouleurPiece(piece) {
    if (piece?.reliqueData) return piece.reliqueData.couleur;
    return obtenirCouleurPieceParType(piece.type);
}

export function estPositionValide(piece, dx = 0, dy = 0, rotation = null) {
    if (!piece) return false;
    const forme = extraireForme(piece, rotation);
    return estPositionValideSurPlateau(etat.plateau, piece, forme, dx, dy);
}

export function calculerDistanceChute(piece) {
    let distance = 0;
    while (estPositionValide(piece, 0, distance + 1)) distance++;
    return distance;
}

/** @returns {[number, number, number]} */
export function hexVersRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
