import { PORTRAITS } from './histoire-textes.js';
import { definirExpressionVera } from './portraits-vera.js';
import { store } from './store-core.js';
import { afficherEcran, cacherEcrans } from './navigation-ecrans.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { executerFin } from './fins-histoire.js';
import { definirHumeurRoboCutscene, dessinerPortraitCutscene } from './portraits-cutscene.js';

let cutsceneIndex = 0;
let cutsceneLignes = [];
let cutscenePersonnages = [];
let cutsceneCallbackFin = null;
let journalCallbackFermer = null;

// ── Typewriter
let _typewriterTimeout = null;
let _typewriterActif = false;

// ── Portrait canvas (rafId)
let _rafPortrait = null;
let _timestampPortrait = 0;

// ── Fond cutscene actuel
let _fondActuel = 'narrateur';

export function afficherCutsceneHistoire(textes, personnages, onFin, options = {}) {
    if (typeof personnages === 'function') {
        onFin = personnages;
        personnages = null;
    }
    cutsceneLignes = textes;
    cutscenePersonnages = personnages ?? [];
    cutsceneIndex = 0;
    cutsceneCallbackFin = onFin ?? null;
    definirHumeurRoboCutscene(options.humeurRobo ?? 'content');
    store.histoire.cutscene.enCours = true;
    store.histoire.cutscene.onFin = onFin ?? null;

    _stopTypewriter();
    _stopPortrait();
    const conteneur = document.getElementById('histoire-cutscene-lignes');
    if (conteneur) conteneur.textContent = '';

    afficherProchaineLigneCutscene();
    afficherEcran(ECRANS.HISTOIRE_CUTSCENE);

    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress && textes.length > 0) {
        elProgress.textContent = `1 / ${textes.length}`;
    }
}

export function passerCutscene() {
    if (_typewriterActif) {
        _stopTypewriter();
        const el = document.getElementById('histoire-cutscene-ligne-active');
        if (el) el.textContent = cutsceneLignes[cutsceneIndex] ?? '';
        _typewriterActif = false;
        return;
    }
    cutsceneIndex = cutsceneLignes.length - 1;
    avancerCutscene();
}

export function avancerCutscene() {
    if (_typewriterActif) {
        _stopTypewriter();
        const el = document.getElementById('histoire-cutscene-ligne-active');
        if (el) el.textContent = cutsceneLignes[cutsceneIndex] ?? '';
        _typewriterActif = false;
        return;
    }

    cutsceneIndex++;
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (cutsceneIndex >= cutsceneLignes.length) {
        const el = document.getElementById('histoire-cutscene-lignes');
        if (el) el.textContent = '';
        if (elProgress) elProgress.textContent = '';
        _stopPortrait();
        cacherEcrans();
        const cb = cutsceneCallbackFin;
        cutsceneCallbackFin = null;
        store.histoire.cutscene.enCours = false;
        store.histoire.cutscene.onFin = null;
        cb?.();
        return;
    }
    if (elProgress && cutsceneLignes.length > 0) {
        elProgress.textContent = `${cutsceneIndex + 1} / ${cutsceneLignes.length}`;
    }
    afficherProchaineLigneCutscene();
}

function afficherProchaineLigneCutscene() {
    const conteneur = document.getElementById('histoire-cutscene-lignes');
    if (!conteneur) return;

    const texte = cutsceneLignes[cutsceneIndex] ?? '';
    const personnageId = cutscenePersonnages[cutsceneIndex] ?? 'narrateur';
    const p = PORTRAITS[personnageId] ?? PORTRAITS.narrateur;

    _appliquerFondPersonnage(personnageId);
    mettreAJourPortraitCutscene(personnageId);

    const ligne = document.createElement('div');
    ligne.className = `histoire-cutscene-ligne cutscene-police-${p.police}`;
    ligne.id = 'histoire-cutscene-ligne-active';
    if (personnageId === 'distorsion') ligne.dataset.glitch = '';
    conteneur.textContent = '';
    conteneur.appendChild(ligne);
    conteneur.scrollTop = 0;

    _demarrerTypewriter(ligne, texte, p.vitesseMs ?? 35);
}

function mettreAJourPortraitCutscene(personnageId) {
    const p = PORTRAITS[personnageId] ?? PORTRAITS.narrateur;

    const nomEl = document.getElementById('histoire-cutscene-nom');
    if (nomEl) {
        nomEl.textContent = p.nom;
        nomEl.style.setProperty('--portrait-couleur', p.couleur);
        nomEl.className = `cutscene-nom cutscene-nom-${p.nomStyle}`;
    }

    const canvas = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-cutscene-portrait')
    );
    if (!canvas) return;

    _stopPortrait();
    canvas.style.setProperty('--portrait-couleur', p.couleur);
    canvas.dataset.personnage = personnageId;

    function bouclePortrait(ts) {
        _timestampPortrait = ts;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        try {
            dessinerPortraitCutscene(ctx, canvas.width, canvas.height, personnageId, ts / 1000);
        } catch (err) {
            logger.warn('[cutscene] erreur portrait :', err);
        }
        _rafPortrait = requestAnimationFrame(bouclePortrait);
    }
    _rafPortrait = requestAnimationFrame(bouclePortrait);
}

export function afficherJournalHistoire(journal, onFermer) {
    definirExpressionVera('journal_decouvert');
    const elTitre = document.getElementById('histoire-journal-titre');
    const elSsTitre = document.getElementById('histoire-journal-soustitre');
    const elTexte = document.getElementById('histoire-journal-texte');
    const elNum = document.getElementById('histoire-journal-numero');
    const canvas = obtenirCanvas('canvas-journal-illust');

    if (elNum) elNum.textContent = `TRANSMISSION ${String(journal.numero).padStart(2, '0')}`;
    if (elTitre) elTitre.textContent = journal.titre;
    if (elSsTitre) elSsTitre.textContent = journal.sousTitre;

    if (elTexte) {
        elTexte.textContent = '';
        journal.texte.forEach((para) => {
            const el = document.createElement('div');
            el.className = 'histoire-journal-para';
            if (journal.estEndommage && Math.random() < 0.3) {
                el.style.opacity = '0.5';
                el.style.filter = 'blur(0.5px)';
            }
            el.textContent = para;
            elTexte.appendChild(el);
        });
    }

    if (canvas) {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
            ctx2d.clearRect(0, 0, canvas.width, canvas.height);
            if (journal._illustrerFn) {
                try {
                    journal._illustrerFn(ctx2d, canvas.width, canvas.height);
                } catch (err) {
                    logger.warn('[journal] erreur illustration :', err);
                    illustrationFallback(ctx2d, canvas.width, canvas.height);
                }
            } else if (journal.illustration) {
                void import('./codex-illustrations.js')
                    .then(({ ILLUSTRATIONS_CODEX }) => {
                        const fn = ILLUSTRATIONS_CODEX[journal.illustration];
                        if (typeof fn === 'function') fn(ctx2d, canvas.width, canvas.height);
                        else illustrationFallback(ctx2d, canvas.width, canvas.height);
                    })
                    .catch(() => illustrationFallback(ctx2d, canvas.width, canvas.height));
            } else {
                illustrationFallback(ctx2d, canvas.width, canvas.height);
            }
        }
    }

    const elDommage = document.getElementById('histoire-journal-dommage');
    if (elDommage) {
        elDommage.style.display = journal.estEndommage ? 'block' : 'none';
    }

    journalCallbackFermer = onFermer ?? null;

    afficherEcran(ECRANS.HISTOIRE_JOURNAL);
}

function illustrationFallback(ctx2d, w, h) {
    ctx2d.fillStyle = '#04020a';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.fillStyle = 'rgba(255,0,110,0.15)';
    ctx2d.fillRect(0, 0, w, h);
}

export function fermerJournalHistoire() {
    const cb = journalCallbackFermer;
    journalCallbackFermer = null;
    cacherEcrans();
    cb?.();
}

export function afficherFinHistoire(finId) {
    executerFin(finId);
}

export function afficherBoutonCarteGameOver(afficher) {
    const btn = document.getElementById('btn-histoire-carte');
    if (btn) btn.style.display = afficher ? 'inline-block' : 'none';
}

function _stopTypewriter() {
    if (_typewriterTimeout !== null) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
    }
    _typewriterActif = false;
}

function _stopPortrait() {
    if (_rafPortrait !== null) {
        cancelAnimationFrame(_rafPortrait);
        _rafPortrait = null;
    }
}

function _demarrerTypewriter(el, texte, vitesseMs) {
    _stopTypewriter();
    _typewriterActif = true;
    let i = 0;

    function tapper() {
        if (!_typewriterActif) return;
        if (i < texte.length) {
            el.textContent += texte[i];
            i++;
            const pause = /[.,!?;:…—]/.test(texte[i - 1]) ? vitesseMs * 5 : vitesseMs;
            _typewriterTimeout = setTimeout(tapper, pause);
        } else {
            _typewriterActif = false;
        }
    }
    tapper();
}

function _appliquerFondPersonnage(personnageId) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran) return;
    if (_fondActuel !== personnageId) {
        ecran.dataset.personnage = personnageId;
        _fondActuel = personnageId;
    }
}
