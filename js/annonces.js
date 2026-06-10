import { etat } from './store-jeu.js';
import { sansAccentsE } from './texte-jeu.js';

const NOMS_PIECES = {
    I: 'barre',
    O: 'carre',
    T: 'T',
    S: 'S',
    Z: 'Z',
    J: 'J',
    L: 'L',
};

export function annoncer(texte) {
    const el = document.getElementById('annonce-jeu');
    if (el) el.textContent = sansAccentsE(texte);
}

/** @param {{ type: string, x?: number, y?: number } | null | undefined} piece */
export function annoncerPieceActive(piece) {
    if (!piece) return;
    const nom = NOMS_PIECES[piece.type] ?? piece.type;
    const colonne = typeof piece.x === 'number' ? piece.x + 1 : null;
    const ligne = typeof piece.y === 'number' ? piece.y + 1 : null;
    if (colonne !== null && ligne !== null) {
        annoncer(`Piece ${nom}, colonne ${colonne}, ligne ${ligne}`);
        return;
    }
    annoncer(`Nouvelle piece ${nom}`);
}

export function annoncerPieceCourante() {
    annoncerPieceActive(etat.pieceActuelle);
}
