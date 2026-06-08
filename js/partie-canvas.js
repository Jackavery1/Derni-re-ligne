import { logger, afficherErreurUtilisateur } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { etat, obtenirTouchDepart, definirRefsCanvas, definirTouchDepart } from './store-jeu.js';
import {
    deplacerGauche,
    deplacerDroite,
    deplacerBas,
    chuteRapide,
    tourner,
} from './logique-partie.js';

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
        cp.addEventListener(
            'touchstart',
            (e) => {
                definirTouchDepart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
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
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > seuil) deplacerDroite();
                    if (dx < -seuil) deplacerGauche();
                } else {
                    if (dy > seuil) deplacerBas();
                    if (dy < -seuil) chuteRapide();
                }
                definirTouchDepart(null);
            },
            { passive: true }
        );
        cp.addEventListener('click', () => {
            if (!etat.pieceActuelle?.reliqueForme) tourner(1);
        });
    }
    return true;
}
