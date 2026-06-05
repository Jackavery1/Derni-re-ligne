import { CONFIG, TETROMINOS, TOUCHES_DEFAUT, BIOMES, RELIQUES } from './config.js';
import { remplirSac as genererSac, estPositionValideAvecForme } from './logique-pure.js';
import { Registre } from './registre-jeu.js';
import {
    etat,
    biomeActif,
    sacPieces,
    reliqueEnAttente,
    nbLockResets,
    pieceAuSol,
    dasEtat,
    canvasPreview,
    touchesActives,
    definirReliqueActive,
    definirLockDelayRestant,
    definirNbLockResets,
} from './contexte-jeu.js';

const INDEX_COULEUR_PIECE = { I: 0, O: 1, T: 2, S: 3, Z: 4, J: 5, L: 6 };

export function getCouleurPiece(type) {
    const biome = BIOMES[biomeActif] ?? BIOMES.classique;
    const index = INDEX_COULEUR_PIECE[type];
    return biome.couleursBlocs[index] ?? biome.couleursBlocs[0];
}

export function lierCouleursTetrominos() {
    for (const type of Object.keys(TETROMINOS)) {
        Object.defineProperty(TETROMINOS[type], 'couleur', {
            get: () => getCouleurPiece(type),
            enumerable: true,
            configurable: true,
        });
    }
}

export function creerPlateau() {
    return Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(0));
}

export function remplirSac() {
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
    const prochaineRelique = reliqueEnAttente
        ? (RELIQUES[biomeActif] ?? RELIQUES.classique)
        : etat.filePieces[0]?.reliqueData;
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
    if (pieceAuSol && nbLockResets < CONFIG.maxLockResets) {
        definirLockDelayRestant(CONFIG.lockDelay);
        definirNbLockResets(nbLockResets + 1);
    }
}

export function reinitialiserDas(code) {
    if (dasEtat[code]) {
        dasEtat[code].moment = 0;
        dasEtat[code].repete = false;
    }
}

export function mettreAJourDas(deltaTemps) {
    const actions = {
        [TOUCHES_DEFAUT.gauche]: Registre.deplacerGauche,
        [TOUCHES_DEFAUT.droite]: Registre.deplacerDroite,
        [TOUCHES_DEFAUT.bas]: Registre.deplacerBas,
    };
    for (const [code, action] of Object.entries(actions)) {
        if (!touchesActives[code] || !action) continue;
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
    if (piece.reliqueForme) return piece.reliqueForme;
    const rotations = TETROMINOS[piece.type].rotations;
    return rotations[piece.rotation % rotations.length];
}

export function obtenirCouleurPiece(piece) {
    if (piece?.reliqueData) return piece.reliqueData.couleur;
    return getCouleurPiece(piece.type);
}

export function estPositionValide(piece, dx = 0, dy = 0, rotation = null) {
    const rotations = TETROMINOS[piece.type].rotations;
    const nbRot = rotations.length;
    const forme =
        rotation !== null ? rotations[((rotation % nbRot) + nbRot) % nbRot] : obtenirForme(piece);
    return estPositionValideAvecForme(etat.plateau, piece, forme, dx, dy);
}

export function calculerDistanceChute(piece) {
    let distance = 0;
    while (estPositionValide(piece, 0, distance + 1)) distance++;
    return distance;
}

export function hexVersRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
