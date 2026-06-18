import { etat } from './store-jeu.js';
import { obtenirDefiDuJour, lireScoreDefiJour } from './defi-jour.js';
import { BIOMES } from './config.js';
import { sansAccentsE } from './texte-jeu.js';
import { obtenirEtatDeblocage } from './progression.js';

export let defiJourActif = false;

export function obtenirDefiCourant() {
    return obtenirDefiDuJour();
}

export function basculerDefiJour() {
    if (!obtenirEtatDeblocage().mondeLibre) return;
    defiJourActif = !defiJourActif;
    if (defiJourActif) {
        etat.modeJeu = 'marathon';
        import('./mode-sprint.js').then(({ desactiverModeSprint }) => desactiverModeSprint());
        import('./infobulles-contexte.js').then(({ proposerInfobulleModeJeu }) =>
            proposerInfobulleModeJeu('defiJour')
        );
    }
    mettreAJourToggleDefiJour();
}

export function desactiverDefiJour() {
    if (!defiJourActif) return;
    defiJourActif = false;
    mettreAJourToggleDefiJour();
}

export function mettreAJourToggleDefiJour() {
    const wrap = document.getElementById('toggle-defi-jour-wrap');
    const btn = document.getElementById('toggle-defi-jour');
    const label = document.getElementById('defi-jour-label');
    const desc = document.getElementById('defi-jour-desc');
    const debloque = obtenirEtatDeblocage().mondeLibre;

    if (wrap) wrap.classList.toggle('element-masque', !debloque);
    if (!debloque) return;

    const defi = obtenirDefiDuJour();
    const biome = BIOMES[defi.biomeId];
    const record = lireScoreDefiJour(defi.date);

    if (btn) btn.classList.toggle('actif', defiJourActif);
    if (label) {
        label.textContent = defiJourActif ? 'DEFI DU JOUR : ON' : 'DEFI DU JOUR : OFF';
    }
    if (desc) {
        desc.textContent = sansAccentsE(
            `${biome?.icone ?? ''} ${biome?.nom ?? defi.biomeId} — effacer ${defi.objectifLignes} lignes (record du jour : ${record})`
        );
    }
}

export function reinitialiserDefiJourSession() {
    defiJourActif = false;
}
