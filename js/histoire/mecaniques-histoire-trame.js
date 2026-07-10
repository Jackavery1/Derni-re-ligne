import { BIOMES } from '../config/biomes.js';
import { store } from '../etat/store-jeu.js';

const TRAME_BIOMES_CYCLE = [
    'classique',
    'lave',
    'ocean',
    'foret',
    'glace',
    'desert',
    'cyber',
    'fuochi',
    'cosmos',
];

const TRAME_INTERVALLE_MORPH_MS = () => BIOMES.trame?.intervalleMorphMs ?? 35000;
const TRAME_DUREE_FADE_MS = () => BIOMES.trame?.dureeFadeMs ?? 1200;

export function initialiserTrame() {
    store.histoire.mecaniques.trameBiomeIndex = 0;
    store.histoire.mecaniques.trameTimerMorph = 0;
    store.histoire.mecaniques.trameAlphaMorph = 1.0;
    store.histoire.mecaniques.trameEnTransition = false;
}

export function tickTrame(dt) {
    store.histoire.mecaniques.trameTimerMorph += dt;
    if (
        !store.histoire.mecaniques.trameEnTransition &&
        store.histoire.mecaniques.trameTimerMorph >= TRAME_INTERVALLE_MORPH_MS()
    ) {
        store.histoire.mecaniques.trameEnTransition = true;
        store.histoire.mecaniques.trameAlphaMorph = 1.0;
    }
    if (store.histoire.mecaniques.trameEnTransition) {
        store.histoire.mecaniques.trameAlphaMorph -= dt / TRAME_DUREE_FADE_MS();
        if (store.histoire.mecaniques.trameAlphaMorph <= 0) {
            store.histoire.mecaniques.trameBiomeIndex =
                (store.histoire.mecaniques.trameBiomeIndex + 1) % TRAME_BIOMES_CYCLE.length;
            store.histoire.mecaniques.trameAlphaMorph = 1.0;
            store.histoire.mecaniques.trameEnTransition = false;
            store.histoire.mecaniques.trameTimerMorph = 0;
        }
    }
}

export function obtenirFondTrame() {
    const biomeId = TRAME_BIOMES_CYCLE[store.histoire.mecaniques.trameBiomeIndex];
    const alpha = Math.max(0, Math.min(1, store.histoire.mecaniques.trameAlphaMorph));
    return { biomeId, alpha };
}
