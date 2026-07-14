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
    obtenirAccumulateur,
    definirLockDelayRestant,
    definirAccumulateur,
} from '../etat/store-jeu.js';
import { mettreAJourMeteo } from './meteo.js';
import { mettreAJourDas, estPositionValide, mettreAJourIndicateurRelique } from './piece-jeu.js';
import { mettreAJourGamepad } from './input-gamepad.js';
import { obtenirActions } from './actions-jeu.js';
import { partieSpecialiseeActive } from '../etat/registre-modes.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import {
    mettreAJourAmbiante,
    mettreAJourParticulesAmbiance,
    mettreAJourTextesFlottants,
    mettreAJourSecousse,
} from '../rendu/rendu-jeu.js';
import { mettreAJourParticules } from '../rendu/particules-jeu.js';
import { mettreAJourAffichageTemps } from '../rendu/hud-jeu.js';
import { tickTimerNiveau } from './timer-niveau.js';
import { verrouillerPiece, vitesseChute } from './logique-partie.js';
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
import { rendrePortraitBossLazy } from '../rendu/tick-rendu-solo.js';

function mettreAJourGravitePiece(deltaTemps) {
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

/** Tick logique gameplay (hors rendu canvas). */
export function mettreAJourTickPartieActive(deltaTemps, timestamp) {
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
    mettreAJourGravitePiece(deltaTemps);
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

export function mettreAJourTimersEffets(deltaTemps) {
    if (flashVerrou.timer > 0) flashVerrou.timer -= deltaTemps;
    if (flashLignes.timer > 0) flashLignes.timer -= deltaTemps;
    if (flashTopout.timer > 0) flashTopout.timer -= deltaTemps;
    mettreAJourSecousse(deltaTemps);
}

export function effetsVisuelsActifs() {
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
