import { logger } from './logger.js';

export const SCENES_CUTSCENE = {
    observatoire: {
        type: 'image',
        src: 'assets/cutscenes/scene_observatoire.png',
        voile: 0.45,
        kenBurns: 'zoom_lent',
    },
    labo_vera: {
        type: 'image',
        src: 'assets/cutscenes/scene_labo.png',
        voile: 0.5,
        kenBurns: 'pan_droite',
    },
    trame_primordiale: {
        type: 'image',
        src: 'assets/cutscenes/scene_trame.png',
        voile: 0.4,
        kenBurns: 'zoom_lent',
    },
};

/** @type {Map<string, { img: HTMLImageElement, charge: boolean, echec: boolean }>} */
const _cacheImages = new Map();
/** @type {Map<string, Promise<HTMLImageElement | null>>} */
const _promesses = new Map();

/** @param {string | null | undefined} idScene */
export function obtenirScene(idScene) {
    if (!idScene) return null;
    const scene = SCENES_CUTSCENE[idScene];
    if (!scene) {
        logger.debug('[scenes] scene inconnue', idScene);
        return null;
    }
    return scene;
}

/** @param {string} idScene */
export function precharger(idScene) {
    const scene = obtenirScene(idScene);
    if (!scene || scene.type !== 'image') return Promise.resolve(null);

    const entree = _cacheImages.get(idScene);
    if (entree?.charge && !entree.echec) return Promise.resolve(entree.img);
    if (_promesses.has(idScene)) return _promesses.get(idScene);

    const promesse = new Promise((resolve) => {
        if (typeof Image === 'undefined') {
            resolve(null);
            return;
        }
        const img = new Image();
        const cache = { img, charge: false, echec: false };
        _cacheImages.set(idScene, cache);
        img.onload = () => {
            cache.charge = true;
            resolve(img);
        };
        img.onerror = () => {
            cache.echec = true;
            logger.debug('[scenes] échec src → fallback canvas', scene.src);
            resolve(null);
        };
        img.src = scene.src;
    });
    _promesses.set(idScene, promesse);
    return promesse;
}

/** @param {string | null | undefined} idScene */
export function obtenirImageScenePrechargee(idScene) {
    if (!idScene) return null;
    const entree = _cacheImages.get(idScene);
    if (!entree?.charge || entree.echec) return null;
    return entree.img;
}

export function reinitialiserCacheScenes() {
    _cacheImages.clear();
    _promesses.clear();
}
