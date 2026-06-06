import { PORTRAITS } from './histoire-textes.js';
import { store } from './store-core.js';
import { afficherEcran, cacherEcrans } from './navigation-ecrans.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { executerFin } from './fins-histoire.js';

let cutsceneIndex = 0;
let cutsceneLignes = [];
let cutscenePersonnages = [];
let cutsceneCallbackFin = null;
let journalCallbackFermer = null;

export function afficherCutsceneHistoire(textes, personnages, onFin) {
    if (typeof personnages === 'function') {
        onFin = personnages;
        personnages = null;
    }
    cutsceneLignes = textes;
    cutscenePersonnages = personnages ?? [];
    cutsceneIndex = 0;
    cutsceneCallbackFin = onFin ?? null;
    store.histoire.cutscene.enCours = true;
    store.histoire.cutscene.onFin = onFin ?? null;

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
    cutsceneIndex = cutsceneLignes.length - 1;
    avancerCutscene();
}

export function avancerCutscene() {
    cutsceneIndex++;
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (cutsceneIndex >= cutsceneLignes.length) {
        const el = document.getElementById('histoire-cutscene-lignes');
        if (el) el.textContent = '';
        if (elProgress) elProgress.textContent = '';
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

    const ligne = document.createElement('div');
    ligne.className = 'histoire-cutscene-ligne';
    ligne.textContent = cutsceneLignes[cutsceneIndex];
    conteneur.appendChild(ligne);
    conteneur.scrollTop = conteneur.scrollHeight;

    const personnageId = cutscenePersonnages[cutsceneIndex] ?? 'narrateur';
    mettreAJourPortraitCutscene(personnageId);
}

function mettreAJourPortraitCutscene(personnageId) {
    const p = PORTRAITS[personnageId] ?? PORTRAITS.narrateur;
    const el = document.getElementById('histoire-cutscene-portrait-icon');
    const nomEl = document.getElementById('histoire-cutscene-nom');
    if (el) {
        el.textContent = p.emoji;
        el.style.borderColor = p.couleur;
        el.style.boxShadow = `0 0 14px ${p.couleur}44`;
    }
    if (nomEl) {
        nomEl.textContent = p.nom;
        nomEl.style.color = p.couleur;
        nomEl.style.textShadow = `0 0 8px ${p.couleur}`;
    }
}

export function afficherJournalHistoire(journal, onFermer) {
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
