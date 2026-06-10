import { CONFIG } from './config.js';

/**
 * Attache une action à un bouton tactile/souris avec DAS/ARR guideline.
 * @param {HTMLElement | null} btn
 * @param {() => void} action
 * @param {boolean} [avecRepetition]
 */
export function attacherRepetitionBouton(btn, action, avecRepetition = false) {
    if (!btn) return;
    /** @type {ReturnType<typeof setTimeout> | null} */
    let dasTimer = null;
    /** @type {ReturnType<typeof setInterval> | null} */
    let arrInterval = null;

    const arreter = () => {
        if (dasTimer !== null) {
            clearTimeout(dasTimer);
            dasTimer = null;
        }
        if (arrInterval !== null) {
            clearInterval(arrInterval);
            arrInterval = null;
        }
    };

    const debut = () => {
        action();
        if (!avecRepetition) return;
        arreter();
        dasTimer = setTimeout(() => {
            arrInterval = setInterval(action, CONFIG.arrInterval);
        }, CONFIG.dasDelai);
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
    btn.addEventListener('mousedown', debut);
    btn.addEventListener('mouseup', arreter);
    btn.addEventListener('mouseleave', arreter);
}
