import { CONFIG, TETROMINOS } from './config.js';
import { creerPlateau, obtenirCouleurPieceParType, obtenirForme } from './piece-jeu.js';
import { estPositionValidePiece } from './moteur-piece.js';
import { creerParticulesExplosion } from './particules-jeu.js';
import { emettre } from './bus-jeu.js';

export const archi = {
    actif: false,
    niveauActuel: null,
    plateau: [],
    pieceActuelle: null,
    inventaire: [],
    piecesUtilisees: 0,
    estEnCours: false,
    estEnPause: false,
    scorePartie: 0,
    silhouetteParsee: [],
    offsetLigne: 0,
    offsetColonne: 0,
    precisionActuelle: 0,
    efficaciteActuelle: 0,
};

export const historiqueArchi = [];

export function modeArchiActif() {
    return archi.actif;
}

/** @param {import('./archi-donnees.js').NiveauArchi} niveau */
export function archi_parserSilhouette(niveau) {
    const sil = Array.from({ length: CONFIG.lignes }, () => Array(CONFIG.colonnes).fill(false));
    const lignes = niveau.silhouette;
    const hauteur = lignes.length;
    const largeur = lignes[0].length;
    const offL = CONFIG.lignes - hauteur - 2;
    const offC = Math.floor((CONFIG.colonnes - largeur) / 2);

    lignes.forEach((ligne, l) => {
        [...ligne].forEach((car, c) => {
            const gl = offL + l;
            const gc = offC + c;
            if (gl >= 0 && gl < CONFIG.lignes && gc >= 0 && gc < CONFIG.colonnes) {
                sil[gl][gc] = car === '#';
            }
        });
    });

    archi.silhouetteParsee = sil;
    archi.offsetLigne = offL;
    archi.offsetColonne = offC;
}

export function archi_prochainePiece() {
    const dispo = archi.inventaire.find((p) => p.qteDispo > 0);
    if (!dispo) return null;

    const forme = TETROMINOS[dispo.type].rotations[0];
    return {
        type: dispo.type,
        rotation: 0,
        x: Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2),
        y: 0,
    };
}

export function archi_estPositionValide(piece, dx = 0, dy = 0, rotation = null) {
    return estPositionValidePiece(piece, archi.plateau, dx, dy, rotation);
}

export function archi_calculerScoreTempsReel() {
    let cellulesSil = 0;
    let cellulesCouvertes = 0;
    let cellulesSilDebord = 0;

    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            const dansSil = archi.silhouetteParsee[l][c];
            const remplie = archi.plateau[l][c] !== 0;
            if (dansSil) cellulesSil++;
            if (dansSil && remplie) cellulesCouvertes++;
            if (!dansSil && remplie) cellulesSilDebord++;
        }
    }

    archi.precisionActuelle =
        cellulesSil > 0 ? Math.max(0, (cellulesCouvertes - cellulesSilDebord) / cellulesSil) : 0;

    const parPieces = archi.niveauActuel?.parPieces ?? 1;
    archi.efficaciteActuelle =
        archi.piecesUtilisees > 0 ? Math.min(1, parPieces / archi.piecesUtilisees) : 1;

    archi.scorePartie = Math.round(
        (archi.precisionActuelle * 0.7 + archi.efficaciteActuelle * 0.3) * 1000
    );
}

export function archi_sauvegarderSnapshot() {
    if (!archi.pieceActuelle) return;
    if (historiqueArchi.length >= 5) historiqueArchi.shift();
    historiqueArchi.push({
        plateau: archi.plateau.map((l) => [...l]),
        inventaire: archi.inventaire.map((p) => ({ ...p })),
        piecesUtilisees: archi.piecesUtilisees,
        pieceActuelle: { ...archi.pieceActuelle },
    });
}

export function archi_verrouillerPiece() {
    if (!archi.pieceActuelle) return false;

    archi_sauvegarderSnapshot();

    const piece = archi.pieceActuelle;
    const forme = obtenirForme(piece);
    const couleur = obtenirCouleurPieceParType(piece.type);

    forme.forEach((l, li) =>
        l.forEach((c, ci) => {
            if (!c) return;
            const y = piece.y + li;
            const x = piece.x + ci;
            if (y >= 0 && y < CONFIG.lignes && x >= 0 && x < CONFIG.colonnes) {
                archi.plateau[y][x] = couleur;
            }
        })
    );

    archi.piecesUtilisees++;

    const item = archi.inventaire.find((p) => p.type === piece.type);
    if (item) item.qteDispo--;

    forme.forEach((l, li) =>
        l.forEach((c, ci) => {
            if (!c) return;
            const y = piece.y + li;
            const x = piece.x + ci;
            if (archi.silhouetteParsee[y]?.[x]) {
                creerParticulesExplosion(x, y, couleur);
            }
        })
    );

    archi_calculerScoreTempsReel();
    emettre('piece:son', { type: 'verrou' });

    const restantes = archi.inventaire.reduce((s, p) => s + p.qteDispo, 0);
    if (restantes === 0) {
        return 'termine';
    }

    archi.pieceActuelle = archi_prochainePiece();
    return 'continue';
}

export function archi_tourner(sens) {
    const p = archi.pieceActuelle;
    if (!p) return;
    const nbR = TETROMINOS[p.type].rotations.length;
    const newR = (((p.rotation + sens) % nbR) + nbR) % nbR;
    const offs = [0, 1, -1, 2, -2];
    for (const off of offs) {
        if (archi_estPositionValide(p, off, 0, newR)) {
            p.rotation = newR;
            p.x += off;
            emettre('piece:son', { type: 'rotation' });
            return;
        }
    }
}

export function archi_descendreEnBas() {
    const p = archi.pieceActuelle;
    if (!p) return;
    while (archi_estPositionValide(p, 0, 1)) p.y++;
    emettre('piece:son', { type: 'chute' });
}

export function archi_changerPiece() {
    const typesDispos = archi.inventaire.filter((p) => p.qteDispo > 0).map((p) => p.type);
    if (typesDispos.length === 0) return;

    const idxActuel = typesDispos.indexOf(archi.pieceActuelle?.type);
    const nextIdx = (idxActuel + 1) % typesDispos.length;
    const nextType = typesDispos[nextIdx];
    const forme = TETROMINOS[nextType].rotations[0];

    archi.pieceActuelle = {
        type: nextType,
        rotation: 0,
        x: Math.floor(CONFIG.colonnes / 2) - Math.floor(forme[0].length / 2),
        y: archi.pieceActuelle?.y ?? 0,
    };
}

export function archi_annuler() {
    if (historiqueArchi.length === 0) return;
    const snap = historiqueArchi.pop();
    archi.plateau = snap.plateau;
    archi.inventaire = snap.inventaire;
    archi.piecesUtilisees = snap.piecesUtilisees;
    archi.pieceActuelle = snap.pieceActuelle;
    archi_calculerScoreTempsReel();
}

export function archi_reinitialiserEtatNiveau() {
    historiqueArchi.length = 0;
    archi.plateau = creerPlateau();
    archi.piecesUtilisees = 0;
    archi.estEnCours = true;
    archi.estEnPause = false;
    archi.scorePartie = 0;
    archi.precisionActuelle = 0;
    archi.efficaciteActuelle = 0;
    archi.inventaire = archi.niveauActuel.pieces.map((p) => ({
        type: p.type,
        qte: p.qte,
        qteDispo: p.qte,
    }));
    archi.pieceActuelle = archi_prochainePiece();
}

export function archi_calculerEtoiles(score) {
    if (score >= 850) return 3;
    if (score >= 650) return 2;
    if (score >= 400) return 1;
    return 0;
}
