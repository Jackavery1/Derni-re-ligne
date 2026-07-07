import { obtenirTouches } from './touches-config.js';
import { etat, touchesActives } from '../etat/store-jeu.js';
import { reinitialiserDas } from './piece-jeu.js';
import { obtenirActions } from './actions-jeu.js';
import { partieSpecialiseeActive } from '../etat/registre-modes.js';
import { attacherRepetitionBouton } from './input-repetition.js';

function attacher(idBouton, action, avecRepetition = false) {
    attacherRepetitionBouton(document.getElementById(idBouton), action, avecRepetition);
}

/** @param {ReturnType<typeof obtenirTouches>} touches @param {string} code @param {() => ReturnType<typeof obtenirActions>} actions */
function traiterToucheClavier(touches, code, actions) {
    const a = actions();
    switch (code) {
        case touches.gauche:
            a.deplacerGauche?.();
            break;
        case touches.droite:
            a.deplacerDroite?.();
            break;
        case touches.bas:
            a.deplacerBas?.();
            break;
        case touches.tournerH:
        case 'KeyZ':
            if (!etat.pieceActuelle?.reliqueForme) a.tourner?.(1);
            break;
        case touches.tournerAH:
            if (!etat.pieceActuelle?.reliqueForme) a.tourner?.(-1);
            break;
        case touches.chute:
            a.chuteRapide?.();
            break;
        case touches.hold:
        case 'ShiftLeft':
        case 'ShiftRight':
            a.utiliserReserve?.();
            break;
        case touches.pause:
        case 'Escape':
            a.basculerPause?.();
            break;
    }
}

let inputInitialise = false;

export function initialiserInput() {
    if (inputInitialise) return;
    inputInitialise = true;
    const actions = () => obtenirActions();

    document.addEventListener('keydown', (e) => {
        if (partieSpecialiseeActive()) return;
        if (touchesActives[e.code]) return;
        touchesActives[e.code] = true;

        const touches = obtenirTouches();
        if ([touches.gauche, touches.droite, touches.bas].includes(e.code)) {
            reinitialiserDas(e.code);
        }

        traiterToucheClavier(touches, e.code, actions);

        if (e.code === touches.chute) {
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        delete touchesActives[e.code];
        const touches = obtenirTouches();
        if ([touches.gauche, touches.droite, touches.bas].includes(e.code)) {
            reinitialiserDas(e.code);
        }
    });

    const tournerCw = () => {
        if (!etat.pieceActuelle?.reliqueForme) actions().tourner?.(1);
    };
    const tournerCcw = () => {
        if (!etat.pieceActuelle?.reliqueForme) actions().tourner?.(-1);
    };

    attacher('btn-gauche', () => actions().deplacerGauche?.(), true);
    attacher('btn-droite', () => actions().deplacerDroite?.(), true);
    attacher('btn-bas', () => actions().deplacerBas?.(), true);
    attacher('btn-rotation', tournerCw);
    attacher('btn-rotation-ccw', tournerCcw);
    attacher('btn-chute', () => actions().chuteRapide?.());
    attacher('btn-reserve', () => actions().utiliserReserve?.());

    attacher('btn-gauche-p', () => actions().deplacerGauche?.(), true);
    attacher('btn-droite-p', () => actions().deplacerDroite?.(), true);
    attacher('btn-bas-p', () => actions().deplacerBas?.(), true);
    attacher('btn-rotation-p', tournerCw);
    attacher('btn-rotation-ccw-p', tournerCcw);
    attacher('btn-chute-p', () => actions().chuteRapide?.());
    attacher('btn-reserve-p', () => actions().utiliserReserve?.());
}
