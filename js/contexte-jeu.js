import { TOUCHES_DEFAUT } from './config.js';

export const ECRANS = {
    TITRE: 'ecran-titre',
    SELECTION: 'ecran-selection',
    OPTIONS: 'ecran-options',
    PAUSE: 'ecran-pause',
    GAME_OVER: 'ecran-game-over',
};

export let biomeActif = 'classique';
export let niveauGlobal = 0;

export let compteurPieces = 0;
export let seuilProchRelique = 0;
export let reliqueEnAttente = false;
export let reliqueActive = null;

export let ecranActuel = ECRANS.TITRE;
export const MAX_PARTICULES = 280;

export const etat = {
    plateau: [],
    pieceActuelle: null,
    filePieces: [],
    pieceEnReserve: null,
    reserveUtilisee: false,
    score: 0,
    lignes: 0,
    niveau: 1,
    estEnCours: false,
    estEnPause: false,
    humeur: 'neutre',
    combo: 0,
    dernierEtaitTetris: false,
    tempsDebut: null,
    tempsPauseAccumule: 0,
    tempsPauseDebut: null,
    modeJeu: 'marathon',
    victoireSprint: false,
};

export const particules = [];
export const particulesAmbiance = [];
export const textesFlottants = [];
export let transitionAlpha = 1;
export let transitionDebut = 0;
export let tempsAmbianceDecor = 0;
export const DUREE_TRANSITION = 400;
export const NB_PARTICULES_AMBIANCE = {
    classique: 0,
    lave: 30,
    ocean: 32,
    foret: 28,
    glace: 32,
    desert: 28,
    cyber: 30,
    fuochi: 30,
    cosmos: 32,
};
export const CARACTERES_HEX = '0123456789ABCDEF';
export const VERTS_FORET = ['#00cc44', '#55dd00', '#88ff00', '#66bb00', '#aaee44'];
export let couleurAmbRgb = [0, 245, 255];
export const secousse = { timer: 0, intensite: 0, duree: 260 };
export const flashVerrou = { cellules: [], timer: 0, duree: 75 };
export const flashLignes = { lignes: [], timer: 0, duree: 160 };
export let derniereSecondeTemps = -1;
export let sacPieces = [];
export let lockDelayRestant = 0;
export let nbLockResets = 0;
export let pieceAuSol = false;
export let dasEtat = {
    [TOUCHES_DEFAUT.gauche]: { moment: 0, repete: false },
    [TOUCHES_DEFAUT.droite]: { moment: 0, repete: false },
    [TOUCHES_DEFAUT.bas]: { moment: 0, repete: false },
};
export const prefererMoinsAnimations = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;
export let fpsMoyen = 60;
export let effetsReduits = false;
export let idFrame = null;
export let boucleActive = false;

export let canvasPlateau = null;
export let ctx = null;
export let canvasPreview = null;
export let ctxPreview = null;
export let canvasReserve = null;
export let ctxReserve = null;
export let touchDepart = null;

export let dernierTimestamp = 0;
export let accumulateur = 0;

export const touchesActives = {};

export function definirBiomeActif(v) {
    biomeActif = v;
}
export function definirNiveauGlobal(v) {
    niveauGlobal = v;
}
export function ajouterNiveauGlobal(d) {
    niveauGlobal += d;
}
export function definirReliqueActive(v) {
    reliqueActive = v;
}
export function definirReliqueEnAttente(v) {
    reliqueEnAttente = v;
}
export function definirCompteurPieces(v) {
    compteurPieces = v;
}
export function incrementerCompteurPieces() {
    compteurPieces++;
}
export function definirSeuilProchRelique(v) {
    seuilProchRelique = v;
}
export function definirEcranActuel(v) {
    ecranActuel = v;
}
export function definirTransitionAlpha(v) {
    transitionAlpha = v;
}
export function definirTransitionDebut(v) {
    transitionDebut = v;
}
export function definirCouleurAmbRgb([r, g, b]) {
    couleurAmbRgb[0] = r;
    couleurAmbRgb[1] = g;
    couleurAmbRgb[2] = b;
}
export function definirDerniereSecondeTemps(v) {
    derniereSecondeTemps = v;
}
export function definirLockDelayRestant(v) {
    lockDelayRestant = v;
}
export function definirNbLockResets(v) {
    nbLockResets = v;
}
export function definirPieceAuSol(v) {
    pieceAuSol = v;
}
export function definirFpsMoyen(v) {
    fpsMoyen = v;
}
export function definirEffetsReduits(v) {
    effetsReduits = v;
}
export function definirIdFrame(v) {
    idFrame = v;
}
export function definirBoucleActive(v) {
    boucleActive = v;
}
export function definirDernierTimestamp(v) {
    dernierTimestamp = v;
}
export function definirAccumulateur(v) {
    accumulateur = v;
}
export function definirTouchDepart(v) {
    touchDepart = v;
}
export function reinitialiserTempsAmbianceDecor() {
    tempsAmbianceDecor = 0;
}
export function ajouterTempsAmbianceDecor(dt) {
    tempsAmbianceDecor += dt;
}
export function definirRefsCanvas(refs) {
    canvasPlateau = refs.canvasPlateau;
    ctx = refs.ctx;
    canvasPreview = refs.canvasPreview;
    ctxPreview = refs.ctxPreview;
    canvasReserve = refs.canvasReserve;
    ctxReserve = refs.ctxReserve;
}
