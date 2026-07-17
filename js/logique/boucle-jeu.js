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
    obtenirFpsMoyen,
    obtenirIdFrame,
    obtenirBoucleActive,
    obtenirDernierTimestamp,
    obtenirEffetsAccessibiliteReduits,
    obtenirCtx,
    obtenirCanvasPlateau,
    definirFpsMoyen,
    definirEffetsReduits,
    definirBoucleActive,
    definirIdFrame,
    definirDernierTimestamp,
} from '../etat/store-jeu.js';
import { partieSpecialiseeActive } from '../etat/registre-modes.js';
import { mettreAJourTransition } from '../rendu/rendu-jeu.js';
import { menuAnimActif, mettreAJourMenuFond } from '../rendu/menu-fond.js';
import { dessinerFrameSolo } from '../rendu/tick-rendu-solo.js';
import {
    mettreAJourTickPartieActive,
    mettreAJourTimersEffets,
    effetsVisuelsActifs,
} from './boucle-jeu-tick.js';

const SEUIL_ERREURS_BOUCLE = 5;
let erreursConsecutivesBoucle = 0;

export { SEUIL_ERREURS_BOUCLE };

export function reinitialiserErreursBoucle() {
    erreursConsecutivesBoucle = 0;
}

/** @param {unknown} err @returns {boolean} true si la boucle a été suspendue */
export function enregistrerErreurBoucle(err) {
    erreursConsecutivesBoucle += 1;
    logger.error('Erreur boucle jeu:', err);
    if (erreursConsecutivesBoucle >= SEUIL_ERREURS_BOUCLE) {
        afficherErreurUtilisateur(
            'Une erreur empêche le jeu de fonctionner. Rechargez la page ou retournez au menu.'
        );
        suspendreBoucleSolo();
        return true;
    }
    return false;
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
    if (!aBesoinDeBoucle()) {
        definirBoucleActive(false);
        const idFrame = obtenirIdFrame();
        if (idFrame) cancelAnimationFrame(idFrame);
        definirIdFrame(null);
        definirDernierTimestamp(0);
        return;
    }
    const plateauPret = Boolean(obtenirCtx() && obtenirCanvasPlateau());
    if (!plateauPret && !menuAnimActif) return;
    if (!obtenirBoucleActive()) definirDernierTimestamp(0);
    definirBoucleActive(true);
    cancelAnimationFrame(obtenirIdFrame());
    definirIdFrame(requestAnimationFrame(boucleJeu));
}

function boucleJeu(timestamp) {
    if (partieSpecialiseeActive()) {
        suspendreBoucleSolo();
        return;
    }

    try {
        const dernierTimestamp = obtenirDernierTimestamp();
        const deltaTemps = dernierTimestamp ? timestamp - dernierTimestamp : 0;
        definirDernierTimestamp(timestamp);

        if (menuAnimActif) mettreAJourMenuFond(deltaTemps);

        const ctx = obtenirCtx();
        const canvasPlateau = obtenirCanvasPlateau();
        if (ctx && canvasPlateau) {
            mettreAJourFps(deltaTemps);

            const enPartie = etat.estEnCours && !etat.estEnPause;

            if (enPartie) {
                mettreAJourTickPartieActive(deltaTemps, timestamp);
            }

            if (obtenirTransitionAlpha() < 1) mettreAJourTransition();

            mettreAJourTimersEffets(deltaTemps);

            if (enPartie || effetsVisuelsActifs()) {
                dessinerFrameSolo(ctx, enPartie);
            }
        }
        erreursConsecutivesBoucle = 0;
    } catch (err) {
        if (enregistrerErreurBoucle(err)) return;
    } finally {
        planifierBoucle();
    }
}
