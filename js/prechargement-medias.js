import { SEQUENCE_HISTOIRE } from './histoire-donnees.js';
import { obtenirEtatHistoire, mondePeutEtreJoue } from './histoire-mondes.js';
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { SCENES_CUTSCENE } from './scenes-cutscene.js';
import { SCENE_DEFAUT_POST_MONDE } from './histoire-narratif-scenes.js';
import { URLS_PORTRAITS_PRECACHE } from './portraits-precache.js';
import { ECRANS } from './ecrans-config.js';
import { store } from './store-jeu.js';
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
 * @returns {string[]}
 */
function urlsMusiqueMonde(mondeId) {
    const base = `assets/musique/${mondeId}`;
    return [`${base}.ogg`, `${base}.m4a`];
}

function urlsMusiqueNarratifCutscene() {
    return urlsMusiqueMonde('narratif_cutscene');
}

/**
 * @param {unknown} entree
 * @returns {Array<{ scene?: string }>}
 */
function extraireLignesCutscene(entree) {
    if (!entree) return [];
    if (Array.isArray(entree)) return entree;
    return /** @type {{ lignes?: Array<{ scene?: string }> }} */ (entree).lignes ?? [];
}

/** @param {Set<string>} urls @param {string | null | undefined} sceneId */
function ajouterSrcScene(urls, sceneId) {
    if (!sceneId) return;
    const src = SCENES_CUTSCENE[sceneId]?.src;
    if (src) urls.add(src);
}

/**
 * @param {string} mondeId
 * @returns {string[]}
 */
function urlsScenesMonde(mondeId) {
    const urls = new Set();
    const textes = obtenirHistoireTextesSync();

    for (const entree of [
        textes?.CUTSCENES_ENTREE?.[mondeId],
        textes?.CUTSCENES_POST_MONDE?.[mondeId],
    ]) {
        if (!entree) continue;
        if (typeof entree === 'object' && !Array.isArray(entree) && 'scene' in entree) {
            ajouterSrcScene(urls, /** @type {{ scene?: string }} */ (entree).scene);
        }
        for (const ligne of extraireLignesCutscene(entree)) {
            ajouterSrcScene(urls, ligne?.scene);
        }
    }

    ajouterSrcScene(urls, SCENE_DEFAUT_POST_MONDE[mondeId]);

    if (mondeId === 'monde_cosmos' || mondeId === 'monde_vide') {
        ajouterSrcScene(urls, 'vide_errance');
    }

    return [...urls];
}

/**
 * @param {string} mondeId
 * @returns {string[]}
 */
export function listerUrlsScenesPrechargeMonde(mondeId) {
    return urlsScenesMonde(mondeId);
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
        const pistes = urlsMusiqueMonde(mondeId);
        for (const musique of pistes) {
            if (signal.aborted) return;
            await fetchSilencieux(musique, signal);
        }

        if (signal.aborted) return;

        for (const scene of urlsScenesMonde(mondeId)) {
            await fetchSilencieux(scene, signal);
            if (signal.aborted) return;
        }

        if (signal.aborted) return;

        for (const piste of urlsMusiqueNarratifCutscene()) {
            if (signal.aborted) return;
            await fetchSilencieux(piste, signal);
        }

        for (const portrait of URLS_PORTRAITS_PRECACHE) {
            if (signal.aborted) return;
            await fetchSilencieux(portrait, signal);
        }
    })().catch((err) => {
        if (/** @type {Error} */ (err).name !== 'AbortError') {
            logger.debug('[precharge] interrompu :', err);
        }
    });
}
