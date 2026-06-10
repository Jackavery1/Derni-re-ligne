import { etat, obtenirCtxPreview, obtenirCanvasPreview } from './store-jeu.js';
import { obtenirForme, obtenirCouleurPiece } from './piece-jeu.js';
import { dessinerCellule } from './rendu-cellule.js';
import { dessinerMotifsPreview } from './rendu-accessibilite.js';

export function dessinerPreview(ctx2d, canvasEl, piece) {
    const tailleCell = 23;
    ctx2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (!piece) return;
    dessinerPieceDansPreview(ctx2d, canvasEl, piece, 0, canvasEl.height, tailleCell);
}

function dessinerPieceDansPreview(ctx2d, canvasEl, piece, slotY, slotHauteur, tailleCell) {
    const forme = obtenirForme(piece);
    const couleur = obtenirCouleurPiece(piece);
    const largeur = forme[0].length;
    const hauteur = forme.length;
    const offsetX = Math.floor((canvasEl.width / tailleCell - largeur) / 2);
    const offsetY = slotY + Math.floor((slotHauteur / tailleCell - hauteur) / 2);
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            dessinerCellule(ctx2d, offsetX + c, offsetY + l, couleur, tailleCell);
        }
    }
    dessinerMotifsPreview(ctx2d, piece, offsetX, offsetY, tailleCell);
}

export function dessinerFileNext() {
    const tailleCell = 18;
    const espacement = 68;
    obtenirCtxPreview().clearRect(
        0,
        0,
        obtenirCanvasPreview().width,
        obtenirCanvasPreview().height
    );

    if (!etat.filePieces || etat.filePieces.length === 0) return;

    etat.filePieces.slice(0, 3).forEach((piece, index) => {
        if (!piece) return;
        const forme = obtenirForme(piece);
        const couleur = obtenirCouleurPiece(piece);
        const largeur = forme[0].length;
        const offsetX = Math.floor((obtenirCanvasPreview().width / tailleCell - largeur) / 2);
        const offsetY = Math.floor((espacement * index) / tailleCell) + 1;

        for (let l = 0; l < forme.length; l++) {
            for (let c = 0; c < forme[l].length; c++) {
                if (!forme[l][c]) continue;
                dessinerCellule(obtenirCtxPreview(), offsetX + c, offsetY + l, couleur, tailleCell);
            }
        }
        dessinerMotifsPreview(obtenirCtxPreview(), piece, offsetX, offsetY, tailleCell);
    });
}
