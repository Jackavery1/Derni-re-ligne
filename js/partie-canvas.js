import { logger, afficherErreurUtilisateur } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import {
    etat,
    obtenirTouchDepart,
    definirRefsCanvas,
    definirTouchDepart,
} from './etat/store-jeu.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
} from './logique/logique-partie.js';
import { vibrerRotation, vibrerChuteRapide } from './audio/haptique.js';

export function initialiserCanvas() {
    const cp = obtenirCanvas('canvas-plateau');
    const cprev = obtenirCanvas('canvas-preview');
    const cres = obtenirCanvas('canvas-reserve');
    if (!cp || !cprev || !cres) {
        logger.error('Canvas introuvable dans le DOM');
        afficherErreurUtilisateur(
            'Impossible de charger le jeu — canvas manquant. Rechargez la page.'
        );
        return false;
    }
    definirRefsCanvas({
        canvasPlateau: cp,
        ctx: cp.getContext('2d', { alpha: false }),
        canvasPreview: cprev,
        ctxPreview: cprev.getContext('2d'),
        canvasReserve: cres,
        ctxReserve: cres.getContext('2d'),
    });

    if (!cp.dataset.evenementsOk) {
        cp.dataset.evenementsOk = '1';
        let gesteSwipe = false;

        cp.addEventListener(
            'touchstart',
            (e) => {
                gesteSwipe = false;
                definirTouchDepart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            },
            { passive: true }
        );
        cp.addEventListener(
            'touchmove',
            (e) => {
                const touchDepart = obtenirTouchDepart();
                if (!touchDepart) return;
                const dx = e.touches[0].clientX - touchDepart.x;
                const dy = e.touches[0].clientY - touchDepart.y;
                if (Math.abs(dx) > 12 || Math.abs(dy) > 12) gesteSwipe = true;
            },
            { passive: true }
        );
        cp.addEventListener(
            'touchend',
            (e) => {
                const touchDepart = obtenirTouchDepart();
                if (!touchDepart) return;
                const dx = e.changedTouches[0].clientX - touchDepart.x;
                const dy = e.changedTouches[0].clientY - touchDepart.y;
                const seuil = 25;
                const amplitude = Math.max(Math.abs(dx), Math.abs(dy));
                if (amplitude < seuil) {
                    definirTouchDepart(null);
                    return;
                }
                gesteSwipe = true;
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > seuil) deplacerDroite();
                    else if (dx < -seuil) deplacerGauche();
                } else {
                    if (dy > seuil) deplacerBas();
                    else if (dy < -seuil) {
                        vibrerChuteRapide();
                        chuteRapide();
                    }
                }
                definirTouchDepart(null);
            },
            { passive: true }
        );
        cp.addEventListener('click', () => {
            if (gesteSwipe) {
                gesteSwipe = false;
                return;
            }
            if (!etat.pieceActuelle?.reliqueForme) {
                vibrerRotation();
                tourner(1);
            }
        });
    }
    return true;
}
