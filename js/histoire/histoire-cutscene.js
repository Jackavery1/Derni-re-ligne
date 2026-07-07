/** Cutscene histoire — orchestration (état séquence, navigation, callbacks). */
import { store } from '../etat/store-jeu.js';
import { ECRANS } from '../ui/ecrans-config.js';
import { etat } from '../etat/store-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { logger } from '../logger.js';
import { definirHumeurRoboCutscene } from '../portraits-cutscene.js';
import { afficherEcranHistoire, cacherEcransHistoire } from './histoire-cutscene-nav.js';
import {
    stopFondCutscene,
    definirSceneCutsceneFond,
    retirerSceneCutsceneFond,
} from './histoire-cutscene-fonds.js';
import { reinitialiserCacheScenes } from '../scenes-cutscene.js';
import {
    initialiserDomCutscene,
    viderTextesCutscene,
    overlayNarratifVisible,
    mettreAJourProgressCutscene,
    viderProgressCutscene,
} from './histoire-cutscene-ui.js';
import {
    detecterParticipantsCutscene,
    demarrerBouclePortraitsCutscene,
    stopBouclePortraitsCutscene,
    reinitVisuelPortraitsCutscene,
} from './histoire-cutscene-portraits.js';
import { reinitExpressionsCutscene } from '../expressions-cutscene.js';
import { assurerFeuilleStyle } from '../charger-feuille-style.js';
import { AudioMoteur } from '../audio/audio.js';
import { arreterMachineAEcrire } from './histoire-cutscene-typewriter.js';
import {
    normaliserEntreeCutscene,
    prechargerScenesCutscene,
    domCutscenePret,
    lierBoutonsCutsceneDom,
    afficherProchaineLigneCutscene,
    avancerCutsceneLignes,
    passerCutsceneLignes,
} from './histoire-cutscene-moteur.js';

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
/** @type {string | null} */
let _biomeMusiqueAvantCutscene = null;

function _obtenirSequenceCutscene() {
    return cutsceneLignes.map((texte, i) => ({
        texte,
        personnage: cutscenePersonnages[i] ?? 'narrateur',
        humeur: cutsceneHumeurs[i],
    }));
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

function _sessionLignes() {
    return {
        index: cutsceneIndex,
        lignes: cutsceneLignes,
        personnages: cutscenePersonnages,
        humeurs: cutsceneHumeurs,
        obtenirSequence: _obtenirSequenceCutscene,
        appliquerFondPourLigne: _appliquerFondPourLigne,
    };
}

function _ctxNavigationLignes() {
    return {
        enCours: () => store.histoire.cutscene.enCours,
        get index() {
            return cutsceneIndex;
        },
        set index(v) {
            cutsceneIndex = v;
        },
        lignes: cutsceneLignes,
        personnages: cutscenePersonnages,
        mettreAJourProgress: mettreAJourProgressCutscene,
        afficherLigne: () => afficherProchaineLigneCutscene(_sessionLignes()),
        terminer: _terminerCutscene,
    };
}

function _restaurerEcranSiAucunActif() {
    if (document.querySelector('.ecran.actif') || overlayNarratifVisible()) return;
    if (!modeHistoireEnCours() || etat.estEnCours) return;
    void import('../ui/navigation-ecrans.js').then(({ afficherEcran }) => {
        if (document.querySelector('.ecran.actif') || overlayNarratifVisible()) return;
        afficherEcran(ECRANS.GAME_OVER);
    });
}

function _terminerCutscene() {
    if (_finCutsceneEnCours) return;
    if (!store.histoire.cutscene.enCours && !cutsceneCallbackFin) return;
    _finCutsceneEnCours = true;

    arreterMachineAEcrire();
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

    if (_biomeMusiqueAvantCutscene) {
        AudioMoteur.transitionMusique(_biomeMusiqueAvantCutscene);
        _biomeMusiqueAvantCutscene = null;
    } else {
        AudioMoteur.arreterMusique(350);
    }

    document.getElementById(ECRANS.HISTOIRE_CUTSCENE)?.classList.remove('actif');

    try {
        cb?.();
    } catch (err) {
        logger.error('[cutscene] erreur callback fin :', err);
        _restaurerEcranSiAucunActif();
    } finally {
        _finCutsceneEnCours = false;
    }
}

function _demarrerCutsceneHistoire(textes, personnages, onFin, options = {}) {
    if (!domCutscenePret()) return false;

    lierBoutonsCutsceneDom(
        () => avancerCutscene(),
        () => passerCutscene()
    );

    if (!initialiserDomCutscene()) {
        logger.warn('[cutscene] éléments portrait introuvables dans le DOM');
    }
    reinitVisuelPortraitsCutscene();
    reinitExpressionsCutscene();

    const entree = normaliserEntreeCutscene(textes, personnages);
    cutsceneLignes = entree.lignes;
    cutscenePersonnages = entree.personnages;
    cutsceneHumeurs = entree.humeurs;
    cutsceneScenes = entree.scenes;
    cutsceneSceneDefaut = entree.sceneDefaut;
    _sceneActive = entree.sceneDefaut ?? null;
    cutsceneIndex = 0;
    cutsceneCallbackFin = onFin ?? null;
    store.histoire.cutscene.onFin = onFin ?? null;
    store.histoire.cutscene.enCours = true;

    _biomeMusiqueAvantCutscene = AudioMoteur.biomeMusique;
    AudioMoteur.transitionMusique('narratif_cutscene');

    if (!entree.lignes.length) {
        _terminerCutscene();
        return true;
    }

    void _lancerCutsceneAvecPrechargement(entree, options);

    return true;
}

async function _afficherCutsceneApresChargementDom(textes, personnages, onFin, options = {}) {
    try {
        await afficherEcranHistoire(ECRANS.HISTOIRE_CUTSCENE);
        if (_demarrerCutsceneHistoire(textes, personnages, onFin, options)) return;
    } catch (err) {
        logger.error('[cutscene] echec chargement fragment histoire :', err);
    }

    if (options.intro) {
        logger.error('[intro] moteur: conteneur cutscene introuvable apres chargement');
    } else {
        logger.warn('[cutscene] conteneur cutscene introuvable apres chargement');
    }
    onFin?.();
}

export function afficherCutsceneHistoire(textes, personnages, onFin, options = {}) {
    if (typeof personnages === 'function') {
        onFin = personnages;
        personnages = null;
    }

    if (_demarrerCutsceneHistoire(textes, personnages, onFin, options)) {
        return true;
    }

    void _afficherCutsceneApresChargementDom(textes, personnages, onFin, options);
    return true;
}

async function _lancerCutsceneAvecPrechargement(entree, options = {}) {
    const preload = Promise.all([
        assurerFeuilleStyle('assets/cutscenes/cutscenes.css').catch((err) => {
            logger.warn('[cutscene] feuille style :', err);
        }),
        prechargerScenesCutscene(entree).catch((err) => {
            logger.warn('[cutscene] scenes :', err);
        }),
    ]);

    try {
        await afficherEcranHistoire(ECRANS.HISTOIRE_CUTSCENE);
        if (options.intro) {
            logger.debug('[intro] moteur: ecran HISTOIRE_CUTSCENE active');
        }
    } catch (err) {
        logger.warn('[cutscene] ecran indisponible :', err);
    }
    if (!store.histoire.cutscene.enCours) return;

    await _demarrerAffichageCutscene(entree, options);
    void preload;
}

async function _demarrerAffichageCutscene(entree, options = {}) {
    detecterParticipantsCutscene(_obtenirSequenceCutscene());
    definirHumeurRoboCutscene(options.humeurRobo ?? 'content');

    arreterMachineAEcrire();
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

    try {
        afficherProchaineLigneCutscene(_sessionLignes());
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
            return;
        }
        logger.error('[cutscene] erreur affichage ligne', err);
        cacherEcransHistoire();
        store.histoire.cutscene.enCours = false;
        const cb = cutsceneCallbackFin;
        cutsceneCallbackFin = null;
        store.histoire.cutscene.onFin = null;
        cb?.();
        return;
    }

    mettreAJourProgressCutscene(0, entree.lignes.length);
}

export function passerCutscene() {
    passerCutsceneLignes(_ctxNavigationLignes());
}

export function avancerCutscene() {
    avancerCutsceneLignes(_ctxNavigationLignes());
}

export function afficherFinHistoire(finId) {
    void import('../fins-histoire.js').then(({ executerFin }) => executerFin(finId));
}

export function afficherBoutonCarteGameOver(afficher) {
    const btn = document.getElementById('btn-histoire-carte');
    if (!btn) return;
    btn.textContent = '🗺 CARTE';
    btn.setAttribute('aria-label', 'Retourner à la carte histoire');
    btn.classList.toggle('element-masque', !afficher);
    btn.style.display = '';
}
