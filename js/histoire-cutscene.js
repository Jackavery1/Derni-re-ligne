/** Cutscene histoire — orchestration (état séquence, navigation, callbacks). */
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { store } from './store-core.js';
import { ECRANS } from './ecrans-config.js';
import { etat } from './store-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';
import { logger } from './logger.js';
import { definirHumeurRoboCutscene } from './portraits-cutscene.js';
import { afficherEcranHistoire, cacherEcransHistoire } from './histoire-cutscene-nav.js';
import { COULEUR_PERSONNAGE, idPortraitMeta } from './histoire-cutscene-config.js';
import {
    demarrerFondCutscene,
    stopFondCutscene,
    definirSceneCutsceneFond,
    retirerSceneCutsceneFond,
} from './histoire-cutscene-fonds.js';
import { precharger, reinitialiserCacheScenes } from './scenes-cutscene.js';
import {
    assurerZoneNarrationCutscene,
    initDomCutscene,
    viderTextesCutscene,
    overlayNarratifVisible,
    appliquerFondPersonnageEcran,
    mettreAJourProgressCutscene,
    viderProgressCutscene,
    preparerTexteLigneCutscene,
    estLigneNarration,
    obtenirElTexteLigneCourante,
    refsDomCutscene,
} from './histoire-cutscene-ui.js';
import {
    detecterParticipantsCutscene,
    demarrerBouclePortraitsCutscene,
    stopBouclePortraitsCutscene,
    mettreAJourPortraitsCutscene,
    definirPersonnageParlantCutscene,
    reinitVisuelPortraitsCutscene,
} from './histoire-cutscene-portraits.js';
import { reinitExpressionsCutscene } from './expressions-cutscene.js';
import {
    typewriterEstActif,
    stopTypewriter,
    demarrerTypewriter,
    afficherTexteComplet,
} from './histoire-cutscene-typewriter.js';

let cutsceneIndex = 0;
let cutsceneLignes = [];
let cutscenePersonnages = [];
/** @type {(string | undefined)[]} */
let cutsceneHumeurs = [];
/** @type {(string | null | undefined)[]} */
let cutsceneScenes = [];
let cutsceneSceneDefaut = null;
/** @type {string | null} */
let _sceneActive = null;
let cutsceneCallbackFin = null;
let _finCutsceneEnCours = false;

function _normaliserEntreeCutscene(textes, personnages) {
    let sceneDefaut = null;
    /** @type {unknown} */
    let lignesRaw = textes;

    if (
        textes &&
        typeof textes === 'object' &&
        !Array.isArray(textes) &&
        'lignes' in /** @type {object} */ (textes)
    ) {
        sceneDefaut = /** @type {{ scene?: string }} */ (textes).scene ?? null;
        lignesRaw = /** @type {{ lignes?: unknown[] }} */ (textes).lignes ?? [];
    }

    if (
        Array.isArray(lignesRaw) &&
        lignesRaw.length > 0 &&
        typeof lignesRaw[0] === 'object' &&
        lignesRaw[0] !== null &&
        'texte' in /** @type {object} */ (lignesRaw[0])
    ) {
        return {
            sceneDefaut,
            lignes: lignesRaw.map((l) => /** @type {{ texte: string }} */ (l).texte ?? ''),
            personnages: lignesRaw.map(
                (l, i) =>
                    /** @type {{ personnage?: string }} */ (l).personnage ??
                    personnages?.[i] ??
                    'narrateur'
            ),
            humeurs: lignesRaw.map((l) => /** @type {{ humeur?: string }} */ (l).humeur),
            scenes: lignesRaw.map((l) => /** @type {{ scene?: string }} */ (l).scene ?? null),
        };
    }
    return {
        sceneDefaut,
        lignes: /** @type {string[]} */ (lignesRaw ?? []),
        personnages: personnages ?? [],
        humeurs: [],
        scenes: [],
    };
}

function _prechargerScenesCutscene(entree) {
    const ids = new Set();
    if (entree.sceneDefaut) ids.add(entree.sceneDefaut);
    for (const s of entree.scenes) {
        if (s) ids.add(s);
    }
    if (ids.size === 0) return;
    void Promise.all([...ids].map((id) => precharger(id)));
}

function _appliquerFondPourLigne(personnageId) {
    const sceneLigne = cutsceneScenes[cutsceneIndex];
    if (sceneLigne) {
        _sceneActive = sceneLigne;
    } else if (cutsceneIndex === 0 && cutsceneSceneDefaut) {
        _sceneActive = cutsceneSceneDefaut;
    }

    if (_sceneActive) {
        const ok = definirSceneCutsceneFond(_sceneActive, personnageId, performance.now());
        if (!ok) _sceneActive = null;
    } else {
        retirerSceneCutsceneFond(personnageId, performance.now());
    }
}

function _obtenirSequenceCutscene() {
    return cutsceneLignes.map((texte, i) => ({
        texte,
        personnage: cutscenePersonnages[i] ?? 'narrateur',
        humeur: cutsceneHumeurs[i],
    }));
}

function _restaurerEcranSiAucunActif() {
    if (document.querySelector('.ecran.actif') || overlayNarratifVisible()) return;
    if (!modeHistoireEnCours() || etat.estEnCours) return;
    void import('./navigation-ecrans.js').then(({ afficherEcran }) => {
        if (document.querySelector('.ecran.actif') || overlayNarratifVisible()) return;
        afficherEcran(ECRANS.GAME_OVER);
    });
}

function _terminerCutscene() {
    if (_finCutsceneEnCours) return;
    if (!store.histoire.cutscene.enCours && !cutsceneCallbackFin) return;
    _finCutsceneEnCours = true;

    stopTypewriter();
    viderTextesCutscene();
    viderProgressCutscene();
    stopBouclePortraitsCutscene();
    stopFondCutscene();
    reinitVisuelPortraitsCutscene();
    reinitExpressionsCutscene();

    cutsceneLignes = [];
    cutscenePersonnages = [];
    cutsceneHumeurs = [];
    cutsceneScenes = [];
    cutsceneSceneDefaut = null;
    _sceneActive = null;
    cutsceneIndex = 0;
    reinitialiserCacheScenes();

    store.histoire.cutscene.enCours = false;
    const cb = cutsceneCallbackFin;
    cutsceneCallbackFin = null;
    store.histoire.cutscene.onFin = null;

    cacherEcransHistoire();

    try {
        cb?.();
    } catch (err) {
        logger.error('[cutscene] erreur callback fin :', err);
        _restaurerEcranSiAucunActif();
    } finally {
        _finCutsceneEnCours = false;
    }
}

export function afficherCutsceneHistoire(textes, personnages, onFin, options = {}) {
    if (typeof personnages === 'function') {
        onFin = personnages;
        personnages = null;
    }

    const ecranCutscene = document.getElementById('ecran-histoire-cutscene');
    assurerZoneNarrationCutscene();
    const texteEl = document.getElementById('texte-dialogue-cutscene');
    if (!ecranCutscene || !texteEl) {
        if (options.intro) {
            logger.error('[intro] moteur: conteneur cutscene introuvable dans le DOM');
            return false;
        }
        logger.warn('[cutscene] conteneur cutscene introuvable dans le DOM');
        onFin?.();
        return false;
    }

    if (!initDomCutscene()) {
        logger.warn('[cutscene] éléments portrait introuvables dans le DOM');
    }
    reinitVisuelPortraitsCutscene();
    reinitExpressionsCutscene();

    const entree = _normaliserEntreeCutscene(textes, personnages);
    cutsceneLignes = entree.lignes;
    cutscenePersonnages = entree.personnages;
    cutsceneHumeurs = entree.humeurs;
    cutsceneScenes = entree.scenes;
    cutsceneSceneDefaut = entree.sceneDefaut;
    _sceneActive = entree.sceneDefaut ?? null;
    cutsceneIndex = 0;
    cutsceneCallbackFin = onFin ?? null;
    store.histoire.cutscene.onFin = onFin ?? null;

    _prechargerScenesCutscene(entree);

    if (!entree.lignes.length) {
        store.histoire.cutscene.enCours = true;
        _terminerCutscene();
        return true;
    }

    detecterParticipantsCutscene(_obtenirSequenceCutscene());
    definirHumeurRoboCutscene(options.humeurRobo ?? 'content');
    store.histoire.cutscene.enCours = true;

    stopTypewriter();
    stopBouclePortraitsCutscene();
    stopFondCutscene();
    viderTextesCutscene();

    const premiereLigne = cutscenePersonnages[0] ?? 'narrateur';
    _appliquerFondPourLigne(premiereLigne);
    demarrerBouclePortraitsCutscene(
        () => store.histoire.cutscene.enCours,
        () => ({
            personnageParlant: cutscenePersonnages[cutsceneIndex] ?? 'narrateur',
            sequenceLignes: _obtenirSequenceCutscene(),
            personnages: cutscenePersonnages,
            indexLigne: cutsceneIndex,
        })
    );

    afficherEcranHistoire(ECRANS.HISTOIRE_CUTSCENE);
    if (options.intro) {
        logger.debug('[intro] moteur: ecran HISTOIRE_CUTSCENE active');
    }

    try {
        afficherProchaineLigneCutscene();
        if (options.intro) {
            logger.debug('[intro] moteur: premiere ligne affichee');
        }
    } catch (err) {
        if (options.intro) {
            logger.error('[intro] moteur: erreur affichage ligne', err);
            cacherEcransHistoire();
            store.histoire.cutscene.enCours = false;
            cutsceneCallbackFin = null;
            store.histoire.cutscene.onFin = null;
            return false;
        }
        logger.error('[cutscene] erreur affichage ligne', err);
        cacherEcransHistoire();
        store.histoire.cutscene.enCours = false;
        const cb = cutsceneCallbackFin ?? onFin;
        cutsceneCallbackFin = null;
        store.histoire.cutscene.onFin = null;
        cb?.();
        return false;
    }

    mettreAJourProgressCutscene(0, entree.lignes.length);
    return true;
}

export function passerCutscene() {
    if (!store.histoire.cutscene.enCours) return;
    stopTypewriter();
    cutsceneIndex = cutsceneLignes.length - 1;
    avancerCutscene();
}

export function avancerCutscene() {
    if (!store.histoire.cutscene.enCours) return;

    if (typewriterEstActif()) {
        const personnageId = cutscenePersonnages[cutsceneIndex] ?? 'narrateur';
        const el = obtenirElTexteLigneCourante(personnageId);
        if (el) afficherTexteComplet(el, cutsceneLignes[cutsceneIndex] ?? '');
        return;
    }

    cutsceneIndex++;
    if (cutsceneIndex >= cutsceneLignes.length) {
        _terminerCutscene();
        return;
    }
    mettreAJourProgressCutscene(cutsceneIndex, cutsceneLignes.length);
    try {
        afficherProchaineLigneCutscene();
    } catch (err) {
        logger.error('[cutscene] erreur affichage ligne :', err);
        _terminerCutscene();
    }
}

function afficherProchaineLigneCutscene() {
    const texte = cutsceneLignes[cutsceneIndex] ?? '';
    const personnageId = cutscenePersonnages[cutsceneIndex] ?? 'narrateur';
    const estNarration = estLigneNarration(personnageId);

    const { PORTRAITS } = obtenirHistoireTextesSync();
    const p =
        PORTRAITS[personnageId] ?? PORTRAITS[idPortraitMeta(personnageId)] ?? PORTRAITS.narrateur;

    const prep = preparerTexteLigneCutscene({
        personnageId,
        estNarration,
        police: p.police,
        couleurPerso: COULEUR_PERSONNAGE[personnageId] ?? p.couleur,
        nom: p.nom,
    });
    if (!prep) return;

    definirPersonnageParlantCutscene(personnageId);
    appliquerFondPersonnageEcran(personnageId);
    _appliquerFondPourLigne(personnageId);

    mettreAJourPortraitsCutscene(
        personnageId,
        _obtenirSequenceCutscene(),
        cutscenePersonnages,
        cutsceneIndex,
        performance.now()
    );

    prep.texteEl.textContent = '';
    demarrerTypewriter(prep.texteEl, texte, p.vitesseMs ?? 35);
}

export function afficherFinHistoire(finId) {
    void import('./fins-histoire.js').then(({ executerFin }) => executerFin(finId));
}

export function afficherBoutonCarteGameOver(afficher) {
    const btn = document.getElementById('btn-histoire-carte');
    if (btn) btn.style.display = afficher ? 'inline-block' : 'none';
}
