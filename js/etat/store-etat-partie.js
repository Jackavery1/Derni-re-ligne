import { store } from './store-core.js';

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
