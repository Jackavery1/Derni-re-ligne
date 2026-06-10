import { CONFIG } from './config.js';
import { mettreAJourMeteo } from './meteo.js';
import { logger, afficherErreurUtilisateur } from './logger.js';
import {
    etat,
    particules,
    textesFlottants,
    flashVerrou,
    flashLignes,
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
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
    definirAccumulateur,
} from './store-jeu.js';
import { mettreAJourDas, mettreAJourIndicateurRelique, estPositionValide } from './piece-jeu.js';
import { partieSpecialiseeActive } from './registre-modes.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import {
    dessinerPlateau,
    dessinerPieceFantome,
    dessinerPieceActive,
    dessinerFlashLignes,
    dessinerFlashVerrou,
    dessinerParticules,
    dessinerTextesFlottants,
    mettreAJourAmbiante,
    mettreAJourTransition,
    mettreAJourParticulesAmbiance,
    mettreAJourTextesFlottants,
    getDecalageSecousse,
    mettreAJourSecousse,
} from './rendu-jeu.js';
import { mettreAJourParticules } from './particules-jeu.js';
import { mettreAJourAffichageTemps } from './ecrans-ui.js';
import { verrouillerPiece, vitesseChute } from './logique-partie.js';
import { menuAnimActif, mettreAJourMenuFond } from './menu-fond.js';
import { mettreAJourHistoriquePositions, dessinerDecorations } from './decorations-jeu.js';
import { mettreAJourVivant } from './vivant.js';
import { dessinerAvertissementsVivant } from './rendu-vivant.js';
import { dessinerSuggestionOracle } from './oracle-jeu.js';
import { mettreAJourBoss, bossEstActif, bossEstVaincu } from './boss-jeu.js';
import { rendrePortraitBoss } from './boss-rendu.js';
import { mettreAJourMecaniquesHistoire } from './mecaniques-histoire.js';
import { dessinerMotifsAccessibilite, dessinerMotifsPieceCourante } from './rendu-accessibilite.js';

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
    const dec = getDecalageSecousse();
    ctx.translate(dec.x, dec.y);
    ctx.globalCompositeOperation = 'source-over';
    dessinerPlateau();
    dessinerMotifsAccessibilite(ctx, etat.plateau, CONFIG.taille);
    dessinerAvertissementsVivant();
    dessinerFlashLignes();
    if (etat.pieceActuelle) {
        dessinerPieceFantome();
        dessinerSuggestionOracle();
        dessinerPieceActive();
        dessinerMotifsPieceCourante(ctx);
    }
    dessinerFlashVerrou();
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
    if (!etat.pieceActuelle) return;
    const peutDescendre = estPositionValide(etat.pieceActuelle, 0, 1);
    if (peutDescendre) {
        definirPieceAuSol(false);
        definirLockDelayRestant(0);
        definirAccumulateur(obtenirAccumulateur() + deltaTemps);
        if (obtenirAccumulateur() >= vitesseChute()) {
            definirAccumulateur(0);
            etat.pieceActuelle.y++;
            mettreAJourHistoriquePositions();
        }
        return;
    }
    if (!obtenirPieceAuSol()) {
        definirPieceAuSol(true);
        definirLockDelayRestant(CONFIG.lockDelay);
        definirNbLockResets(0);
        return;
    }
    definirLockDelayRestant(obtenirLockDelayRestant() - deltaTemps);
    if (obtenirLockDelayRestant() <= 0) verrouillerPiece();
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
            mettreAJourMeteo(deltaTemps);
            mettreAJourMecaniquesHistoire(deltaTemps, timestamp);
            if (!modeHistoireEnCours()) {
                mettreAJourVivant(deltaTemps);
            }
            mettreAJourDas(deltaTemps);
            _mettreAJourGravitePiece(deltaTemps);

            mettreAJourParticules(deltaTemps);
            mettreAJourParticulesAmbiance(deltaTemps);
            mettreAJourTextesFlottants(deltaTemps);
            mettreAJourAffichageTemps();
            if (bossEstActif()) {
                if (!bossEstVaincu()) mettreAJourBoss(deltaTemps);
                rendrePortraitBoss(timestamp);
            }
            mettreAJourAmbiante(deltaTemps);
            mettreAJourIndicateurRelique();
        }

        if (obtenirTransitionAlpha() < 1) mettreAJourTransition();

        if (flashVerrou.timer > 0) flashVerrou.timer -= deltaTemps;
        if (flashLignes.timer > 0) flashLignes.timer -= deltaTemps;
        mettreAJourSecousse(deltaTemps);

        const doitDessiner =
            enPartie ||
            obtenirTransitionAlpha() < 1 ||
            particules.length > 0 ||
            textesFlottants.length > 0 ||
            flashVerrou.timer > 0 ||
            flashLignes.timer > 0 ||
            secousse.timer > 0;

        if (doitDessiner) {
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
