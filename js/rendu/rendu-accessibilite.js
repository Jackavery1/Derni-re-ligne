import { CONFIG, BIOMES } from '../config/config.js';
import { etat, obtenirBiomeActif } from '../etat/store-jeu.js';
import { obtenirDaltonien } from '../accessibilite.js';
import { obtenirForme, calculerDistanceChute } from '../logique/piece-jeu.js';
import { obtenirFauxFantomeActif } from '../boss-jeu.js';
import { ghostEstDesactive } from '../mecaniques-histoire.js';

const TYPES_PIECE = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const INDEX_COULEUR_PIECE = { I: 0, O: 1, T: 2, S: 3, Z: 4, J: 5, L: 6 };
const OPACITE_MOTIF = 0.55;
const OPACITE_MOTIF_FANTOME = 0.25;
const RATIO_MOTIF = 0.4;

let cacheTypesCouleur = { biome: null, map: null };

function obtenirMapTypeCouleur() {
    const biome = obtenirBiomeActif();
    if (cacheTypesCouleur.biome === biome && cacheTypesCouleur.map) return cacheTypesCouleur.map;
    const map = new Map();
    const couleurs = (BIOMES[biome] ?? BIOMES.classique).couleursBlocs;
    for (let i = 0; i < TYPES_PIECE.length; i++) {
        const type = TYPES_PIECE[i];
        const couleur = couleurs[INDEX_COULEUR_PIECE[type]];
        if (couleur) map.set(couleur.toLowerCase(), type);
    }
    cacheTypesCouleur = { biome, map };
    return map;
}

function resoudreTypeParCouleur(couleur) {
    if (!couleur || typeof couleur !== 'string') return null;
    return obtenirMapTypeCouleur().get(couleur.toLowerCase()) ?? null;
}

function demiMotif(taille) {
    return taille * RATIO_MOTIF * 0.5;
}

function dessinerMotifType(ctx, cx, cy, demi, type, opacite) {
    ctx.save();
    ctx.globalAlpha = opacite;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, demi * 0.25);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (type) {
        case 'I':
            ctx.beginPath();
            ctx.arc(cx, cy, demi * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'O':
            ctx.beginPath();
            ctx.moveTo(cx - demi, cy);
            ctx.lineTo(cx + demi, cy);
            ctx.moveTo(cx, cy - demi);
            ctx.lineTo(cx, cy + demi);
            ctx.stroke();
            break;
        case 'T':
            ctx.beginPath();
            ctx.moveTo(cx, cy - demi);
            ctx.lineTo(cx + demi, cy + demi * 0.8);
            ctx.lineTo(cx - demi, cy + demi * 0.8);
            ctx.closePath();
            ctx.stroke();
            break;
        case 'S':
            ctx.fillRect(cx - demi, cy - demi * 0.25, demi * 2, demi * 0.5);
            break;
        case 'Z':
            ctx.beginPath();
            ctx.arc(cx, cy, demi * 0.35, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'J':
            ctx.beginPath();
            ctx.moveTo(cx - demi, cy - demi * 0.4);
            ctx.lineTo(cx, cy + demi * 0.5);
            ctx.lineTo(cx + demi, cy - demi * 0.4);
            ctx.stroke();
            break;
        case 'L': {
            const s = demi * 1.2;
            ctx.strokeRect(cx - s, cy - s, s * 2, s * 2);
            break;
        }
    }
    ctx.restore();
}

function dessinerMotifsForme(ctx, forme, type, baseX, baseY, taille, opacite) {
    const demi = demiMotif(taille);
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const cx = (baseX + c) * taille + taille / 2;
            const cy = (baseY + l) * taille + taille / 2;
            dessinerMotifType(ctx, cx, cy, demi, type, opacite);
        }
    }
}

export function dessinerMotifsAccessibilite(ctx, plateau, tailleCellule, opacite = OPACITE_MOTIF) {
    if (!obtenirDaltonien()) return;
    for (let l = 0; l < plateau.length; l++) {
        const ligne = plateau[l];
        if (!ligne) continue;
        for (let c = 0; c < ligne.length; c++) {
            const couleur = ligne[c];
            if (!couleur) continue;
            const type = resoudreTypeParCouleur(couleur);
            if (!type) continue;
            const cx = c * tailleCellule + tailleCellule / 2;
            const cy = l * tailleCellule + tailleCellule / 2;
            dessinerMotifType(ctx, cx, cy, demiMotif(tailleCellule), type, opacite);
        }
    }
}

export function dessinerMotifsPieceCourante(ctx) {
    if (!obtenirDaltonien() || !etat.pieceActuelle) return;
    const piece = etat.pieceActuelle;
    const forme = obtenirForme(piece);
    const type = piece.type;

    if (!ghostEstDesactive()) {
        let offsetFaux = 0;
        if (obtenirFauxFantomeActif()) {
            const tick = Math.floor(performance.now() / 800);
            offsetFaux = ((tick * 7 + 3) % 7) - 3;
        }
        const dist = calculerDistanceChute(piece);
        dessinerMotifsForme(
            ctx,
            forme,
            type,
            piece.x + offsetFaux,
            piece.y + dist,
            CONFIG.taille,
            OPACITE_MOTIF_FANTOME
        );
    }

    dessinerMotifsForme(ctx, forme, type, piece.x, piece.y, CONFIG.taille, OPACITE_MOTIF);
}

export function dessinerMotifsPreview(ctx, piece, offsetX, offsetY, tailleCell) {
    if (!obtenirDaltonien() || !piece) return;
    const forme = obtenirForme(piece);
    dessinerMotifsForme(ctx, forme, piece.type, offsetX, offsetY, tailleCell, OPACITE_MOTIF);
}

export function dessinerMotifsCoopPieces(ctx, pieces, obtenirFormeFn) {
    if (!obtenirDaltonien()) return;
    for (const entree of pieces) {
        const { piece, distFantome } = entree;
        if (!piece) continue;
        const forme = obtenirFormeFn(piece);
        if (distFantome > 0) {
            dessinerMotifsForme(
                ctx,
                forme,
                piece.type,
                piece.x,
                piece.y + distFantome,
                CONFIG.taille,
                OPACITE_MOTIF_FANTOME
            );
        }
        dessinerMotifsForme(ctx, forme, piece.type, piece.x, piece.y, CONFIG.taille, OPACITE_MOTIF);
    }
}

export function dessinerPulsePieceActive(ctx) {
    const daltonien = obtenirDaltonien();
    const contrasteEleve =
        typeof document !== 'undefined' && document.body?.classList?.contains('contraste-eleve');
    if ((!daltonien && !contrasteEleve) || !etat.pieceActuelle) return;

    const forme = obtenirForme(etat.pieceActuelle);
    const pulse = 0.45 + 0.55 * Math.sin(performance.now() / 180);
    const alpha = 0.2 + pulse * 0.35;

    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = 2;
    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = (etat.pieceActuelle.x + c) * CONFIG.taille;
            const y = (etat.pieceActuelle.y + l) * CONFIG.taille;
            ctx.strokeRect(x + 1, y + 1, CONFIG.taille - 2, CONFIG.taille - 2);
        }
    }
    ctx.restore();
}
