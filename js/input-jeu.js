import { TOUCHES_DEFAUT } from './config.js';
import { etat, touchesActives } from './contexte-jeu.js';
import { reinitialiserDas } from './piece-jeu.js';
import { Registre } from './registre-jeu.js';

function attacher(idBouton, action, avecRepetition = false) {
    const btn = document.getElementById(idBouton);
    if (!btn) return;
    let idInterval = null;
    const debut = () => {
        action();
        if (avecRepetition) idInterval = setInterval(action, 110);
    };
    const fin = () => {
        if (idInterval) {
            clearInterval(idInterval);
            idInterval = null;
        }
    };
    btn.addEventListener(
        'touchstart',
        (e) => {
            e.preventDefault();
            debut();
        },
        { passive: false }
    );
    btn.addEventListener('touchend', fin, { passive: false });
    btn.addEventListener('mousedown', debut);
    btn.addEventListener('mouseup', fin);
    btn.addEventListener('mouseleave', fin);
}

export function initialiserInput() {
    document.addEventListener('keydown', (e) => {
        if (touchesActives[e.code]) return;
        touchesActives[e.code] = true;

        if ([TOUCHES_DEFAUT.gauche, TOUCHES_DEFAUT.droite, TOUCHES_DEFAUT.bas].includes(e.code)) {
            reinitialiserDas(e.code);
        }

        switch (e.code) {
            case TOUCHES_DEFAUT.gauche:
                Registre.deplacerGauche?.();
                break;
            case TOUCHES_DEFAUT.droite:
                Registre.deplacerDroite?.();
                break;
            case TOUCHES_DEFAUT.bas:
                Registre.deplacerBas?.();
                break;
            case TOUCHES_DEFAUT.tournerH:
            case 'KeyZ':
                if (!etat.pieceActuelle?.reliqueForme) Registre.tourner?.(1);
                break;
            case TOUCHES_DEFAUT.tournerAH:
                if (!etat.pieceActuelle?.reliqueForme) Registre.tourner?.(-1);
                break;
            case TOUCHES_DEFAUT.chute:
                Registre.chuteRapide?.();
                e.preventDefault();
                break;
            case TOUCHES_DEFAUT.hold:
            case 'ShiftLeft':
            case 'ShiftRight':
                Registre.utiliserReserve?.();
                break;
            case TOUCHES_DEFAUT.pause:
            case 'Escape':
                Registre.basculerPause?.();
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        delete touchesActives[e.code];
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) {
            reinitialiserDas(e.code);
        }
    });

    attacher('btn-gauche', () => Registre.deplacerGauche?.(), true);
    attacher('btn-droite', () => Registre.deplacerDroite?.(), true);
    attacher('btn-bas', () => Registre.deplacerBas?.(), true);
    attacher('btn-rotation', () => {
        if (!etat.pieceActuelle?.reliqueForme) Registre.tourner?.(1);
    });
    attacher('btn-chute', () => Registre.chuteRapide?.());
    attacher('btn-reserve', () => Registre.utiliserReserve?.());

    attacher('btn-gauche-p', () => Registre.deplacerGauche?.(), true);
    attacher('btn-droite-p', () => Registre.deplacerDroite?.(), true);
    attacher('btn-bas-p', () => Registre.deplacerBas?.(), true);
    attacher('btn-rotation-p', () => {
        if (!etat.pieceActuelle?.reliqueForme) Registre.tourner?.(1);
    });
    attacher('btn-chute-p', () => Registre.chuteRapide?.());
    attacher('btn-reserve-p', () => Registre.utiliserReserve?.());
}
