import { obtenirTouches } from './touches-config.js';

/** @type {Record<number, boolean>} */
const etatBoutons = {};

const SEUIL_STICK = 0.45;

/** @param {() => ReturnType<typeof import('./actions-jeu.js').obtenirActions>} obtenirActions */
export function mettreAJourGamepad(obtenirActions) {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const gp = pads?.[0];
    if (!gp) return;

    const actions = obtenirActions();
    const touches = obtenirTouches();

    const pressions = [
        { idx: 14, fn: actions.deplacerGauche, code: touches.gauche },
        { idx: 15, fn: actions.deplacerDroite, code: touches.droite },
        { idx: 13, fn: actions.deplacerBas, code: touches.bas },
        { idx: 12, fn: () => actions.tourner?.(1), code: touches.tournerH },
        { idx: 2, fn: () => actions.tourner?.(-1), code: touches.tournerAH },
        { idx: 0, fn: actions.chuteRapide, code: touches.chute },
        { idx: 1, fn: actions.utiliserReserve, code: touches.hold },
        { idx: 9, fn: actions.basculerPause, code: touches.pause },
    ];

    for (const { idx, fn, code } of pressions) {
        const appuye = gp.buttons[idx]?.pressed === true;
        const etaitAppuye = etatBoutons[idx] === true;
        if (appuye && !etaitAppuye) fn?.();
        etatBoutons[idx] = appuye;
        void code;
    }

    const axeX = gp.axes[0] ?? 0;
    const axeY = gp.axes[1] ?? 0;

    if (axeX <= -SEUIL_STICK && !etatBoutons['stick-g']) {
        actions.deplacerGauche?.();
        etatBoutons['stick-g'] = true;
    } else if (axeX > -SEUIL_STICK) {
        etatBoutons['stick-g'] = false;
    }

    if (axeX >= SEUIL_STICK && !etatBoutons['stick-d']) {
        actions.deplacerDroite?.();
        etatBoutons['stick-d'] = true;
    } else if (axeX < SEUIL_STICK) {
        etatBoutons['stick-d'] = false;
    }

    if (axeY >= SEUIL_STICK && !etatBoutons['stick-b']) {
        actions.deplacerBas?.();
        etatBoutons['stick-b'] = true;
    } else if (axeY < SEUIL_STICK) {
        etatBoutons['stick-b'] = false;
    }
}

export function _reinitialiserEtatGamepad() {
    for (const k of Object.keys(etatBoutons)) delete etatBoutons[k];
}
