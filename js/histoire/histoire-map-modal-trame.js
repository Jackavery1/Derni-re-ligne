import { lierBoutonsCarteHistoire } from './histoire-boutons-carte.js';

const MARQUEUR_BOUTON = 'data-neo-histoire-lie';
let _modalTrameAttache = false;

function _ouvrirModalTrame() {
    const overlay = document.getElementById('overlay-trame-conditions');
    if (!overlay) return;
    overlay.classList.remove('element-masque');
    overlay.classList.add('objectif-overlay-visible');
}

export function fermerModalTrameCarte() {
    const overlay = document.getElementById('overlay-trame-conditions');
    if (!overlay) return;
    overlay.classList.remove('objectif-overlay-visible');
    overlay.classList.add('element-masque');
}

function _fermerModalTrame() {
    fermerModalTrameCarte();
}

export function initialiserModalTrameCarte() {
    lierBoutonsCarteHistoire();
    if (_modalTrameAttache) return;
    _modalTrameAttache = true;

    const lierModal = (id, handler) => {
        const el = document.getElementById(id);
        if (!el || el.hasAttribute(MARQUEUR_BOUTON)) return;
        el.setAttribute(MARQUEUR_BOUTON, '1');
        el.addEventListener('click', handler);
    };

    lierModal('btn-histoire-trame', (e) => {
        e.stopPropagation();
        _ouvrirModalTrame();
    });

    const overlay = document.getElementById('overlay-trame-conditions');
    const panneau = overlay?.querySelector('.histoire-trame-panneau');
    lierModal('btn-trame-fermer', () => _fermerModalTrame());
    panneau?.addEventListener('click', (e) => e.stopPropagation());
}
