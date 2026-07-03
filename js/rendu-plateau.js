/** Orchestration du rendu Canvas du plateau de jeu (fond, blocs, pièces, particules). */
import { CONFIG } from './config.js';
import { meteo } from './meteo.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import {
    etat,
    particules,
    couleurAmbRgb,
    obtenirEffetsReduits,
    obtenirPrefererMoinsAnimations,
    obtenirCanvasPlateau,
    obtenirCtx,
} from './store-jeu.js';
import { dessinerFondBiome } from './rendu-ambiance.js';
import { dessinerSignesVie } from './rendu-vivant.js';
import { dessinerMotifsAccessibilite, dessinerMotifsPieceCourante } from './rendu-accessibilite.js';
import {
    _invaliderCacheGradientsPlateau,
    obtenirCacheMasqueMeteo,
    dessinerAmbiancePlateauCache,
    dessinerVignettePlateauCache,
} from './rendu-plateau-cache.js';
import { dessinerBlocsVerrouilles } from './rendu-plateau-blocs.js';
import {
    dessinerPieceFantome,
    dessinerOverlayBraise,
    dessinerPieceActive,
} from './rendu-plateau-pieces.js';

export {
    _invaliderCacheGradientsPlateau,
    dessinerPieceFantome,
    dessinerOverlayBraise,
    dessinerPieceActive,
};

function dessinerAmbianceJeu() {
    if (obtenirEffetsReduits()) return;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    const pieceX = etat.pieceActuelle ? etat.pieceActuelle.x * CONFIG.taille : null;
    dessinerAmbiancePlateauCache(obtenirCtx(), w, h, couleurAmbRgb, pieceX);
}

function dessinerVignette() {
    if (obtenirEffetsReduits()) return;
    const w = obtenirCanvasPlateau().width;
    const h = obtenirCanvasPlateau().height;
    dessinerVignettePlateauCache(obtenirCtx(), w, h);
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
        const w = obtenirCanvasPlateau().width;
        const h = obtenirCanvasPlateau().height;
        const yMasque = (CONFIG.lignes - 4) * CONFIG.taille;
        const cache = obtenirCacheMasqueMeteo(w, h);
        if (cache) obtenirCtx().drawImage(cache, 0, 0);
        obtenirCtx().fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 15; i++) {
            const bx = ((performance.now() * 0.02 + i * 73) % 1) * w;
            const by = yMasque + ((performance.now() * 0.04 + i * 37) % 1) * (h - yMasque);
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
