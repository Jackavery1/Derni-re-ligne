/** Fonds animes canvas cutscene + scenes image plein ecran. */
import { CONFIG_FOND_CUTSCENE } from './histoire-cutscene-config.js';
import { obtenirScene, obtenirImageScenePrechargee, precharger } from '../rendu/scenes-cutscene.js';
import { obtenirEffetsAccessibiliteReduits } from '../ui/accessibilite.js';
import { logger } from '../io/logger.js';
import { dessinerFondCanvas } from './histoire-cutscene-fonds-animes.js';
import { dessinerImageScene } from './histoire-cutscene-fonds-scenes.js';

const DUREE_TRANSITION_SCENE_MS = 600;

let _canvasBgCutscene = null;
let _ctxBg = null;
let _rafBg = null;
let _fondActif = null;
let _sceneIdCourante = null;
let _sceneDebutMs = 0;
let _personnageFallback = 'narrateur';
let _transitionDebutMs = 0;
/** @type {string | null} */
let _transitionScenePrecedenteId = null;

function _syncAffichageSceneImage(actif) {
    _canvasBgCutscene?.classList.toggle('cutscene-bg-canvas', actif);
    document
        .getElementById('ecran-histoire-cutscene')
        ?.classList.toggle('cutscene-scene-image', actif);
}

export function lierCanvasFondCutscene(canvas) {
    _canvasBgCutscene = canvas;
    _ctxBg = canvas?.getContext('2d') ?? null;
}

function _boucleFondCutscene(ts) {
    if (!_ctxBg) return;
    _rafBg = requestAnimationFrame(_boucleFondCutscene);
    if (document.hidden) return;

    const w = _canvasBgCutscene.width;
    const h = _canvasBgCutscene.height;
    _ctxBg.clearRect(0, 0, w, h);

    const effetsReduits = obtenirEffetsAccessibiliteReduits();
    const scene = _sceneIdCourante ? obtenirScene(_sceneIdCourante) : null;
    const img = _sceneIdCourante ? obtenirImageScenePrechargee(_sceneIdCourante) : null;

    if (scene && img) {
        const elapsed = Math.max(0, ts - _sceneDebutMs);
        const progress = effetsReduits ? 0 : Math.min(1, elapsed / 45000);

        let transitionT = 1;
        if (_transitionDebutMs > 0) {
            transitionT = Math.min(1, (ts - _transitionDebutMs) / DUREE_TRANSITION_SCENE_MS);
            if (transitionT >= 1) {
                _transitionScenePrecedenteId = null;
                _transitionDebutMs = 0;
            }
        }

        if (_transitionScenePrecedenteId && transitionT < 1) {
            const prevImg = obtenirImageScenePrechargee(_transitionScenePrecedenteId);
            const prevScene = obtenirScene(_transitionScenePrecedenteId);
            if (prevImg && prevScene) {
                dessinerImageScene(_ctxBg, w, h, prevImg, prevScene, progress, 1 - transitionT);
            } else {
                dessinerFondCanvas(_ctxBg, w, h, ts, _fondActif);
            }
            dessinerImageScene(_ctxBg, w, h, img, scene, progress, transitionT);
        } else {
            dessinerImageScene(_ctxBg, w, h, img, scene, progress, 1);
        }
        return;
    }

    dessinerFondCanvas(_ctxBg, w, h, ts, _fondActif);
}

function _assurerBoucleFond() {
    if (!_ctxBg || !_canvasBgCutscene) return;
    _canvasBgCutscene.width = window.innerWidth;
    _canvasBgCutscene.height = window.innerHeight;
    if (!_rafBg) _rafBg = requestAnimationFrame(_boucleFondCutscene);
}

/**
 * @param {string} sceneId
 * @param {string} personnageFallback
 * @param {number} [timestamp]
 */
export function definirSceneCutsceneFond(
    sceneId,
    personnageFallback,
    timestamp = performance.now()
) {
    if (!_ctxBg || !_canvasBgCutscene) return false;
    const scene = obtenirScene(sceneId);
    if (!scene) return false;
    let img = obtenirImageScenePrechargee(sceneId);
    if (!img) {
        _personnageFallback = personnageFallback;
        _sceneIdCourante = sceneId;
        _sceneDebutMs = timestamp;
        _syncAffichageSceneImage(true);
        void precharger(sceneId).then((chargee) => {
            if (!chargee || _sceneIdCourante !== sceneId) return;
            definirSceneCutsceneFond(sceneId, personnageFallback, performance.now());
        });
        logger.debug('[scenes] fallback canvas personnage', personnageFallback);
        demarrerFondCutscene(personnageFallback);
        return true;
    }

    _personnageFallback = personnageFallback;
    _fondActif = CONFIG_FOND_CUTSCENE[personnageFallback] ?? CONFIG_FOND_CUTSCENE.narrateur;

    if (_sceneIdCourante && _sceneIdCourante !== sceneId) {
        _transitionScenePrecedenteId = _sceneIdCourante;
        _transitionDebutMs = timestamp;
    } else if (!_sceneIdCourante) {
        _transitionScenePrecedenteId = null;
        _transitionDebutMs = 0;
    }

    _sceneIdCourante = sceneId;
    _sceneDebutMs = timestamp;
    _syncAffichageSceneImage(true);
    _assurerBoucleFond();
    return true;
}

/** @param {string} personnageId @param {number} [timestamp] */
export function retirerSceneCutsceneFond(personnageId, timestamp = performance.now()) {
    if (_sceneIdCourante) {
        _transitionScenePrecedenteId = _sceneIdCourante;
        _transitionDebutMs = timestamp;
    }
    _sceneIdCourante = null;
    _syncAffichageSceneImage(false);
    demarrerFondCutscene(personnageId ?? _personnageFallback);
}

export function demarrerFondCutscene(personnageId) {
    if (!_ctxBg || !_canvasBgCutscene) return;
    if (_sceneIdCourante && obtenirImageScenePrechargee(_sceneIdCourante)) return;
    _fondActif = CONFIG_FOND_CUTSCENE[personnageId] ?? CONFIG_FOND_CUTSCENE.narrateur;
    _personnageFallback = personnageId;
    _assurerBoucleFond();
}

export function stopFondCutscene() {
    if (_rafBg) {
        cancelAnimationFrame(_rafBg);
        _rafBg = null;
    }
    _fondActif = null;
    _sceneIdCourante = null;
    _transitionScenePrecedenteId = null;
    _transitionDebutMs = 0;
    _syncAffichageSceneImage(false);
    if (_ctxBg && _canvasBgCutscene) {
        _ctxBg.clearRect(0, 0, _canvasBgCutscene.width, _canvasBgCutscene.height);
    }
}

export function estFondCutsceneActif() {
    return _rafBg != null;
}

export function obtenirSceneCutsceneActive() {
    return _sceneIdCourante;
}
