import { TOUCHES_DEFAUT } from './config.js';
import { etat, touchesActives } from './store-jeu.js';
import { reinitialiserDas } from './piece-jeu.js';
import { obtenirActions } from './actions-jeu.js';
import { partieSpecialiseeActive } from './registre-modes.js';
import { attacherRepetitionBouton } from './input-repetition.js';

function attacher(idBouton, action, avecRepetition = false) {
    attacherRepetitionBouton(document.getElementById(idBouton), action, avecRepetition);
}

function traiterToucheClavier(code, actions) {
    switch (code) {
        case TOUCHES_DEFAUT.gauche:
            actions().deplacerGauche?.();
            break;
        case TOUCHES_DEFAUT.droite:
            actions().deplacerDroite?.();
            break;
        case TOUCHES_DEFAUT.bas:
            actions().deplacerBas?.();
            break;
        case TOUCHES_DEFAUT.tournerH:
        case 'KeyZ':
            if (!etat.pieceActuelle?.reliqueForme) actions().tourner?.(1);
            break;
        case TOUCHES_DEFAUT.tournerAH:
            if (!etat.pieceActuelle?.reliqueForme) actions().tourner?.(-1);
            break;
        case TOUCHES_DEFAUT.chute:
            actions().chuteRapide?.();
            break;
        case TOUCHES_DEFAUT.hold:
        case 'ShiftLeft':
        case 'ShiftRight':
            actions().utiliserReserve?.();
            break;
        case TOUCHES_DEFAUT.pause:
        case 'Escape':
            actions().basculerPause?.();
            break;
    }
}

let inputInitialise = false;

export function initialiserInput() {
    // Idempotence : un second appel doublerait listeners clavier et boutons (double input).
    if (inputInitialise) return;
    inputInitialise = true;
    const actions = () => obtenirActions();

    document.addEventListener('keydown', (e) => {
        if (partieSpecialiseeActive()) return;
        if (touchesActives[e.code]) return;
        touchesActives[e.code] = true;

        if ([TOUCHES_DEFAUT.gauche, TOUCHES_DEFAUT.droite, TOUCHES_DEFAUT.bas].includes(e.code)) {
            reinitialiserDas(e.code);
        }

        traiterToucheClavier(e.code, actions);

        if (e.code === TOUCHES_DEFAUT.chute) {
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        delete touchesActives[e.code];
        if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) {
            reinitialiserDas(e.code);
        }
    });

    attacher('btn-gauche', () => actions().deplacerGauche?.(), true);
    attacher('btn-droite', () => actions().deplacerDroite?.(), true);
    attacher('btn-bas', () => actions().deplacerBas?.(), true);
    attacher('btn-rotation', () => {
        if (!etat.pieceActuelle?.reliqueForme) actions().tourner?.(1);
    });
    attacher('btn-chute', () => actions().chuteRapide?.());
    attacher('btn-reserve', () => actions().utiliserReserve?.());

    attacher('btn-gauche-p', () => actions().deplacerGauche?.(), true);
    attacher('btn-droite-p', () => actions().deplacerDroite?.(), true);
    attacher('btn-bas-p', () => actions().deplacerBas?.(), true);
    attacher('btn-rotation-p', () => {
        if (!etat.pieceActuelle?.reliqueForme) actions().tourner?.(1);
    });
    attacher('btn-chute-p', () => actions().chuteRapide?.());
    attacher('btn-reserve-p', () => actions().utiliserReserve?.());
}
