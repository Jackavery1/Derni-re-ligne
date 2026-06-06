import { etat } from './store-jeu.js';

const NOMS_PIECES = {
    I: 'barre',
    O: 'carré',
    T: 'T',
    S: 'S',
    Z: 'Z',
    J: 'J',
    L: 'L',
};

export function annoncer(texte) {
    const el = document.getElementById('annonce-jeu');
    if (el) el.textContent = texte;
}

/** @param {{ type: string, x?: number, y?: number } | null | undefined} piece */
export function annoncerPieceActive(piece) {
    if (!piece) return;
    const nom = NOMS_PIECES[piece.type] ?? piece.type;
    const colonne = typeof piece.x === 'number' ? piece.x + 1 : null;
    const ligne = typeof piece.y === 'number' ? piece.y + 1 : null;
    if (colonne !== null && ligne !== null) {
        annoncer(`Pièce ${nom}, colonne ${colonne}, ligne ${ligne}`);
        return;
    }
    annoncer(`Nouvelle pièce ${nom}`);
}

export function annoncerPieceCourante() {
    annoncerPieceActive(etat.pieceActuelle);
}
