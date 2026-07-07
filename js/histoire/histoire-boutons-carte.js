import { obtenirActionsHistoire } from './histoire-actions.js';
import { vibrerUi } from '../audio/haptique.js';

const MARQUEUR_BOUTON = 'data-neo-histoire-lie';

function lierBoutonCarte(id, handler) {
    const el = document.getElementById(id);
    if (!el || el.hasAttribute(MARQUEUR_BOUTON) || typeof el.addEventListener !== 'function')
        return;
    el.setAttribute(MARQUEUR_BOUTON, '1');
    el.addEventListener('click', () => {
        void handler();
    });
}

export function lierBoutonsCarteHistoire() {
    lierBoutonCarte('btn-histoire-retour', () => {
        obtenirActionsHistoire().retourTitreDepuisCarte?.();
    });
    lierBoutonCarte('btn-histoire-carte', () => {
        obtenirActionsHistoire().retourCarte?.();
    });
    lierBoutonCarte('btn-continue-boss', () => {
        void obtenirActionsHistoire().continuerBossDistorsion?.();
    });
    lierBoutonCarte('btn-histoire-briefing-distorsion', async () => {
        vibrerUi();
        try {
            localStorage.removeItem('derniereLigne_tutorielDistorsionVu');
        } catch {
            /* ignore */
        }
        const { afficherTutorielContextuel } = await import('../ui/tutoriel.js');
        afficherTutorielContextuel('distorsion');
    });
}
