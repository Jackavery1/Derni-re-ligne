/** Cutscene histoire (orchestration). */
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { store } from './store-core.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { definirHumeurRoboCutscene, dessinerPortraitCutscene } from './portraits-cutscene.js';
import { dessinerRobo } from './rendu-robo.js';
import { afficherEcranHistoire, cacherEcransHistoire } from './histoire-cutscene-nav.js';
import {
    POSITION_PERSONNAGE,
    COULEUR_PERSONNAGE,
    idPortraitMeta,
    idPortraitRendu,
} from './histoire-cutscene-config.js';
import {
    lierCanvasFondCutscene,
    demarrerFondCutscene,
    stopFondCutscene,
    estFondCutsceneActif,
} from './histoire-cutscene-fonds.js';

let _canvasPortraitGauche = null;
let _canvasPortraitDroite = null;
let _ctxPortraitGauche = null;
let _ctxPortraitDroite = null;
let _canvasBgCutscene = null;
let _personnageGauche = null;
let _personnageDroite = null;
let _rafPortraits = null;
let _personnageParlant = 'narrateur';
let _cutsceneUiPret = false;

let cutsceneIndex = 0;
let cutsceneLignes = [];
let cutscenePersonnages = [];
let cutsceneCallbackFin = null;

let _typewriterTimeout = null;
let _typewriterActif = false;
let _fondPersonnageId = 'narrateur';

function _obtenirSequenceCutscene() {
    return cutsceneLignes.map((texte, i) => ({
        texte,
        personnage: cutscenePersonnages[i] ?? 'narrateur',
    }));
}

function _initCutsceneUI() {
    if (_cutsceneUiPret && _canvasPortraitGauche && _canvasPortraitDroite) return true;

    _canvasPortraitGauche = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-portrait-gauche')
    );
    _canvasPortraitDroite = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-portrait-droite')
    );
    _canvasBgCutscene = /** @type {HTMLCanvasElement | null} */ (
        document.getElementById('canvas-cutscene-bg')
    );
    if (_canvasPortraitGauche) _ctxPortraitGauche = _canvasPortraitGauche.getContext('2d');
    if (_canvasPortraitDroite) _ctxPortraitDroite = _canvasPortraitDroite.getContext('2d');
    if (_canvasBgCutscene) lierCanvasFondCutscene(_canvasBgCutscene);
    _cutsceneUiPret = Boolean(_canvasPortraitGauche && _canvasPortraitDroite);
    return _cutsceneUiPret;
}

function _reinitPersonnagesCutscene() {
    _personnageGauche = null;
    _personnageDroite = null;
    _personnageParlant = 'narrateur';
    _canvasPortraitGauche?.classList.remove('parle', 'ecoute');
    _canvasPortraitDroite?.classList.remove('parle', 'ecoute');
    _canvasPortraitGauche?.classList.add('absent');
    _canvasPortraitDroite?.classList.add('absent');
    if (_ctxPortraitGauche && _canvasPortraitGauche) {
        _ctxPortraitGauche.clearRect(
            0,
            0,
            _canvasPortraitGauche.width,
            _canvasPortraitGauche.height
        );
    }
    if (_ctxPortraitDroite && _canvasPortraitDroite) {
        _ctxPortraitDroite.clearRect(
            0,
            0,
            _canvasPortraitDroite.width,
            _canvasPortraitDroite.height
        );
    }
}

function _detecterParticipants(sequenceLignes) {
    const participants = [...new Set(sequenceLignes.map((l) => l.personnage))].filter(
        (p) => p !== 'narrateur' && POSITION_PERSONNAGE[p] !== 'centre'
    );
    _personnageGauche = participants.find((p) => POSITION_PERSONNAGE[p] === 'gauche') ?? null;
    _personnageDroite =
        participants.find((p) => POSITION_PERSONNAGE[p] && POSITION_PERSONNAGE[p] !== 'gauche') ??
        null;
}

function _dernierLocuteurCote(cote, jusquAIndex) {
    for (let i = jusquAIndex - 1; i >= 0; i--) {
        const perso = cutscenePersonnages[i] ?? 'narrateur';
        const pos = POSITION_PERSONNAGE[perso] ?? 'droite';
        if (pos === cote) return perso;
    }
    return cote === 'gauche' ? _personnageGauche : _personnageDroite;
}

function _portraitsPourLigne(personnageActuel) {
    const posActuel = POSITION_PERSONNAGE[personnageActuel] ?? 'droite';
    if (posActuel === 'centre') {
        return {
            gauche: _dernierLocuteurCote('gauche', cutsceneIndex + 1) ?? _personnageGauche,
            droite: _dernierLocuteurCote('droite', cutsceneIndex + 1) ?? _personnageDroite,
            parleGauche: false,
        };
    }

    const parleGauche = posActuel === 'gauche';
    return {
        gauche: parleGauche
            ? personnageActuel
            : (_dernierLocuteurCote('gauche', cutsceneIndex + 1) ?? _personnageGauche),
        droite: parleGauche
            ? (_dernierLocuteurCote('droite', cutsceneIndex + 1) ?? _personnageDroite)
            : personnageActuel,
        parleGauche,
    };
}

function _dessinerROBOSimple(ctx, w, h, ts, humeur) {
    const cx = w * 0.5;
    const E = Math.min(w, h) * 0.04;
    ctx.fillStyle = '#5533aa';
    ctx.fillRect(cx - 3 * E, h * 0.42, 6 * E, 7 * E);
    ctx.fillStyle = '#d42b2b';
    ctx.fillRect(cx - 2.5 * E, h * 0.24, 5 * E, 4.5 * E);
    ctx.fillStyle = '#00ddc8';
    const ouv = humeur === 'alerte' ? E * 1.6 : E * 1.2;
    ctx.beginPath();
    ctx.ellipse(cx - 1.2 * E, h * 0.35, E * 0.8, ouv, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 1.2 * E, h * 0.35, E * 0.8, ouv, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#00ddc8';
    ctx.strokeStyle = '#00ddc8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 1.2 * E, h * 0.35, E * 0.8, ouv, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    void ts;
}

function _dessinerPortrait(canvas, ctx, personnageId, parle, ts) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const idRendu = idPortraitRendu(personnageId);

    if (idRendu === 'robo') {
        const humeur = parle ? 'content' : 'neutre';
        definirHumeurRoboCutscene(humeur);
        if (typeof dessinerRobo === 'function') {
            try {
                dessinerRobo(ctx, w, h, humeur, ts / 1000);
                return;
            } catch {
                _dessinerROBOSimple(ctx, w, h, ts, humeur);
                return;
            }
        }
        _dessinerROBOSimple(ctx, w, h, ts, humeur);
        return;
    }

    try {
        dessinerPortraitCutscene(ctx, w, h, idRendu, ts / 1000);
    } catch (err) {
        logger.warn('[cutscene] erreur portrait :', err);
    }
}

function _mettreAJourPortraitsCutscene(personnageActuel, sequenceLignes, ts) {
    if (!_canvasPortraitGauche || !_canvasPortraitDroite) return;

    if (!_personnageGauche && !_personnageDroite) {
        _detecterParticipants(sequenceLignes);
    }

    const { gauche, droite, parleGauche } = _portraitsPourLigne(personnageActuel);
    const posActuel = POSITION_PERSONNAGE[personnageActuel] ?? 'droite';
    const enEcoute = posActuel === 'centre';

    const clsG = !gauche ? 'absent' : enEcoute || !parleGauche ? 'ecoute' : 'parle';
    const clsD = !droite ? 'absent' : enEcoute || parleGauche ? 'ecoute' : 'parle';
    _canvasPortraitGauche.className = clsG;
    _canvasPortraitDroite.className = clsD;

    if (gauche) {
        _dessinerPortrait(
            _canvasPortraitGauche,
            _ctxPortraitGauche,
            gauche,
            !enEcoute && parleGauche,
            ts
        );
    }
    if (droite) {
        _dessinerPortrait(
            _canvasPortraitDroite,
            _ctxPortraitDroite,
            droite,
            !enEcoute && !parleGauche,
            ts
        );
    }

    const couleur = COULEUR_PERSONNAGE[personnageActuel] ?? '#ffffff';
    const nomEl = document.getElementById('nom-perso-dialogue');
    if (nomEl) nomEl.style.setProperty('--couleur-perso', couleur);
}

function _stopBouclePortraits() {
    if (_rafPortraits) {
        cancelAnimationFrame(_rafPortraits);
        _rafPortraits = null;
    }
}

function _demarrerBouclePortraits() {
    if (_rafPortraits) return;
    function boucle(ts) {
        if (!store.histoire.cutscene.enCours) return;
        _mettreAJourPortraitsCutscene(_personnageParlant, _obtenirSequenceCutscene(), ts);
        _rafPortraits = requestAnimationFrame(boucle);
    }
    _rafPortraits = requestAnimationFrame(boucle);
}

function _appliquerFondPersonnage(personnageId) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran) return;
    if (_fondPersonnageId !== personnageId) {
        ecran.dataset.personnage = personnageId;
        _fondPersonnageId = personnageId;
    }
}

export function afficherCutsceneHistoire(textes, personnages, onFin, options = {}) {
    if (typeof personnages === 'function') {
        onFin = personnages;
        personnages = null;
    }

    const ecranCutscene = document.getElementById('ecran-histoire-cutscene');
    const texteEl = document.getElementById('texte-dialogue-cutscene');
    if (!ecranCutscene || !texteEl) {
        if (options.intro) {
            logger.error('[intro] moteur: conteneur cutscene introuvable dans le DOM');
        } else {
            logger.warn('[cutscene] conteneur cutscene introuvable dans le DOM');
        }
        return false;
    }

    if (!_initCutsceneUI()) {
        logger.warn('[cutscene] éléments portrait introuvables dans le DOM');
    }
    _reinitPersonnagesCutscene();

    cutsceneLignes = textes;
    cutscenePersonnages = personnages ?? [];
    cutsceneIndex = 0;
    _detecterParticipants(_obtenirSequenceCutscene());
    cutsceneCallbackFin = onFin ?? null;
    definirHumeurRoboCutscene(options.humeurRobo ?? 'content');
    store.histoire.cutscene.enCours = true;
    store.histoire.cutscene.onFin = onFin ?? null;

    _stopTypewriter();
    _stopBouclePortraits();
    stopFondCutscene();

    const nomEl = document.getElementById('nom-perso-dialogue');
    texteEl.textContent = '';
    if (nomEl) nomEl.textContent = '';

    const premiereLigne = cutscenePersonnages[0] ?? 'narrateur';
    demarrerFondCutscene(premiereLigne);
    _demarrerBouclePortraits();

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
        } else {
            logger.error('[cutscene] erreur affichage ligne', err);
        }
        cacherEcransHistoire();
        store.histoire.cutscene.enCours = false;
        store.histoire.cutscene.onFin = null;
        cutsceneCallbackFin = null;
        throw err;
    }

    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress && textes.length > 0) {
        elProgress.textContent = `1 / ${textes.length}`;
    }

    return true;
}

export function passerCutscene() {
    if (_typewriterActif) {
        _stopTypewriter();
        const el = document.getElementById('texte-dialogue-cutscene');
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
        const el = document.getElementById('texte-dialogue-cutscene');
        if (el) el.textContent = cutsceneLignes[cutsceneIndex] ?? '';
        _typewriterActif = false;
        return;
    }

    cutsceneIndex++;
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (cutsceneIndex >= cutsceneLignes.length) {
        const texteEl = document.getElementById('texte-dialogue-cutscene');
        const nomEl = document.getElementById('nom-perso-dialogue');
        if (texteEl) texteEl.textContent = '';
        if (nomEl) nomEl.textContent = '';
        if (elProgress) elProgress.textContent = '';
        _stopBouclePortraits();
        stopFondCutscene();
        _reinitPersonnagesCutscene();
        cacherEcransHistoire();
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
    const texteEl = document.getElementById('texte-dialogue-cutscene');
    if (!texteEl) return;

    const texte = cutsceneLignes[cutsceneIndex] ?? '';
    const personnageId = cutscenePersonnages[cutsceneIndex] ?? 'narrateur';
    const { PORTRAITS } = obtenirHistoireTextesSync();
    const p =
        PORTRAITS[personnageId] ?? PORTRAITS[idPortraitMeta(personnageId)] ?? PORTRAITS.narrateur;

    _personnageParlant = personnageId;
    const fondPrecedent = _fondPersonnageId;
    _appliquerFondPersonnage(personnageId);

    if (fondPrecedent !== personnageId || !estFondCutsceneActif()) {
        stopFondCutscene();
        demarrerFondCutscene(personnageId);
    }

    const nomEl = document.getElementById('nom-perso-dialogue');
    if (nomEl) {
        nomEl.textContent = p.nom;
        nomEl.style.setProperty('--couleur-perso', COULEUR_PERSONNAGE[personnageId] ?? p.couleur);
    }

    texteEl.className = `cutscene-police-${p.police}`;
    if (personnageId === 'distorsion') texteEl.dataset.glitch = '';
    else delete texteEl.dataset.glitch;

    _mettreAJourPortraitsCutscene(personnageId, _obtenirSequenceCutscene(), performance.now());

    texteEl.textContent = '';
    _demarrerTypewriter(texteEl, texte, p.vitesseMs ?? 35);
}

function _stopTypewriter() {
    if (_typewriterTimeout !== null) {
        clearTimeout(_typewriterTimeout);
        _typewriterTimeout = null;
    }
    _typewriterActif = false;
}

function _demarrerTypewriter(el, texte, vitesseMs) {
    _stopTypewriter();
    el.textContent = '';
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
export function afficherFinHistoire(finId) {
    void import('./fins-histoire.js').then(({ executerFin }) => executerFin(finId));
}

export function afficherBoutonCarteGameOver(afficher) {
    const btn = document.getElementById('btn-histoire-carte');
    if (btn) btn.style.display = afficher ? 'inline-block' : 'none';
}
