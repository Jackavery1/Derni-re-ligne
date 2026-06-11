import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { SCENES_CUTSCENE } from './scenes-cutscene.js';
import { ECRANS } from './ecrans-config.js';
import { store } from './store-core.js';
import { logger } from './logger.js';

/** @type {AbortController | null} */
let controleurActif = null;

/**
 * @returns {string | null}
 */
function obtenirProchainMondeJouable() {
    const etat = obtenirEtatHistoire();
    const sequenceP = SEQUENCE_HISTOIRE.filter((m) => !m.estCache);

    for (const monde of sequenceP) {
        if (etat.mondesCompletes.includes(monde.id)) continue;
        if (mondePeutEtreJoue(monde.id, etat)) return monde.id;
    }

    for (const monde of sequenceP) {
        if (mondePeutEtreJoue(monde.id, etat)) return monde.id;
    }

    return sequenceP[0]?.id ?? null;
}

/**
 * @param {string} mondeId
 * @returns {string | null}
 */
function urlMusiqueMonde(mondeId) {
    return `assets/musique/${mondeId}.ogg`;
}

/**
 * @param {string} mondeId
 * @returns {string | null}
 */
function urlSceneMonde(mondeId) {
    const entree = obtenirHistoireTextesSync()?.CUTSCENES_ENTREE?.[mondeId];
    const sceneId =
        entree && typeof entree === 'object' && !Array.isArray(entree) && 'scene' in entree
            ? entree.scene
            : null;
    if (!sceneId) return null;
    const scene = SCENES_CUTSCENE[sceneId];
    return scene?.type === 'image' ? scene.src : null;
}

export function annulerPrechargementMedias() {
    if (controleurActif) {
        logger.debug('[precharge] annule (partie lancee ou carte quittee)');
        controleurActif.abort();
        controleurActif = null;
    }
}

/**
 * @param {string} url
 * @param {AbortSignal} signal
 */
async function fetchSilencieux(url, signal) {
    try {
        await fetch(url, { signal, cache: 'default' });
        logger.debug('[precharge] cache SW declenche :', url);
    } catch (err) {
        if (/** @type {Error} */ (err).name === 'AbortError') throw err;
        logger.debug('[precharge] echec (fallback applicatif prevu) :', url);
    }
}

export function demarrerPrechargementCarte() {
    annulerPrechargementMedias();

    if (store.ecranActuel !== ECRANS.HISTOIRE_MAP) {
        logger.debug('[precharge] ignore — hors carte histoire (Arcade)');
        return;
    }

    /** @type {{ saveData?: boolean } | undefined} */
    const connexion =
        /** @type {Navigator & { connection?: { saveData?: boolean }; mozConnection?: { saveData?: boolean }; webkitConnection?: { saveData?: boolean } }} */ (
            navigator
        ).connection ??
        /** @type {Navigator & { mozConnection?: { saveData?: boolean } }} */ (navigator)
            .mozConnection ??
        /** @type {Navigator & { webkitConnection?: { saveData?: boolean } }} */ (navigator)
            .webkitConnection;
    if (connexion?.saveData) {
        logger.debug('[precharge] ignore — saveData actif');
        return;
    }

    const mondeId = obtenirProchainMondeJouable();
    if (!mondeId) {
        logger.debug('[precharge] aucun monde jouable');
        return;
    }

    controleurActif = new AbortController();
    const { signal } = controleurActif;

    logger.debug('[precharge] prochain monde :', mondeId);

    void (async () => {
        const musique = urlMusiqueMonde(mondeId);
        if (musique) {
            await fetchSilencieux(musique, signal);
        }

        if (signal.aborted) return;

        const scene = urlSceneMonde(mondeId);
        if (scene) {
            await fetchSilencieux(scene, signal);
        }
    })().catch((err) => {
        if (/** @type {Error} */ (err).name !== 'AbortError') {
            logger.debug('[precharge] interrompu :', err);
        }
    });
}
