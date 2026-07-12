import { CONFIG } from '../config/config-jeu.js';
import { etat, obtenirTransitionAlpha, obtenirCanvasPlateau } from '../etat/store-jeu.js';
import {
    dessinerPlateau,
    dessinerPieceFantome,
    dessinerPieceActive,
    dessinerFlashLignes,
    dessinerFlashVerrou,
    dessinerFlashTopout,
    dessinerParticules,
    dessinerTextesFlottants,
    obtenirDecalageSecousse,
} from './rendu-jeu.js';
import { dessinerDecorations } from './decorations-jeu.js';
import { dessinerAvertissementsVivant } from './rendu-vivant.js';
import { dessinerMotifsAccessibilite, dessinerMotifsPieceCourante } from './rendu-accessibilite.js';

/** @type {typeof import('./boss-rendu.js') | null} */
let _bossRenduModule = null;

/** @type {typeof import('../logique/oracle-jeu.js') | null} */
let _oracleModule = null;

async function _dessinerSuggestionOracleLazy() {
    if (!_oracleModule) {
        _oracleModule = await import('../logique/oracle-jeu.js');
    }
    if (_oracleModule.oracle.actif) {
        _oracleModule.dessinerSuggestionOracle();
    }
}

export async function rendrePortraitBossLazy(timestamp) {
    if (!_bossRenduModule) {
        _bossRenduModule = await import('./boss-rendu.js');
    }
    _bossRenduModule.rendrePortraitBoss(timestamp);
}

export function dessinerFrameSolo(ctx, enPartie) {
    const canvasPlateau = obtenirCanvasPlateau();
    ctx.save();
    const dec = obtenirDecalageSecousse();
    ctx.translate(dec.x, dec.y);
    ctx.globalCompositeOperation = 'source-over';
    dessinerPlateau();
    dessinerMotifsAccessibilite(ctx, etat.plateau, CONFIG.taille);
    dessinerAvertissementsVivant();
    dessinerFlashLignes();
    if (etat.pieceActuelle) {
        dessinerPieceFantome();
        void _dessinerSuggestionOracleLazy();
        dessinerPieceActive();
        dessinerMotifsPieceCourante(ctx);
    }
    dessinerFlashVerrou();
    dessinerFlashTopout();
    dessinerParticules();
    if (enPartie) dessinerDecorations();

    if (obtenirTransitionAlpha() < 1 && canvasPlateau) {
        ctx.save();
        ctx.globalAlpha = 1 - obtenirTransitionAlpha();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasPlateau.width, canvasPlateau.height);
        ctx.restore();
    }

    ctx.restore();
    ctx.save();
    dessinerTextesFlottants();
    ctx.restore();
}
