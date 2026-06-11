import { store } from './store-core.js';
import {
    obtenirPrefererMoinsAnimations,
    obtenirFpsMoyen,
    definirEffetsReduits,
} from './store-etat-partie.js';
import { existeStockage, lireStockage, ecrireStockage } from './progression-stockage.js';

export function obtenirDaltonien() {
    return store.accessibilite.daltonien;
}

export function definirDaltonien(actif) {
    store.accessibilite.daltonien = actif;
}

export function obtenirReduireEffetsAccessibilite() {
    return store.accessibilite.reduireEffets;
}

export function reduireEffetsAccessibiliteConfigure() {
    return store.accessibilite.reduireEffetsConfigure;
}

export function definirReduireEffetsAccessibilite(actif, configure = true) {
    store.accessibilite.reduireEffets = actif;
    if (configure) store.accessibilite.reduireEffetsConfigure = true;
    appliquerClasseEffetsReduits();
}

export function obtenirEffetsAccessibiliteReduits() {
    if (store.accessibilite.reduireEffetsConfigure) {
        return store.accessibilite.reduireEffets;
    }
    return obtenirPrefererMoinsAnimations();
}

export function appliquerClasseEffetsReduits() {
    definirEffetsReduits(obtenirEffetsAccessibiliteReduits() || obtenirFpsMoyen() < 45);
    if (typeof document === 'undefined' || !document.body?.classList?.toggle) return;
    document.body.classList.toggle('effets-reduits', obtenirEffetsAccessibiliteReduits());
}

export function chargerAccessibiliteDepuisStockage() {
    chargerConstellationClicSeulDepuisStockage();
    store.accessibilite.daltonien = lireStockage('derniereLigne_daltonien', 'false') === 'true';
    const configure = existeStockage('derniereLigne_reduireEffets');
    store.accessibilite.reduireEffetsConfigure = configure;
    if (configure) {
        store.accessibilite.reduireEffets =
            lireStockage('derniereLigne_reduireEffets', 'false') === 'true';
    } else {
        store.accessibilite.reduireEffets = obtenirPrefererMoinsAnimations();
    }
    appliquerClasseEffetsReduits();
}

export function synchroniserReduireEffetsPrefererMoinsAnimations() {
    if (store.accessibilite.reduireEffetsConfigure) return;
    store.accessibilite.reduireEffets = obtenirPrefererMoinsAnimations();
    appliquerClasseEffetsReduits();
}

export function persisterDaltonien(actif) {
    definirDaltonien(actif);
    ecrireStockage('derniereLigne_daltonien', actif.toString());
}

export function persisterReduireEffets(actif) {
    definirReduireEffetsAccessibilite(actif, true);
    ecrireStockage('derniereLigne_reduireEffets', actif.toString());
}

export function obtenirConstellationClicSeul() {
    return store.accessibilite.constellationClicSeul;
}

export function persisterConstellationClicSeul(actif) {
    store.accessibilite.constellationClicSeul = actif;
    ecrireStockage('derniereLigne_constellationClicSeul', actif.toString());
}

export function chargerConstellationClicSeulDepuisStockage() {
    store.accessibilite.constellationClicSeul = existeStockage(
        'derniereLigne_constellationClicSeul'
    )
        ? lireStockage('derniereLigne_constellationClicSeul', 'false') === 'true'
        : true;
}

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaReduitAnims = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaReduitAnims.addEventListener?.('change', (e) => {
        store.prefererMoinsAnimations = e.matches;
        synchroniserReduireEffetsPrefererMoinsAnimations();
    });
}
