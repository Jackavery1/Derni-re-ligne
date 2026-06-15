import { obtenirTouches } from './touches-config.js';
import { touchesActives } from './store-jeu.js';
import { reinitialiserDas } from './piece-jeu.js';
import { vibrer } from './haptique.js';

/** @type {Record<string, keyof ReturnType<typeof obtenirTouches>>} */
const ACTION_PAR_BOUTON = {
    'btn-gauche': 'gauche',
    'btn-droite': 'droite',
    'btn-bas': 'bas',
    'btn-gauche-p': 'gauche',
    'btn-droite-p': 'droite',
    'btn-bas-p': 'bas',
    'ccj1-gauche': 'gauche',
    'ccj1-droite': 'droite',
    'ccj1-bas': 'bas',
    'ccj2-gauche': 'gauche',
    'ccj2-droite': 'droite',
    'ccj2-bas': 'bas',
};

/** @type {Record<string, 'rotation' | 'chute' | 'verrou'>} */
const HAPTIQUE_PAR_BOUTON = {
    'btn-rotation': 'rotation',
    'btn-rotation-ccw': 'rotation',
    'btn-rotation-p': 'rotation',
    'btn-rotation-ccw-p': 'rotation',
    'btn-chute': 'chute',
    'btn-chute-p': 'chute',
    'btn-reserve': 'verrou',
    'btn-reserve-p': 'verrou',
    'ccj1-rot': 'rotation',
    'ccj1-drop': 'chute',
    'ccj1-hold': 'verrou',
    'ccj2-rot': 'rotation',
    'ccj2-drop': 'chute',
    'ccj2-hold': 'verrou',
};

function vibrerBoutonTactile(idBouton) {
    const type = HAPTIQUE_PAR_BOUTON[idBouton];
    if (type) vibrer(type);
}

/**
 * Attache une action à un bouton tactile/souris ; la repetition DAS/ARR passe par mettreAJourDas.
 * @param {HTMLElement | null} btn
 * @param {() => void} action
 * @param {boolean} [avecRepetition]
 */
export function attacherRepetitionBouton(btn, action, avecRepetition = false) {
    if (!btn) return;
    const actionCle = ACTION_PAR_BOUTON[btn.id];

    const debut = () => {
        action();
        if (!avecRepetition || !actionCle) return;
        const code = obtenirTouches()[actionCle];
        if (code) touchesActives[code] = true;
    };

    const arreter = () => {
        if (!actionCle) return;
        const code = obtenirTouches()[actionCle];
        if (code) {
            delete touchesActives[code];
            reinitialiserDas(code);
        }
    };

    btn.addEventListener(
        'touchstart',
        (e) => {
            e.preventDefault();
            vibrerBoutonTactile(btn.id);
            debut();
        },
        { passive: false }
    );
    btn.addEventListener('touchend', arreter, { passive: false });
    btn.addEventListener('touchcancel', arreter, { passive: false });
    btn.addEventListener('mousedown', debut);
    btn.addEventListener('mouseup', arreter);
    btn.addEventListener('mouseleave', arreter);
}
