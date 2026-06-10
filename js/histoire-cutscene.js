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
    estFondCutsceneActif,
} from './histoire-cutscene-fonds.js';
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
import {
    typewriterEstActif,
    stopTypewriter,
    demarrerTypewriter,
    afficherTexteComplet,
} from './histoire-cutscene-typewriter.js';

let cutsceneIndex = 0;
let cutsceneLignes = [];
let cutscenePersonnages = [];
let cutsceneCallbackFin = null;
let _finCutsceneEnCours = false;

function _obtenirSequenceCutscene() {
    return cutsceneLignes.map((texte, i) => ({
        texte,
        personnage: cutscenePersonnages[i] ?? 'narrateur',
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

    cutsceneLignes = [];
    cutscenePersonnages = [];
    cutsceneIndex = 0;

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

    cutsceneLignes = textes;
    cutscenePersonnages = personnages ?? [];
    cutsceneIndex = 0;
    cutsceneCallbackFin = onFin ?? null;
    store.histoire.cutscene.onFin = onFin ?? null;

    if (!textes.length) {
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
    demarrerFondCutscene(premiereLigne);
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

    mettreAJourProgressCutscene(0, textes.length);
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
    const fondPrecedent = refsDomCutscene.fondPersonnageId;
    appliquerFondPersonnageEcran(personnageId);

    if (fondPrecedent !== personnageId || !estFondCutsceneActif()) {
        stopFondCutscene();
        demarrerFondCutscene(personnageId);
    }

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
