import { CONFIG } from './config.js';
import { meteo } from './meteo.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import {
    etat,
    particules,
    couleurAmbRgb,
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
import { dessinerFondBiome } from './rendu-ambiance.js';
import { dessinerSignesVie } from './rendu-vivant.js';
import { celluleEstRouillee, pieceEstInvisible, ghostEstDesactive } from './mecaniques-histoire.js';
import { dessinerMotifsAccessibilite, dessinerMotifsPieceCourante } from './rendu-accessibilite.js';

function dessinerAmbianceJeu() {
    if (obtenirEffetsReduits()) return;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const r = Math.round(couleurAmbRgb[0]);
    const g = Math.round(couleurAmbRgb[1]);
    const b = Math.round(couleurAmbRgb[2]);
    const amb = `rgba(${r},${g},${b}`;

    const gradBas = obtenirCtx().createRadialGradient(w / 2, h * 0.85, 0, w / 2, h * 0.85, w * 0.9);
    gradBas.addColorStop(0, `${amb},0.11)`);
    gradBas.addColorStop(1, `${amb},0)`);
    obtenirCtx().fillStyle = gradBas;
    obtenirCtx().fillRect(0, 0, w, h);

    if (etat.pieceActuelle) {
        const cx = etat.pieceActuelle.x * CONFIG.taille;
        const gradHaut = obtenirCtx().createRadialGradient(cx, 0, 0, cx, 0, w * 0.7);
        gradHaut.addColorStop(0, `${amb},0.07)`);
        gradHaut.addColorStop(1, `${amb},0)`);
        obtenirCtx().fillStyle = gradHaut;
        obtenirCtx().fillRect(0, 0, w, h);
    }
}

function dessinerVignette() {
    if (obtenirEffetsReduits()) return;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const grad = obtenirCtx().createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.78);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.40)');
    obtenirCtx().fillStyle = grad;
    obtenirCtx().fillRect(0, 0, w, h);
}

function dessinerBlocsVerrouilles() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        for (let c = 0; c < CONFIG.colonnes; c++) {
            if (!etat.plateau[l][c]) continue;
            dessinerCellule(obtenirCtx(), c, l, etat.plateau[l][c]);
            if (celluleEstRouillee(c, l)) {
                _dessinerOverlayRouille(c, l);
            }
        }
    }
}

function _dessinerOverlayRouille(c, l) {
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

export function dessinerPlateau() {
    if (!obtenirCtx() || !obtenirCanvasPlateau()) return;
    obtenirCtx().globalAlpha = 1;
    obtenirCtx().globalCompositeOperation = 'source-over';
    obtenirCtx().clearRect(0, 0, obtenirCanvasPlateau().width, obtenirCanvasPlateau().height);
    dessinerFondBiome();
    dessinerBlocsVerrouilles();
    dessinerOverlayBraise();
    dessinerSignesVie();
    dessinerAmbianceJeu();
    dessinerVignette();

    if (meteo.masquerPlateau) {
        const yMasque = (CONFIG.lignes - 4) * CONFIG.taille;
        const grad = obtenirCtx().createLinearGradient(
            0,
            yMasque,
            0,
            obtenirCanvasPlateau().height
        );
        grad.addColorStop(0, 'rgba(180,230,255,0)');
        grad.addColorStop(0.4, 'rgba(180,230,255,0.55)');
        grad.addColorStop(1, 'rgba(180,230,255,0.85)');
        obtenirCtx().fillStyle = grad;
        obtenirCtx().fillRect(
            0,
            yMasque,
            obtenirCanvasPlateau().width,
            obtenirCanvasPlateau().height - yMasque
        );
        obtenirCtx().fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 15; i++) {
            const bx = ((performance.now() * 0.02 + i * 73) % 1) * obtenirCanvasPlateau().width;
            const by =
                yMasque +
                ((performance.now() * 0.04 + i * 37) % 1) *
                    (obtenirCanvasPlateau().height - yMasque);
            obtenirCtx().fillRect(bx, by, 2, 2);
        }
    }
}

export function rendreFrameJeu() {
    if (!obtenirCtx() || !etat.estEnCours) return;
    try {
        obtenirCtx().save();
        obtenirCtx().globalAlpha = 1;
        obtenirCtx().globalCompositeOperation = 'source-over';
        dessinerPlateau();
        dessinerMotifsAccessibilite(obtenirCtx(), etat.plateau, CONFIG.taille);
        if (etat.pieceActuelle) {
            dessinerPieceFantome();
            dessinerPieceActive();
            dessinerMotifsPieceCourante(obtenirCtx());
        }
        obtenirCtx().restore();
    } catch (err) {
        logger.error('Erreur rendu plateau:', err);
        afficherErreurUtilisateur('Erreur d’affichage du jeu. Rechargez la page (Ctrl+Shift+R).');
    }
}

export function dessinerPieceFantome() {
    if (!etat.pieceActuelle) return;
    if (ghostEstDesactive()) return;
    const distance = calculerDistanceChute(etat.pieceActuelle);
    const forme = obtenirForme(etat.pieceActuelle);
    const couleur = obtenirCouleurPiece(etat.pieceActuelle);

    let offsetFaux = 0;
    if (obtenirFauxFantomeActif()) {
        const tick = Math.floor(performance.now() / 800);
        offsetFaux = ((tick * 7 + 3) % 7) - 3;
    }

    const distAffichee = distance;
    const xAffiche = etat.pieceActuelle.x + offsetFaux;

    for (let l = 0; l < forme.length; l++) {
        for (let c = 0; c < forme[l].length; c++) {
            if (!forme[l][c]) continue;
            const x = xAffiche + c;
            const y = etat.pieceActuelle.y + l + distAffichee;
            if (y >= 0 && x >= 0 && x < CONFIG.colonnes) {
                // 0.22 : assez visible pour servir de guide sans se confondre avec une piece posee.
                dessinerCellule(obtenirCtx(), x, y, couleur, CONFIG.taille, 0.22);
            }
        }
    }
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
    if (pieceEstInvisible()) return;
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
                    1,
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

export function dessinerParticules() {
    for (let i = 0; i < particules.length; i++) {
        const p = particules[i];
        obtenirCtx().save();
        obtenirCtx().globalAlpha = p.opacite;
        obtenirCtx().fillStyle = p.couleur;

        if (p.type === 'etincelle') {
            obtenirCtx().translate(p.x + 0.5, p.y + p.hauteur / 2);
            obtenirCtx().rotate(p.rotation);
            obtenirCtx().fillRect(-0.5, -p.hauteur / 2, 1, p.hauteur);
        } else if (p.type === 'eclair') {
            obtenirCtx().translate(p.x, p.y);
            obtenirCtx().rotate(p.rotation);
            if (!obtenirPrefererMoinsAnimations()) {
                obtenirCtx().shadowColor = p.couleur;
                obtenirCtx().shadowBlur = 6;
            }
            obtenirCtx().fillRect(0, -1, p.longueur, 2);
        } else {
            if (p.trainee && !obtenirPrefererMoinsAnimations()) {
                obtenirCtx().shadowColor = p.couleur;
                obtenirCtx().shadowBlur = 14;
            } else if (!obtenirPrefererMoinsAnimations()) {
                obtenirCtx().shadowColor = p.couleur;
                obtenirCtx().shadowBlur = 3 + p.opacite * 5;
            }
            obtenirCtx().translate(p.x + p.taille / 2, p.y + p.taille / 2);
            obtenirCtx().rotate(p.rotation);
            obtenirCtx().fillRect(-p.taille / 2, -p.taille / 2, p.taille, p.taille);
        }
        obtenirCtx().restore();
    }
}

export function obtenirYHautTas() {
    for (let l = 0; l < CONFIG.lignes; l++) {
        if (etat.plateau[l].some((c) => c !== 0)) {
            return l * CONFIG.taille;
        }
    }
    const canvas = obtenirCanvasPlateau();
    return canvas ? canvas.height * 0.4 : CONFIG.lignes * CONFIG.taille * 0.4;
}
