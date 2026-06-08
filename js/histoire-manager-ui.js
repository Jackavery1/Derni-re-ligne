import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { definirExpressionVera } from './portraits-vera.js';
import { store } from './store-core.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { definirHumeurRoboCutscene, dessinerPortraitCutscene } from './portraits-cutscene.js';

let _navigationPromise = null;
function _obtenirNavigation() {
    return (_navigationPromise ??= import('./navigation-ecrans.js'));
}

let _rafBg = null;
/** @type {HTMLCanvasElement | null} */
let _canvasBg = null;
let _ctxBg = null;
let _personnageActuelBg = 'narrateur';

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
    void _obtenirNavigation().then(({ afficherEcran }) => afficherEcran(ECRANS.HISTOIRE_CUTSCENE));

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
        _stopFondCutscene();
        void _obtenirNavigation().then(({ cacherEcrans }) => {
            cacherEcrans();
            const cb = cutsceneCallbackFin;
            cutsceneCallbackFin = null;
            store.histoire.cutscene.enCours = false;
            store.histoire.cutscene.onFin = null;
            cb?.();
        });
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
    const { PORTRAITS } = obtenirHistoireTextesSync();
    const p = PORTRAITS[personnageId] ?? PORTRAITS.narrateur;

    _appliquerFondPersonnage(personnageId);
    mettreAJourPortraitCutscene(personnageId);
    _demarrerFondCutscene(personnageId);

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
    const { PORTRAITS } = obtenirHistoireTextesSync();
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
                    .catch((err) => {
                        logger.warn('[journal] illustration codex indisponible :', err);
                        illustrationFallback(ctx2d, canvas.width, canvas.height);
                    });
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

    void _obtenirNavigation().then(({ afficherEcran }) => afficherEcran(ECRANS.HISTOIRE_JOURNAL));
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
    void _obtenirNavigation().then(({ cacherEcrans }) => {
        cacherEcrans();
        cb?.();
    });
}

export function afficherFinHistoire(finId) {
    void import('./fins-histoire.js').then(({ executerFin }) => executerFin(finId));
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

function _demarrerFondCutscene(personnageId) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran) return;

    let canvas = obtenirCanvas('canvas-cutscene-bg');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'canvas-cutscene-bg';
        canvas.className = 'cutscene-bg-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        ecran.insertBefore(canvas, ecran.firstChild);
    }

    _canvasBg = canvas;
    _ctxBg = canvas.getContext('2d');
    if (!_ctxBg) return;

    const w = ecran.clientWidth;
    const h = ecran.clientHeight;
    canvas.width = w;
    canvas.height = h;

    if (_rafBg !== null) {
        cancelAnimationFrame(_rafBg);
        _rafBg = null;
    }

    _personnageActuelBg = personnageId;
    _rafBg = requestAnimationFrame(_boucleFondCutscene);
}

function _stopFondCutscene() {
    if (_rafBg !== null) {
        cancelAnimationFrame(_rafBg);
        _rafBg = null;
    }
}

function _boucleFondCutscene(ts) {
    if (!_ctxBg || !_canvasBg) return;
    try {
        _dessinerFondPersonnage(
            _ctxBg,
            _canvasBg.width,
            _canvasBg.height,
            _personnageActuelBg,
            ts / 1000
        );
    } catch (err) {
        logger.warn('[cutscene] erreur fond animé :', err);
    }
    _rafBg = requestAnimationFrame(_boucleFondCutscene);
}

function _dessinerFondPersonnage(ctx, w, h, personnageId, t) {
    ctx.clearRect(0, 0, w, h);

    switch (personnageId) {
        case 'robo':
            _fondRobo(ctx, w, h, t);
            break;
        case 'vera':
            _fondVera(ctx, w, h, t);
            break;
        case 'distorsion':
            _fondDistorsion(ctx, w, h, t);
            break;
        case 'systeme':
            _fondSysteme(ctx, w, h, t);
            break;
        case 'brasier':
        case 'brasier_voix':
            _fondBrasier(ctx, w, h, t);
            break;
        case 'sentinelle':
        case 'sentinelle_voix':
            _fondSentinelle(ctx, w, h, t);
            break;
        case 'archiviste':
            _fondArchiviste(ctx, w, h, t);
            break;
        case 'avantgarde':
            _fondAvantgarde(ctx, w, h, t);
            break;
        default:
            _fondNarrateur(ctx, w, h, t);
            break;
    }
}

function _fondRobo(ctx, w, h, t) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#08081a');
    gradient.addColorStop(1, '#0c0c28');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 245, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const y = (t * 20 + i * 200) % h;
        ctx.globalAlpha = 0.04 + i * 0.01;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const lueur = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.6);
    lueur.addColorStop(0, 'rgba(0, 245, 255, 0.06)');
    lueur.addColorStop(1, 'transparent');
    ctx.fillStyle = lueur;
    ctx.fillRect(0, 0, w, h);
}

function _fondVera(ctx, w, h, t) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#08000f');
    gradient.addColorStop(1, '#04000a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const rayons = [w * 0.3, w * 0.45];
    for (let i = 0; i < 6; i++) {
        const angle = t * 0.4 + i * ((Math.PI * 2) / 6);
        const rayon = rayons[i % 2];
        const x = w / 2 + Math.cos(angle) * rayon;
        const y = h / 2 + Math.sin(angle) * rayon;
        ctx.fillStyle = `rgba(255, 0, 110, ${0.12 + (i % 3) * 0.02})`;
        ctx.fillRect(x - 1, y - 3, 2, 6);
    }

    ctx.strokeStyle = 'rgba(255, 0, 110, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const ySignal = h * 0.82;
    for (let x = 0; x <= w; x += 2) {
        const y = ySignal + Math.sin(x * 0.02 + t * 1.5) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function _fondDistorsion(ctx, w, h, t) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 8; i++) {
        const angle = t * 0.6 + i * ((Math.PI * 2) / 8);
        const r = w * 0.25 + Math.sin(t * 0.8 + i) * 20;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.fillStyle = `rgba(255, 0, 110, ${0.06 + Math.sin(t + i) * 0.04})`;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    const alphaFlash = 0.015 + Math.sin(t * 17) * 0.01;
    ctx.fillStyle =
        Math.sin(t * 17) >= 0
            ? `rgba(255, 0, 110, ${alphaFlash})`
            : `rgba(0, 255, 200, ${alphaFlash})`;
    ctx.fillRect(0, 0, w, h);
}

function _fondSysteme(ctx, w, h, t) {
    ctx.fillStyle = '#000a00';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(0, 255, 50, 0.03)';
    for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
    }

    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(0, 255, 68, 0.08)';
    for (let i = 0; i < 5; i++) {
        const x = (w / 6) * (i + 1);
        const y = (t * 30 + i * 60) % h;
        ctx.fillText(i % 2 === 0 ? '0' : '1', x, y);
    }
}

function _fondBrasier(ctx, w, h, t) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0a0200');
    gradient.addColorStop(1, '#1a0400');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const lueur = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w * 0.7);
    lueur.addColorStop(0, `rgba(255, 69, 0, ${0.08 + Math.sin(t * 1.5) * 0.04})`);
    lueur.addColorStop(1, 'transparent');
    ctx.fillStyle = lueur;
    ctx.fillRect(0, 0, w, h);

    const hauteurFlamme = 8 + Math.sin(t * 3) * 4;
    ctx.fillStyle = `rgba(255, 120, 0, ${0.25 + Math.sin(t * 2) * 0.1})`;
    ctx.fillRect(16, h - hauteurFlamme - 8, 2, hauteurFlamme);
    ctx.fillRect(w - 18, h - hauteurFlamme - 6, 2, hauteurFlamme);
}

function _fondSentinelle(ctx, w, h, t) {
    ctx.fillStyle = '#020810';
    ctx.fillRect(0, 0, w, h);

    const primes = [2, 3, 5, 7, 11, 13, 17, 19];
    for (let i = 0; i < 8; i++) {
        const graine = i * primes[i];
        const x = (((graine * 37) % 100) / 100) * w;
        const y = (((graine * 53) % 100) / 100) * h;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + Math.sin(t * 2 + i) * 0.06})`;
        ctx.fillRect(x, y, 2, 2);
    }

    ctx.strokeStyle = 'rgba(170, 238, 255, 0.08)';
    ctx.lineWidth = 2;
    const marge = 12;
    const longueur = 40;
    ctx.beginPath();
    ctx.moveTo(marge, marge);
    ctx.lineTo(marge + longueur, marge);
    ctx.moveTo(marge, marge);
    ctx.lineTo(marge, marge + longueur);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - marge, marge);
    ctx.lineTo(w - marge - longueur, marge);
    ctx.moveTo(w - marge, marge);
    ctx.lineTo(w - marge, marge + longueur);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(marge, h - marge);
    ctx.lineTo(marge + longueur, h - marge);
    ctx.moveTo(marge, h - marge);
    ctx.lineTo(marge, h - marge - longueur);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - marge, h - marge);
    ctx.lineTo(w - marge - longueur, h - marge);
    ctx.moveTo(w - marge, h - marge);
    ctx.lineTo(w - marge, h - marge - longueur);
    ctx.stroke();
}

function _fondArchiviste(ctx, w, h, t) {
    ctx.fillStyle = '#0a000f';
    ctx.fillRect(0, 0, w, h);

    const caracteres = '01@#アヲ';
    ctx.font = '7px monospace';
    for (let i = 0; i < 6; i++) {
        const x = (w / 7) * (i + 1);
        const vitesse = 25 + i * 8;
        const y = (t * vitesse + i * 80) % h;
        const car = caracteres[i % caracteres.length];
        ctx.fillStyle = 'rgba(255, 0, 255, 0.06)';
        ctx.fillText(car, x, y);
    }

    ctx.fillStyle = 'rgba(255, 0, 255, 0.03)';
    for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
    }
}

function _fondAvantgarde(ctx, w, h, t) {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, w, h);

    const cycle = Math.floor(t * 0.5) % 4;
    const couleurs = ['#ff0044', '#00f5ff', '#8844ff', '#8844ff'];
    const couleur = couleurs[cycle];
    const cx = w / 2;
    const cy = h / 2;

    ctx.strokeStyle = couleur;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const rayon = w * (0.15 + i * 0.12) + Math.sin(t * 1.2 + i) * 8;
        ctx.globalAlpha = 0.04;
        ctx.beginPath();
        ctx.arc(cx, cy, rayon, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function _fondNarrateur(ctx, w, h, t) {
    ctx.fillStyle = '#04020a';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 12; i++) {
        const x = (((i * 73 + 17) % 100) / 100) * w;
        const y = (((i * 41 + 29) % 100) / 100) * h;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + Math.sin(t * 0.3 + i * 0.7) * 0.08})`;
        ctx.fillRect(x, y, 1, 1);
    }
}
