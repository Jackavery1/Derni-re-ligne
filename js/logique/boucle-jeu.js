import { mettreAJourMeteo } from './meteo.js';
import { logger, afficherErreurUtilisateur } from '../io/logger.js';
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
} from '../etat/store-jeu.js';
import { mettreAJourDas, mettreAJourIndicateurRelique, estPositionValide } from './piece-jeu.js';
import { mettreAJourGamepad } from './input-gamepad.js';
import { obtenirActions } from './actions-jeu.js';
import { partieSpecialiseeActive } from '../etat/registre-modes.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import {
    mettreAJourAmbiante,
    mettreAJourTransition,
    mettreAJourParticulesAmbiance,
    mettreAJourTextesFlottants,
    mettreAJourSecousse,
} from '../rendu/rendu-jeu.js';
import { mettreAJourParticules } from '../rendu/particules-jeu.js';
import { mettreAJourAffichageTemps } from '../rendu/hud-jeu.js';
import { tickTimerNiveau } from './timer-niveau.js';
import { verrouillerPiece, vitesseChute } from './logique-partie.js';
import { menuAnimActif, mettreAJourMenuFond } from '../rendu/menu-fond.js';
import { mettreAJourHistoriquePositions } from '../rendu/decorations-jeu.js';
import { mettreAJourVivant } from './vivant.js';
import { mettreAJourBoss, bossEstActif, bossEstVaincu } from './boss-jeu.js';
import { mettreAJourMecaniquesHistoire } from '../histoire/mecaniques-histoire.js';
import {
    mettreAJourGameFeel,
    areActive,
    activerPieceAuSol,
    quitterSolPiece,
} from './game-feel-jeu.js';
import { recupererZenApresTopOut } from './logique-partie-verrouillage.js';
import { dessinerFrameSolo, rendrePortraitBossLazy } from '../rendu/tick-rendu-solo.js';

const SEUIL_ERREURS_BOUCLE = 5;
let erreursConsecutivesBoucle = 0;

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
        void rendrePortraitBossLazy(timestamp);
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
