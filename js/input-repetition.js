import { obtenirTouches } from './touches-config.js';
import { touchesActives } from './store-jeu.js';
import { reinitialiserDas } from './piece-jeu.js';

/** @type {Record<string, keyof ReturnType<typeof obtenirTouches>>} */
const ACTION_PAR_BOUTON = {
    'btn-gauche': 'gauche',
    'btn-droite': 'droite',
    'btn-bas': 'bas',
    'btn-gauche-p': 'gauche',
    'btn-droite-p': 'droite',
    'btn-bas-p': 'bas',
};

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
