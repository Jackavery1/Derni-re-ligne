import { configurerEvenementsConstellation } from './constellation-evenements.js';

export const constellationEtoiles = [];
export const constellationNoeuds = [];

let biomeHover = null;
let biomeChoisi = null;
let panConstellationX = 0;
let panConstellationY = 0;
/** @type {{ x: number, y: number, panX: number, panY: number } | null} */
let glissadeConstellation = null;
let glissadeEnCours = false;
let sourisCX = 0;
let sourisCY = 0;
let canvasConst = null;
let ctxConst = null;
let evenementsOk = false;
let selectBiomesOk = false;
let evenementEscapeOk = false;

/** @param {() => boolean} panneauBiomeEstOuvert @param {() => void} masquerInfoBiome @param {(id: string) => void} mettreAJourInfoBiome @param {Function} traiterSelectionNoeud @param {(x: number, y: number) => void} bornesPanConstellation */
export function initialiserConfigurationEvenementsConstellation(
    panneauBiomeEstOuvert,
    masquerInfoBiome,
    mettreAJourInfoBiome,
    traiterSelectionNoeud,
    bornesPanConstellation
) {
    configurerEvenementsConstellation({
        obtenirCanvas: () => canvasConst,
        obtenirNoeuds: () => constellationNoeuds,
        obtenirPanX: () => panConstellationX,
        obtenirPanY: () => panConstellationY,
        definirPan: (x, y) => {
            panConstellationX = x;
            panConstellationY = y;
        },
        bornesPan: bornesPanConstellation,
        obtenirBiomeHover: () => biomeHover,
        definirBiomeHover: (id) => {
            biomeHover = id;
        },
        obtenirBiomeChoisi: () => biomeChoisi,
        definirSouris: (x, y) => {
            sourisCX = x;
            sourisCY = y;
        },
        obtenirEvenementsOk: () => evenementsOk,
        definirEvenementsOk: (ok) => {
            evenementsOk = ok;
        },
        obtenirEscapeOk: () => evenementEscapeOk,
        definirEscapeOk: (ok) => {
            evenementEscapeOk = ok;
        },
        obtenirGlissadeConstellation: () => glissadeConstellation,
        definirGlissadeConstellation: (g) => {
            glissadeConstellation = g;
        },
        obtenirGlissadeEnCours: () => glissadeEnCours,
        definirGlissadeEnCours: (ok) => {
            glissadeEnCours = ok;
        },
        panneauBiomeEstOuvert,
        masquerInfoBiome,
        mettreAJourInfoBiome,
        traiterSelectionNoeud,
    });
}

export function obtenirBiomeHover() {
    return biomeHover;
}
export function definirBiomeHover(id) {
    biomeHover = id;
}
export function obtenirBiomeChoisi() {
    return biomeChoisi;
}
export function definirBiomeChoisi(id) {
    biomeChoisi = id;
}
export function obtenirPanConstellationX() {
    return panConstellationX;
}
export function obtenirPanConstellationY() {
    return panConstellationY;
}
export function definirPanConstellation(x, y) {
    panConstellationX = x;
    panConstellationY = y;
}
export function reinitialiserPanConstellation() {
    panConstellationX = 0;
    panConstellationY = 0;
    glissadeConstellation = null;
    glissadeEnCours = false;
}
export function obtenirSourisCX() {
    return sourisCX;
}
export function obtenirSourisCY() {
    return sourisCY;
}
export function obtenirCanvasConstellation() {
    return canvasConst;
}
export function obtenirCtxConstellation() {
    return ctxConst;
}
export function definirCanvasConstellation(canvas, ctx) {
    canvasConst = canvas;
    ctxConst = ctx;
}
export function selectBiomesClavierEstOk() {
    return selectBiomesOk;
}
export function marquerSelectBiomesClavierOk() {
    selectBiomesOk = true;
}
