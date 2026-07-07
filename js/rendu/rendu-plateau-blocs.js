/** Blocs verrouillés et overlays mécaniques sur le plateau. */
import { CONFIG } from '../config/config.js';
import { etat, obtenirCtx } from '../etat/store-jeu.js';
import { dessinerCellule } from './rendu-cellule.js';
import { celluleEstRouillee } from '../histoire/mecaniques-histoire.js';

function dessinerOverlayRouille(c, l) {
    const ctx = obtenirCtx();
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = '#5c2a00';
    ctx.fillRect(
        c * CONFIG.taille + 2,
        l * CONFIG.taille + 2,
        CONFIG.taille - 4,
        CONFIG.taille - 4
    );
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#8b3a00';
    const graine = c * 31 + l * 17;
    for (let i = 0; i < 4; i++) {
        const rx = (((graine + i * 13) % 7) / 7) * (CONFIG.taille - 6) + 1;
        const ry = (((graine + i * 19) % 7) / 7) * (CONFIG.taille - 6) + 1;
        ctx.fillRect(c * CONFIG.taille + rx, l * CONFIG.taille + ry, 3, 3);
    }
    ctx.restore();
}

export function dessinerBlocsVerrouilles() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (!etat.plateau[l][c]) continue;
            dessinerCellule(obtenirCtx(), c, l, etat.plateau[l][c]);
            if (celluleEstRouillee(c, l)) {
                dessinerOverlayRouille(c, l);
            }
        }
    }
}
