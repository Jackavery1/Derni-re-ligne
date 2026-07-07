import { obtenirEtatDeblocage } from '../io/progression.js';
import { mettreAJourMenuCampagneTitre } from '../histoire/menu-titre-campagne.js';

function definirVisibiliteMode(id, visible) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('mode-debloque', visible);
    el.classList.toggle('element-masque', !visible);
    el.classList.remove('btn-verrouille', 'btn-verrouille--actif');
    if (el instanceof HTMLButtonElement) {
        el.hidden = !visible;
    }
    if (visible) {
        el.removeAttribute('aria-disabled');
        el.removeAttribute('aria-hidden');
    } else {
        el.setAttribute('aria-hidden', 'true');
    }
}

function mettreAJourSectionMenu(separateurId, blocId, idsBoutons) {
    const auMoinsUnVisible = idsBoutons.some((id) => {
        const btn = document.getElementById(id);
        return btn?.classList.contains('mode-debloque');
    });
    definirVisibiliteMode(separateurId, auMoinsUnVisible);
    definirVisibiliteMode(blocId, auMoinsUnVisible);
}

/** Masque les modes non debloques (menu titre, liens croises, oracle/coop, etc.). */
export function mettreAJourVisibiliteModesDebloques() {
    const deblocage = obtenirEtatDeblocage();

    definirVisibiliteMode('btn-jouer', deblocage.mondeLibre);
    definirVisibiliteMode('btn-architecte', deblocage.architecte);
    definirVisibiliteMode('btn-codex', deblocage.codex);
    definirVisibiliteMode('btn-profil', deblocage.profil);
    definirVisibiliteMode('btn-achievements', deblocage.achievements);

    mettreAJourSectionMenu('menu-separateur-libre', 'menu-bloc-libre', [
        'btn-jouer',
        'btn-architecte',
    ]);
    mettreAJourSectionMenu('menu-separateur-collection', 'menu-bloc-collection', [
        'btn-codex',
        'btn-profil',
        'btn-achievements',
    ]);

    definirVisibiliteMode('btn-profil-codex', deblocage.codex);
    definirVisibiliteMode('btn-profil-achievements', deblocage.achievements);
    definirVisibiliteMode('btn-achievements-codex', deblocage.codex);
    definirVisibiliteMode('btn-profil-gameover', deblocage.profil);

    definirVisibiliteMode('toggle-oracle-wrap', deblocage.oracleCoop);
    definirVisibiliteMode('toggle-coop-wrap', deblocage.oracleCoop);

    mettreAJourMenuCampagneTitre();
}
