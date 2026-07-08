import { lireStockage } from '../io/progression.js';
import { haptiqueActif } from '../audio/haptique.js';
import { enchainementCampagneActif } from '../histoire/preferences-campagne.js';
import { controlesTactilesActifs } from '../logique/controles-tactiles.js';
import {
    obtenirDaltonien,
    obtenirReduireEffetsAccessibilite,
    obtenirConstellationClicSeul,
} from './accessibilite.js';

export function appliquerContrasteDepuisStockage() {
    const contraste = lireStockage('derniereLigne_contraste', 'false') === 'true';
    document.body?.classList.toggle('contraste-eleve', contraste);
}

export function mettreAJourBoutonContraste(btn) {
    const actif = document.body.classList.contains('contraste-eleve');
    btn.textContent = actif ? '◐ CONTRASTE ON' : '◐ CONTRASTE';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}

export function mettreAJourBoutonDaltonien(btn) {
    const actif = obtenirDaltonien();
    btn.textContent = actif ? '◎ DALTONIEN ON' : '◎ DALTONIEN';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}

export function mettreAJourBoutonReduireEffets(btn) {
    const actif = obtenirReduireEffetsAccessibilite();
    btn.textContent = actif ? '◇ EFFETS RÉDUITS ON' : '◇ RÉDUIRE EFFETS';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}

export function mettreAJourBoutonConstellationClic(btn) {
    const actif = obtenirConstellationClicSeul();
    btn.textContent = actif ? '◎ CONSTELLATION AU CLIC ON' : '◎ CONSTELLATION AU CLIC';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}

export function mettreAJourBoutonHaptique(btn) {
    const actif = haptiqueActif();
    btn.textContent = actif ? '📳 HAPTIQUE ON' : '📳 HAPTIQUE OFF';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}

export function mettreAJourBoutonControlesTactiles(btn) {
    const actif = controlesTactilesActifs();
    btn.textContent = actif ? '👆 TOUCHES TACTILES ON' : '👆 TOUCHES TACTILES OFF';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}

export function mettreAJourBoutonEnchainementCampagne(btn) {
    const actif = enchainementCampagneActif();
    btn.textContent = actif ? '▶ ENCHAÎNEMENT CAMPAGNE ON' : '▶ RETOUR CARTE APRÈS VICTOIRE';
    btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
    btn.classList.toggle('opt-toggle--on', actif);
}
