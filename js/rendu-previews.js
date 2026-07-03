import { etat, obtenirCtxPreview, obtenirCanvasPreview } from './store-jeu.js';
import { obtenirForme, obtenirCouleurPiece } from './piece-jeu.js';
import { dessinerCellule } from './rendu-cellule.js';
import { dessinerMotifsPreview } from './rendu-accessibilite.js';

function calculerTailleCell(forme, canvasEl, hauteurSlotPx) {
    const largeur = forme[0].length;
    const hauteur = forme.length;
    const maxCellW = Math.floor(canvasEl.width / largeur);
    const maxCellH = Math.floor(hauteurSlotPx / hauteur);
    return Math.max(1, Math.min(maxCellW, maxCellH, 23));
}

function dessinerPieceDansPreview(ctx2d, canvasEl, piece, slotY, slotHauteurPx) {
    const forme = obtenirForme(piece);
    const couleur = obtenirCouleurPiece(piece);
    const largeur = forme[0].length;
    const hauteur = forme.length;
    const tailleCell = calculerTailleCell(forme, canvasEl, slotHauteurPx);
    const offsetX = Math.floor((canvasEl.width / tailleCell - largeur) / 2);
    const offsetY =
        Math.floor(slotY / tailleCell) + Math.floor((slotHauteurPx / tailleCell - hauteur) / 2);

    ctx2d.save();
    ctx2d.beginPath();
    ctx2d.rect(0, slotY, canvasEl.width, slotHauteurPx);
    ctx2d.clip();

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            dessinerCellule(ctx2d, offsetX + c, offsetY + l, couleur, tailleCell);
        }
    }
    dessinerMotifsPreview(ctx2d, piece, offsetX, offsetY, tailleCell);
    ctx2d.restore();
}

export function dessinerPreview(ctx2d, canvasEl, piece) {
    ctx2d.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (!piece) return;
    dessinerPieceDansPreview(ctx2d, canvasEl, piece, 0, canvasEl.height);
}

export function dessinerFileNext() {
    const canvas = obtenirCanvasPreview();
    const ctx = obtenirCtxPreview();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!etat.filePieces || etat.filePieces.length === 0) return;

    const nbSlots = 3;
    const hauteurSlot = canvas.height / nbSlots;

    etat.filePieces.slice(0, nbSlots).forEach((piece, index) => {
        if (!piece) return;
        dessinerPieceDansPreview(ctx, canvas, piece, index * hauteurSlot, hauteurSlot);
    });
}
