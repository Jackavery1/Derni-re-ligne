import { BIOMES } from './config/config.js';
import { store } from './etat/store-jeu.js';
import { obtenirBiomeActif } from './etat/store-jeu.js';
import { modeHistoireEnCours } from './etat/mode-histoire.js';
import { biomeActuelEstVide, biomeActuelMecanique } from './mecaniques-histoire-queries.js';

const VIDE_SEUIL_INVISIBILITE_MS = () => (BIOMES.vide?.secondesAvantInvisibilite ?? 3) * 1000;

export function initialiserVide() {
    store.histoire.mecaniques.videTimestamp = performance.now();
    store.histoire.mecaniques.videInvisible = false;
    if (biomeActuelMecanique() === 'vide') mettreAJourHudVide();
}

export function reinitialiserVideSurNouvellePiece() {
    if (!modeHistoireEnCours()) return;
    if (!biomeActuelEstVide()) return;
    store.histoire.mecaniques.videTimestamp = performance.now();
    store.histoire.mecaniques.videInvisible = false;
    mettreAJourHudVide();
}

export function tickVide(timestamp) {
    if (store.histoire.mecaniques.videInvisible) return;
    if (!store.histoire.mecaniques.videTimestamp) return;
    const ecoule = timestamp - store.histoire.mecaniques.videTimestamp;
    if (ecoule >= VIDE_SEUIL_INVISIBILITE_MS()) {
        store.histoire.mecaniques.videInvisible = true;
    }
    mettreAJourHudVide();
}

export function pieceEstInvisible() {
    if (!modeHistoireEnCours()) return false;
    return biomeActuelEstVide() && store.histoire.mecaniques.videInvisible;
}

export function opacitePieceCourante() {
    if (!pieceEstInvisible()) return 1;
    return 0.35;
}

export function ghostEstDesactive() {
    if (!modeHistoireEnCours()) return false;
    const mec = biomeActuelMecanique();
    if (mec === 'paradoxe') return true;
    return BIOMES[obtenirBiomeActif()]?.pieceFantomeActive === false;
}

export function mettreAJourHudVide() {
    if (biomeActuelMecanique() !== 'vide') return;
    const el = document.querySelector('#indicateur-vide-actif .section-vide-msg');
    if (!el) return;
    if (store.histoire.mecaniques.videInvisible) {
        el.textContent = 'SIGNAL PERDU';
        return;
    }
    const restantMs =
        VIDE_SEUIL_INVISIBILITE_MS() -
        (performance.now() - store.histoire.mecaniques.videTimestamp);
    const sec = Math.max(0, Math.ceil(restantMs / 1000));
    el.textContent = sec > 0 ? `TRACE ${sec}s` : 'SIGNAL PERDU';
}
