import { obtenirEtatDeblocage } from './progression.js';

/** @param {HTMLElement} el */
function lierTooltipVerrouille(el) {
    if (el.dataset.verrouilleLie === '1') return;
    el.dataset.verrouilleLie = '1';
    el.addEventListener('mouseenter', () => el.classList.add('btn-verrouille--actif'));
    el.addEventListener('mouseleave', () => el.classList.remove('btn-verrouille--actif'));
    el.addEventListener('focus', () => el.classList.add('btn-verrouille--actif'));
    el.addEventListener('blur', () => el.classList.remove('btn-verrouille--actif'));
}

/**
 * @param {string} id
 * @param {boolean} debloque
 * @param {{ toujoursVisible?: boolean }} [options]
 */
function definirEtatMode(id, debloque, { toujoursVisible = false } = {}) {
    const el = document.getElementById(id);
    if (!el) return;

    if (toujoursVisible || debloque) {
        el.classList.remove('element-masque');
        el.removeAttribute('aria-hidden');
        if (el instanceof HTMLButtonElement) el.hidden = false;
    } else {
        el.classList.add('element-masque');
        el.setAttribute('aria-hidden', 'true');
        if (el instanceof HTMLButtonElement) el.hidden = true;
        return;
    }

    el.classList.toggle('mode-debloque', debloque);
    el.classList.toggle('btn-verrouille', !debloque);

    if (el instanceof HTMLButtonElement) {
        el.disabled = !debloque;
        if (debloque) {
            el.removeAttribute('aria-disabled');
        } else {
            el.setAttribute('aria-disabled', 'true');
            lierTooltipVerrouille(el);
        }
    }
}

/** @param {string} separateurId @param {string} blocId @param {string[]} idsBoutons */
function mettreAJourSectionMenu(separateurId, blocId, idsBoutons) {
    const auMoinsUnAffiche = idsBoutons.some((id) => {
        const btn = document.getElementById(id);
        return btn && !btn.classList.contains('element-masque');
    });
    for (const id of [separateurId, blocId]) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.classList.toggle('element-masque', !auMoinsUnAffiche);
        if (auMoinsUnAffiche) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', 'true');
    }
}

/** Affiche les modes verrouillés en grisé avec condition de déblocage. */
export function mettreAJourVisibiliteModesDebloques() {
    const deblocage = obtenirEtatDeblocage();

    definirEtatMode('btn-jouer', deblocage.mondeLibre, { toujoursVisible: true });
    definirEtatMode('btn-architecte', deblocage.architecte, { toujoursVisible: true });
    definirEtatMode('btn-codex', deblocage.codex, { toujoursVisible: true });
    definirEtatMode('btn-profil', deblocage.profil, { toujoursVisible: true });
    definirEtatMode('btn-achievements', deblocage.achievements, { toujoursVisible: true });

    mettreAJourSectionMenu('menu-separateur-libre', 'menu-bloc-libre', [
        'btn-jouer',
        'btn-architecte',
    ]);
    mettreAJourSectionMenu('menu-separateur-collection', 'menu-bloc-collection', [
        'btn-codex',
        'btn-profil',
        'btn-achievements',
    ]);

    definirEtatMode('btn-profil-codex', deblocage.codex);
    definirEtatMode('btn-profil-achievements', deblocage.achievements);
    definirEtatMode('btn-achievements-codex', deblocage.codex);
    definirEtatMode('btn-profil-gameover', deblocage.profil);

    definirEtatMode('toggle-oracle-wrap', deblocage.oracleCoop);
    definirEtatMode('toggle-coop-wrap', deblocage.oracleCoop);
}
