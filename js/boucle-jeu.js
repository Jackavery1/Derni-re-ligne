import { CONFIG } from './config/config.js';
import { mettreAJourMeteo } from './logique/meteo.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import {
    etat,
    particules,
    textesFlottants,
    flashVerrou,
    flashLignes,
    flashTopout,
    secousse,
    obtenirTransitionAlpha,
    obtenirLockDelayRestant,
    obtenirPieceAuSol,
    obtenirEffetsAccessibiliteReduits,
    obtenirFpsMoyen,
    obtenirIdFrame,
    obtenirBoucleActive,
    obtenirDernierTimestamp,
    obtenirAccumulateur,
    obtenirCanvasPlateau,
    obtenirCtx,
    definirFpsMoyen,
    definirEffetsReduits,
    definirBoucleActive,
    definirIdFrame,
    definirDernierTimestamp,
    definirLockDelayRestant,
    definirAccumulateur,
} from './etat/store-jeu.js';
import {
    mettreAJourDas,
    mettreAJourIndicateurRelique,
    estPositionValide,
} from './logique/piece-jeu.js';
import { mettreAJourGamepad } from './logique/input-gamepad.js';
import { obtenirActions } from './logique/actions-jeu.js';
import { partieSpecialiseeActive } from './etat/registre-modes.js';
import { modeHistoireEnCours } from './etat/mode-histoire.js';
import {
    dessinerPlateau,
    dessinerPieceFantome,
    dessinerPieceActive,
    dessinerFlashLignes,
    dessinerFlashVerrou,
    dessinerFlashTopout,
    dessinerParticules,
    dessinerTextesFlottants,
    mettreAJourAmbiante,
    mettreAJourTransition,
    mettreAJourParticulesAmbiance,
    mettreAJourTextesFlottants,
    obtenirDecalageSecousse,
    mettreAJourSecousse,
} from './rendu/rendu-jeu.js';
import { mettreAJourParticules } from './rendu/particules-jeu.js';
import { mettreAJourAffichageTemps } from './rendu/hud-jeu.js';
import { tickTimerNiveau } from './logique/timer-niveau.js';
import { verrouillerPiece, vitesseChute } from './logique/logique-partie.js';
import { menuAnimActif, mettreAJourMenuFond } from './menu-fond.js';
import { mettreAJourHistoriquePositions, dessinerDecorations } from './rendu/decorations-jeu.js';
import { mettreAJourVivant } from './logique/vivant.js';
import { dessinerAvertissementsVivant } from './rendu/rendu-vivant.js';
import { mettreAJourBoss, bossEstActif, bossEstVaincu } from './logique/boss-jeu.js';
import { mettreAJourMecaniquesHistoire } from './histoire/mecaniques-histoire.js';
import {
    mettreAJourGameFeel,
    areActive,
    activerPieceAuSol,
    quitterSolPiece,
} from './logique/game-feel-jeu.js';
import {
    dessinerMotifsAccessibilite,
    dessinerMotifsPieceCourante,
} from './rendu/rendu-accessibilite.js';
import { recupererZenApresTopOut } from './logique/logique-partie-verrouillage.js';

const SEUIL_ERREURS_BOUCLE = 5;
let erreursConsecutivesBoucle = 0;

/** @type {typeof import('./rendu/boss-rendu.js') | null} */
let _bossRenduModule = null;

async function _rendrePortraitBossLazy(timestamp) {
    if (!_bossRenduModule) {
        _bossRenduModule = await import('./rendu/boss-rendu.js');
    }
    _bossRenduModule.rendrePortraitBoss(timestamp);
}

/** @type {typeof import('./logique/oracle-jeu.js') | null} */
let _oracleModule = null;

async function _dessinerSuggestionOracleLazy() {
    if (!_oracleModule) {
        _oracleModule = await import('./logique/oracle-jeu.js');
    }
    if (_oracleModule.oracle.actif) {
        _oracleModule.dessinerSuggestionOracle();
    }
}

export function mettreAJourFps(deltaTemps) {
    if (deltaTemps <= 0) return;
    const fps = 1000 / deltaTemps;
    const nouveau = obtenirFpsMoyen() * 0.92 + fps * 0.08;
    definirFpsMoyen(nouveau);
    definirEffetsReduits(obtenirEffetsAccessibiliteReduits() || nouveau < 45);
}

function aBesoinDeBoucle() {
    if (partieSpecialiseeActive()) return false;
    return (
        etat.estEnCours ||
        menuAnimActif ||
        obtenirTransitionAlpha() < 1 ||
        particules.length > 0 ||
        textesFlottants.length > 0 ||
        flashVerrou.timer > 0 ||
        flashLignes.timer > 0 ||
        flashTopout.timer > 0 ||
        secousse.timer > 0
    );
}

export function suspendreBoucleSolo() {
    etat.estEnCours = false;
    definirBoucleActive(false);
    const id = obtenirIdFrame();
    if (id) cancelAnimationFrame(id);
    definirIdFrame(null);
    definirDernierTimestamp(0);
}

export function planifierBoucle() {
    const ctx = obtenirCtx();
    const canvasPlateau = obtenirCanvasPlateau();
    if (!ctx || !canvasPlateau) return;
    if (!aBesoinDeBoucle()) {
        definirBoucleActive(false);
        const idFrame = obtenirIdFrame();
        if (idFrame) cancelAnimationFrame(idFrame);
        definirIdFrame(null);
        definirDernierTimestamp(0);
        return;
    }
    if (!obtenirBoucleActive()) definirDernierTimestamp(0);
    definirBoucleActive(true);
    cancelAnimationFrame(obtenirIdFrame());
    definirIdFrame(requestAnimationFrame(boucleJeu));
}

function dessinerFrameSolo(ctx, enPartie) {
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

function _mettreAJourGravitePiece(deltaTemps) {
    if (!etat.pieceActuelle || areActive()) return;
    const peutDescendre = estPositionValide(etat.pieceActuelle, 0, 1);
    if (peutDescendre) {
        quitterSolPiece();
        definirAccumulateur(obtenirAccumulateur() + deltaTemps);
        if (obtenirAccumulateur() >= vitesseChute()) {
            definirAccumulateur(0);
            etat.pieceActuelle.y++;
            mettreAJourHistoriquePositions();
        }
        return;
    }
    if (!obtenirPieceAuSol()) {
        activerPieceAuSol();
        return;
    }
    definirLockDelayRestant(obtenirLockDelayRestant() - deltaTemps);
    if (obtenirLockDelayRestant() <= 0) verrouillerPiece();
}

function _mettreAJourPartieActive(deltaTemps, timestamp) {
    if (!modeHistoireEnCours()) {
        mettreAJourMeteo(deltaTemps);
    }
    mettreAJourMecaniquesHistoire(deltaTemps, timestamp);
    if (!modeHistoireEnCours()) {
        mettreAJourVivant(deltaTemps);
    }
    mettreAJourDas(deltaTemps);
    if (!partieSpecialiseeActive()) mettreAJourGamepad(obtenirActions);
    mettreAJourGameFeel(deltaTemps, recupererZenApresTopOut);
    _mettreAJourGravitePiece(deltaTemps);
    mettreAJourParticules(deltaTemps);
    mettreAJourParticulesAmbiance(deltaTemps);
    mettreAJourTextesFlottants(deltaTemps);
    mettreAJourAffichageTemps();
    tickTimerNiveau();
    if (bossEstActif()) {
        if (!bossEstVaincu()) mettreAJourBoss(deltaTemps);
        void _rendrePortraitBossLazy(timestamp);
    }
    mettreAJourAmbiante(deltaTemps);
    mettreAJourIndicateurRelique();
}

function _mettreAJourTimersEffets(deltaTemps) {
    if (flashVerrou.timer > 0) flashVerrou.timer -= deltaTemps;
    if (flashLignes.timer > 0) flashLignes.timer -= deltaTemps;
    if (flashTopout.timer > 0) flashTopout.timer -= deltaTemps;
    mettreAJourSecousse(deltaTemps);
}

function _effetsVisuelsActifs() {
    return (
        obtenirTransitionAlpha() < 1 ||
        particules.length > 0 ||
        textesFlottants.length > 0 ||
        flashVerrou.timer > 0 ||
        flashLignes.timer > 0 ||
        flashTopout.timer > 0 ||
        secousse.timer > 0
    );
}

function boucleJeu(timestamp) {
    if (partieSpecialiseeActive()) {
        suspendreBoucleSolo();
        return;
    }
    const ctx = obtenirCtx();
    const canvasPlateau = obtenirCanvasPlateau();
    if (!ctx || !canvasPlateau) {
        planifierBoucle();
        return;
    }

    try {
        const dernierTimestamp = obtenirDernierTimestamp();
        const deltaTemps = dernierTimestamp ? timestamp - dernierTimestamp : 0;
        definirDernierTimestamp(timestamp);
        mettreAJourFps(deltaTemps);

        if (menuAnimActif) mettreAJourMenuFond(deltaTemps);

        const enPartie = etat.estEnCours && !etat.estEnPause;

        if (enPartie) {
            _mettreAJourPartieActive(deltaTemps, timestamp);
        }

        if (obtenirTransitionAlpha() < 1) mettreAJourTransition();

        _mettreAJourTimersEffets(deltaTemps);

        if (enPartie || _effetsVisuelsActifs()) {
            dessinerFrameSolo(ctx, enPartie);
        }
        erreursConsecutivesBoucle = 0;
    } catch (err) {
        erreursConsecutivesBoucle++;
        logger.error('Erreur boucle jeu:', err);
        if (erreursConsecutivesBoucle >= SEUIL_ERREURS_BOUCLE) {
            afficherErreurUtilisateur(
                'Une erreur empêche le jeu de fonctionner. Rechargez la page ou retournez au menu.'
            );
            suspendreBoucleSolo();
            return;
        }
    } finally {
        planifierBoucle();
    }
}
