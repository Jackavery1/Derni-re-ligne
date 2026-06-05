import { CONFIG } from './config.js';
import { mettreAJourMeteo } from './meteo.js';
import { logger } from './logger.js';
import {
    etat,
    particules,
    textesFlottants,
    transitionAlpha,
    flashVerrou,
    flashLignes,
    secousse,
    lockDelayRestant,
    pieceAuSol,
    prefererMoinsAnimations,
    fpsMoyen,
    idFrame,
    boucleActive,
    dernierTimestamp,
    accumulateur,
    canvasPlateau,
    ctx,
    definirFpsMoyen,
    definirEffetsReduits,
    definirBoucleActive,
    definirIdFrame,
    definirDernierTimestamp,
    definirPieceAuSol,
    definirLockDelayRestant,
    definirNbLockResets,
    definirAccumulateur,
} from './contexte-jeu.js';
import { mettreAJourDas, mettreAJourIndicateurRelique, estPositionValide } from './piece-jeu.js';
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

export function mettreAJourFps(deltaTemps) {
    if (deltaTemps <= 0) return;
    const fps = 1000 / deltaTemps;
    const nouveau = fpsMoyen * 0.92 + fps * 0.08;
    definirFpsMoyen(nouveau);
    definirEffetsReduits(prefererMoinsAnimations || nouveau < 45);
}

function aBesoinDeBoucle() {
    return (
        etat.estEnCours ||
        menuAnimActif ||
        transitionAlpha < 1 ||
        particules.length > 0 ||
        textesFlottants.length > 0 ||
        flashVerrou.timer > 0 ||
        flashLignes.timer > 0 ||
        secousse.timer > 0
    );
}

export function planifierBoucle() {
    if (!ctx || !canvasPlateau) return;
    if (!aBesoinDeBoucle()) {
        definirBoucleActive(false);
        if (idFrame) cancelAnimationFrame(idFrame);
        definirIdFrame(null);
        definirDernierTimestamp(0);
        return;
    }
    if (!boucleActive) definirDernierTimestamp(0);
    definirBoucleActive(true);
    cancelAnimationFrame(idFrame);
    definirIdFrame(requestAnimationFrame(boucleJeu));
}

function boucleJeu(timestamp) {
    if (!ctx || !canvasPlateau) {
        planifierBoucle();
        return;
    }

    try {
        const deltaTemps = dernierTimestamp ? timestamp - dernierTimestamp : 0;
        definirDernierTimestamp(timestamp);
        mettreAJourFps(deltaTemps);

        if (menuAnimActif) mettreAJourMenuFond(deltaTemps);

        const enPartie = etat.estEnCours && !etat.estEnPause;

        if (enPartie) {
            mettreAJourMeteo(deltaTemps);
            mettreAJourDas(deltaTemps);

            if (etat.pieceActuelle) {
                const peutDescendre = estPositionValide(etat.pieceActuelle, 0, 1);

                if (peutDescendre) {
                    definirPieceAuSol(false);
                    definirLockDelayRestant(0);
                    definirAccumulateur(accumulateur + deltaTemps);
                    if (accumulateur >= vitesseChute()) {
                        definirAccumulateur(0);
                        etat.pieceActuelle.y++;
                    }
                } else {
                    if (!pieceAuSol) {
                        definirPieceAuSol(true);
                        definirLockDelayRestant(CONFIG.lockDelay);
                        definirNbLockResets(0);
                    } else {
                        definirLockDelayRestant(lockDelayRestant - deltaTemps);
                        if (lockDelayRestant <= 0) verrouillerPiece();
                    }
                }
            }

            mettreAJourParticules(deltaTemps);
            mettreAJourParticulesAmbiance(deltaTemps);
            mettreAJourTextesFlottants(deltaTemps);
            mettreAJourAffichageTemps();
            mettreAJourAmbiante(deltaTemps);
            mettreAJourIndicateurRelique();
        }

        if (transitionAlpha < 1) mettreAJourTransition();

        if (flashVerrou.timer > 0) flashVerrou.timer -= deltaTemps;
        if (flashLignes.timer > 0) flashLignes.timer -= deltaTemps;
        mettreAJourSecousse(deltaTemps);

        const doitDessiner =
            enPartie ||
            transitionAlpha < 1 ||
            particules.length > 0 ||
            textesFlottants.length > 0 ||
            flashVerrou.timer > 0 ||
            flashLignes.timer > 0 ||
            secousse.timer > 0;

        if (doitDessiner) {
            const alpha = 1;
            ctx.save();
            const dec = getDecalageSecousse();
            ctx.translate(dec.x, dec.y);
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = 'source-over';
            dessinerPlateau();
            dessinerFlashLignes();
            if (etat.pieceActuelle) {
                dessinerPieceFantome();
                dessinerPieceActive();
            }
            dessinerFlashVerrou();
            dessinerParticules();
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = alpha;
            dessinerTextesFlottants();
            ctx.restore();
        }
    } catch (err) {
        logger.error('Erreur boucle jeu:', err);
    } finally {
        planifierBoucle();
    }
}
