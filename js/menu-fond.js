import { TETROMINOS } from './config.js';
import { obtenirEffetsReduits } from './store-jeu.js';
import { obtenirCouleurPieceParType } from './piece-jeu.js';
import { obtenirActions } from './actions-jeu.js';
import { obtenirCanvas } from './dom-utils.js';

let canvasMenuFond = null;
let ctxMenuFond = null;
const piecesFond = [];
export let menuAnimActif = false;

function obtenirCanvasMenuFond() {
    if (typeof document === 'undefined') return null;
    if (!canvasMenuFond) {
        canvasMenuFond = obtenirCanvas('canvas-menu-fond');
        ctxMenuFond = canvasMenuFond ? canvasMenuFond.getContext('2d') : null;
    }
    return canvasMenuFond;
}

function obtenirDimensionsMenuFond() {
    const ecran = document.getElementById('ecran-titre');
    if (ecran) {
        return { w: ecran.clientWidth, h: ecran.clientHeight };
    }
    return { w: window.innerWidth, h: window.innerHeight };
}

function creerPieceFond(posYAleatoire = false) {
    obtenirCanvasMenuFond();
    const types = Object.keys(TETROMINOS);
    const type = types[Math.floor(Math.random() * types.length)];
    const nbRots = TETROMINOS[type].rotations.length;
    const rot = Math.floor(Math.random() * nbRots);
    const taille = Math.random() * 18 + 12;
    const { w, h } = obtenirDimensionsMenuFond();
    return {
        type,
        rot,
        taille,
        x: Math.random() * (w - taille * 4),
        y: posYAleatoire ? Math.random() * h - h * 0.3 : -taille * 5,
        vy: Math.random() * 0.5 + 0.15,
        couleur: obtenirCouleurPieceParType(type),
        opacite: Math.random() * 0.18 + 0.06,
    };
}

export function initPiecesFond() {
    const canvas = obtenirCanvasMenuFond();
    if (!canvas) return;
    const { w, h } = obtenirDimensionsMenuFond();
    canvas.width = w;
    canvas.height = h;
    piecesFond.length = 0;
    for (let i = 0; i < 20; i++) piecesFond.push(creerPieceFond(true));
}

export function mettreAJourMenuFond(deltaTemps) {
    const canvas = obtenirCanvasMenuFond();
    if (!ctxMenuFond || !menuAnimActif || !canvas) return;

    const { w, h } = obtenirDimensionsMenuFond();
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }

    ctxMenuFond.clearRect(0, 0, canvas.width, canvas.height);

    const facteur = Math.max(0.5, deltaTemps / 16);
    for (let i = piecesFond.length - 1; i >= 0; i--) {
        const pf = piecesFond[i];
        pf.y += pf.vy * facteur;

        if (pf.y > canvas.height + pf.taille * 5) {
            piecesFond[i] = creerPieceFond(false);
            continue;
        }

        const forme = TETROMINOS[pf.type].rotations[pf.rot];
        ctxMenuFond.save();
        ctxMenuFond.globalAlpha = pf.opacite;
        ctxMenuFond.fillStyle = pf.couleur;
        if (!obtenirEffetsReduits()) {
            ctxMenuFond.shadowColor = pf.couleur;
            ctxMenuFond.shadowBlur = 8;
        }

        for (let l = 0; l < forme.length; l++) {
            for (let c = 0; c < forme[l].length; c++) {
                if (!forme[l][c]) continue;
                const m = 1.5;
                const t = pf.taille;
                ctxMenuFond.fillRect(pf.x + c * t + m, pf.y + l * t + m, t - m * 2, t - m * 2);
            }
        }
        ctxMenuFond.restore();
    }
}

export function demarrerAnimationMenu() {
    if (menuAnimActif) return;
    menuAnimActif = true;
    if (piecesFond.length === 0) initPiecesFond();
    obtenirActions().planifierBoucle?.();
}

export function arreterAnimationMenu() {
    menuAnimActif = false;
}

export { obtenirCanvasMenuFond };
