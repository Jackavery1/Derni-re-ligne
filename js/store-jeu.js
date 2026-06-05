import { TOUCHES_DEFAUT } from './config.js';
import { ECRANS } from './ecrans-config.js';

export { ECRANS };

export const MAX_PARTICULES = 280;
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

const store = {
    biomeActif: 'classique',
    niveauGlobal: 0,
    compteurPieces: 0,
    seuilProchRelique: 0,
    reliqueEnAttente: false,
    reliqueActive: null,
    ecranActuel: ECRANS.TITRE,
    transitionAlpha: 1,
    transitionDebut: 0,
    tempsAmbianceDecor: 0,
    couleurAmbRgb: [0, 245, 255],
    derniereSecondeTemps: -1,
    sacPieces: [],
    lockDelayRestant: 0,
    nbLockResets: 0,
    pieceAuSol: false,
    dasEtat: {
        [TOUCHES_DEFAUT.gauche]: { moment: 0, repete: false },
        [TOUCHES_DEFAUT.droite]: { moment: 0, repete: false },
        [TOUCHES_DEFAUT.bas]: { moment: 0, repete: false },
    },
    prefererMoinsAnimations: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    fpsMoyen: 60,
    effetsReduits: false,
    idFrame: null,
    boucleActive: false,
    canvasPlateau: null,
    ctx: null,
    canvasPreview: null,
    ctxPreview: null,
    canvasReserve: null,
    ctxReserve: null,
    touchDepart: null,
    dernierTimestamp: 0,
    accumulateur: 0,
    etat: {
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
    },
    particules: [],
    particulesAmbiance: [],
    textesFlottants: [],
    secousse: { timer: 0, intensite: 0, duree: 260 },
    flashVerrou: { cellules: [], timer: 0, duree: 75 },
    flashLignes: { lignes: [], timer: 0, duree: 160 },
    touchesActives: {},
};

export const etat = store.etat;
export const particules = store.particules;
export const particulesAmbiance = store.particulesAmbiance;
export const textesFlottants = store.textesFlottants;
export const secousse = store.secousse;
export const flashVerrou = store.flashVerrou;
export const flashLignes = store.flashLignes;
export const touchesActives = store.touchesActives;
export const couleurAmbRgb = store.couleurAmbRgb;
export const dasEtat = store.dasEtat;

export function obtenirBiomeActif() {
    return store.biomeActif;
}
export function obtenirNiveauGlobal() {
    return store.niveauGlobal;
}
export function obtenirCompteurPieces() {
    return store.compteurPieces;
}
export function obtenirSeuilProchRelique() {
    return store.seuilProchRelique;
}
export function obtenirReliqueEnAttente() {
    return store.reliqueEnAttente;
}
export function obtenirReliqueActive() {
    return store.reliqueActive;
}
export function obtenirEcranActuel() {
    return store.ecranActuel;
}
export function obtenirTransitionAlpha() {
    return store.transitionAlpha;
}
export function obtenirTransitionDebut() {
    return store.transitionDebut;
}
export function obtenirTempsAmbianceDecor() {
    return store.tempsAmbianceDecor;
}
export function obtenirTouchDepart() {
    return store.touchDepart;
}
export function obtenirLockDelayRestant() {
    return store.lockDelayRestant;
}
export function obtenirNbLockResets() {
    return store.nbLockResets;
}
export function obtenirPieceAuSol() {
    return store.pieceAuSol;
}
export function obtenirSacPieces() {
    return store.sacPieces;
}
export function obtenirEffetsReduits() {
    return store.effetsReduits;
}
export function obtenirFpsMoyen() {
    return store.fpsMoyen;
}
export function obtenirIdFrame() {
    return store.idFrame;
}
export function obtenirBoucleActive() {
    return store.boucleActive;
}
export function obtenirCanvasPlateau() {
    return store.canvasPlateau;
}
export function obtenirCtx() {
    return store.ctx;
}
export function obtenirCanvasPreview() {
    return store.canvasPreview;
}
export function obtenirCtxPreview() {
    return store.ctxPreview;
}
export function obtenirCanvasReserve() {
    return store.canvasReserve;
}
export function obtenirCtxReserve() {
    return store.ctxReserve;
}
export function obtenirDernierTimestamp() {
    return store.dernierTimestamp;
}
export function obtenirAccumulateur() {
    return store.accumulateur;
}
export function obtenirDerniereSecondeTemps() {
    return store.derniereSecondeTemps;
}
export function obtenirPrefererMoinsAnimations() {
    return store.prefererMoinsAnimations;
}

export function definirBiomeActif(v) {
    store.biomeActif = v;
}
export function definirNiveauGlobal(v) {
    store.niveauGlobal = v;
}
export function ajouterNiveauGlobal(d) {
    store.niveauGlobal += d;
}
export function definirReliqueActive(v) {
    store.reliqueActive = v;
}
export function definirReliqueEnAttente(v) {
    store.reliqueEnAttente = v;
}
export function definirCompteurPieces(v) {
    store.compteurPieces = v;
}
export function incrementerCompteurPieces() {
    store.compteurPieces++;
}
export function definirSeuilProchRelique(v) {
    store.seuilProchRelique = v;
}
export function definirEcranActuel(v) {
    store.ecranActuel = v;
}
export function definirTransitionAlpha(v) {
    store.transitionAlpha = v;
}
export function definirTransitionDebut(v) {
    store.transitionDebut = v;
}
export function definirCouleurAmbRgb([r, g, b]) {
    store.couleurAmbRgb[0] = r;
    store.couleurAmbRgb[1] = g;
    store.couleurAmbRgb[2] = b;
}
export function definirDerniereSecondeTemps(v) {
    store.derniereSecondeTemps = v;
}
export function definirLockDelayRestant(v) {
    store.lockDelayRestant = v;
}
export function definirNbLockResets(v) {
    store.nbLockResets = v;
}
export function definirPieceAuSol(v) {
    store.pieceAuSol = v;
}
export function definirFpsMoyen(v) {
    store.fpsMoyen = v;
}
export function definirEffetsReduits(v) {
    store.effetsReduits = v;
}
export function definirIdFrame(v) {
    store.idFrame = v;
}
export function definirBoucleActive(v) {
    store.boucleActive = v;
}
export function definirDernierTimestamp(v) {
    store.dernierTimestamp = v;
}
export function definirAccumulateur(v) {
    store.accumulateur = v;
}
export function definirTouchDepart(v) {
    store.touchDepart = v;
}
export function reinitialiserTempsAmbianceDecor() {
    store.tempsAmbianceDecor = 0;
}
export function ajouterTempsAmbianceDecor(dt) {
    store.tempsAmbianceDecor += dt;
}
export function definirRefsCanvas(refs) {
    store.canvasPlateau = refs.canvasPlateau;
    store.ctx = refs.ctx;
    store.canvasPreview = refs.canvasPreview;
    store.ctxPreview = refs.ctxPreview;
    store.canvasReserve = refs.canvasReserve;
    store.ctxReserve = refs.ctxReserve;
}
