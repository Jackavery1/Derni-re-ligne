/** Rendu des pièces actives, fantômes et overlays boss sur le plateau. */
import { CONFIG } from './config.js';
import { meteo } from './meteo.js';
import {
    etat,
    obtenirEffetsReduits,
    obtenirPrefererMoinsAnimations,
    obtenirEffetsAccessibiliteReduits,
    obtenirReliqueActive,
    obtenirBiomeActif,
    obtenirCanvasPlateau,
    obtenirCtx,
} from './store-jeu.js';
import { obtenirForme, obtenirCouleurPiece, calculerDistanceChute } from './piece-jeu.js';
import { obtenirFauxFantomeActif, COULEUR_BRAISE } from './boss-jeu.js';
import { dessinerCellule } from './rendu-cellule.js';
import { dessinerCelluleStyle } from './rendu-blocs.js';
import { opacitePieceCourante, ghostEstDesactive } from './mecaniques-histoire.js';
import { dessinerPulsePieceActive } from './rendu-accessibilite.js';

function dessinerCellulesFantome(forme, xOrigine, yOrigine, distance, couleur, opacite) {
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = xOrigine + c;
            const y = yOrigine + l + distance;
            if (y >= 0 && x >= 0 && x < CONFIG.colonnes) {
                dessinerCellule(obtenirCtx(), x, y, couleur, CONFIG.taille, opacite);
            }
        }
    }
}

export function dessinerPieceFantome() {
    if (!etat.pieceActuelle) return;
    if (ghostEstDesactive()) return;
    const distance = calculerDistanceChute(etat.pieceActuelle);
    const forme = obtenirForme(etat.pieceActuelle);
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    const piece = etat.pieceActuelle;

    if (obtenirFauxFantomeActif()) {
        dessinerCellulesFantome(forme, piece.x, piece.y, distance, '#00f5ff', 0.14);
        const tick = Math.floor(performance.now() / 800);
        const offsetFaux = ((tick * 7 + 3) % 7) - 3;
        dessinerCellulesFantome(forme, piece.x + offsetFaux, piece.y, distance, '#ff2d78', 0.28);
        return;
    }

    dessinerCellulesFantome(forme, piece.x, piece.y, distance, couleur, 0.22);
}

export function dessinerOverlayBraise() {
    if (!obtenirCtx() || !obtenirCanvasPlateau()) return;
    if (obtenirEffetsAccessibiliteReduits()) return;
    const pulse = 0.12 + 0.1 * Math.sin(performance.now() / 220);
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (etat.plateau[l][c] === COULEUR_BRAISE) {
                obtenirCtx().save();
                obtenirCtx().globalAlpha = pulse;
                obtenirCtx().fillStyle = '#ff8800';
                obtenirCtx().fillRect(
                    c * CONFIG.taille,
                    l * CONFIG.taille,
                    CONFIG.taille,
                    CONFIG.taille
                );
                obtenirCtx().restore();
            }
        }
    }
}

export function dessinerPieceActive() {
    if (!etat.pieceActuelle) return;
    const opacitePiece = opacitePieceCourante();
    const forme = obtenirForme(etat.pieceActuelle);
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);
    const relique = obtenirReliqueActive() ?? etat.pieceActuelle.reliqueData;

    if (meteo.masquerPiece) {
        obtenirCtx().fillStyle = 'rgba(255,180,50,0.18)';
        for (let i = 0; i < 20; i++) {
            const sx = ((performance.now() * 0.15 + i * 53.7) % 1) * obtenirCanvasPlateau().width;
            const sy = ((i * 17.3) % 1) * obtenirCanvasPlateau().height;
            obtenirCtx().fillRect(sx, sy, 8, 1);
        }
    }

    if (relique) {
        obtenirCtx().save();
        obtenirCtx().shadowBlur = 20 + Math.sin(performance.now() / 200) * 8;
        obtenirCtx().shadowColor = relique.couleur;
    }

    if (meteo.masquerPiece) obtenirCtx().globalAlpha = 0.08;

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = etat.pieceActuelle.x + c;
            const y = etat.pieceActuelle.y + l;
            if (y >= 0) {
                dessinerCelluleStyle(
                    obtenirCtx(),
                    x,
                    y,
                    couleur,
                    CONFIG.taille,
                    opacitePiece,
                    obtenirBiomeActif(),
                    {
                        effetsReduits: obtenirEffetsReduits(),
                        prefererMoinsAnimations: obtenirPrefererMoinsAnimations(),
                        sansOmbreExterne: true,
                    }
                );
            }
        }
    }

    if (meteo.masquerPiece) obtenirCtx().globalAlpha = 1;

    dessinerPulsePieceActive(obtenirCtx());

    if (relique) {
        obtenirCtx().restore();
        obtenirCtx().font = `${CONFIG.taille * 0.7}px serif`;
        obtenirCtx().fillStyle = relique.couleur;
        obtenirCtx().textAlign = 'left';
        obtenirCtx().fillText(
            relique.icone,
            (etat.pieceActuelle.x + 1) * CONFIG.taille,
            Math.max(12, (etat.pieceActuelle.y - 0.2) * CONFIG.taille)
        );
    }
}
