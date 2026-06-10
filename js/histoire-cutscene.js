/** Cutscene histoire (orchestration). */
import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { store } from './store-core.js';
import { ECRANS } from './ecrans-config.js';
import { etat } from './store-jeu.js';
import { modeHistoireEnCours } from './mode-histoire.js';
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
let _finCutsceneEnCours = false;

function _obtenirSequenceCutscene() {
    return cutsceneLignes.map((texte, i) => ({
        texte,
        personnage: cutscenePersonnages[i] ?? 'narrateur',
    }));
}

function _estLigneNarration(personnageId) {
    return (POSITION_PERSONNAGE[personnageId] ?? 'droite') === 'centre';
}

function _obtenirElTexteLigneCourante() {
    const personnageId = cutscenePersonnages[cutsceneIndex] ?? 'narrateur';
    const estNarration = _estLigneNarration(personnageId);
    const narrationEl = document.getElementById('texte-narration-cutscene');
    const dialogueEl = document.getElementById('texte-dialogue-cutscene');
    if (estNarration && narrationEl) return narrationEl;
    return dialogueEl;
}

function _appliquerModeCutscene(estNarration) {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (ecran) {
        ecran.classList.toggle('cutscene-mode-narration', estNarration);
        ecran.classList.toggle('cutscene-mode-dialogue', !estNarration);
    }
}

function _viderTextesCutscene() {
    const dialogueEl = document.getElementById('texte-dialogue-cutscene');
    const narrationEl = document.getElementById('texte-narration-cutscene');
    const nomEl = document.getElementById('nom-perso-dialogue');
    if (dialogueEl) dialogueEl.textContent = '';
    if (narrationEl) narrationEl.textContent = '';
    if (nomEl) nomEl.textContent = '';
    _appliquerModeCutscene(false);
}

function _overlayNarratifVisible() {
    const tuto = document.getElementById('overlay-tutoriel');
    if (tuto && !tuto.classList.contains('element-masque')) return true;
    return Boolean(document.querySelector('.objectif-overlay-visible'));
}

function _restaurerEcranSiAucunActif() {
    if (document.querySelector('.ecran.actif') || _overlayNarratifVisible()) return;
    if (!modeHistoireEnCours() || etat.estEnCours) return;
    void import('./navigation-ecrans.js').then(({ afficherEcran }) => {
        if (document.querySelector('.ecran.actif') || _overlayNarratifVisible()) return;
        afficherEcran(ECRANS.GAME_OVER);
    });
}

function _terminerCutscene() {
    if (_finCutsceneEnCours) return;
    if (!store.histoire.cutscene.enCours && !cutsceneCallbackFin) return;
    _finCutsceneEnCours = true;

    _stopTypewriter();
    _viderTextesCutscene();
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress) elProgress.textContent = '';
    _stopBouclePortraits();
    stopFondCutscene();
    _reinitPersonnagesCutscene();

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

function _assurerZoneNarrationCutscene() {
    const ecran = document.getElementById('ecran-histoire-cutscene');
    if (!ecran || document.getElementById('texte-narration-cutscene')) return;

    let zone = document.getElementById('zone-narration-cutscene');
    if (!zone) {
        zone = document.createElement('div');
        zone.id = 'zone-narration-cutscene';
        zone.setAttribute('aria-live', 'polite');
        zone.setAttribute('aria-atomic', 'true');
        const ancre = document.getElementById('canvas-cutscene-bg');
        if (ancre?.nextSibling) {
            ecran.insertBefore(zone, ancre.nextSibling);
        } else {
            ecran.prepend(zone);
        }
    }

    const texte = document.createElement('div');
    texte.id = 'texte-narration-cutscene';
    zone.appendChild(texte);

    if (!document.getElementById('indicateur-suite-narration')) {
        const indicateur = document.createElement('span');
        indicateur.id = 'indicateur-suite-narration';
        indicateur.setAttribute('aria-hidden', 'true');
        indicateur.textContent = '▼';
        zone.appendChild(indicateur);
    }

    logger.debug('[cutscene] zone narration injectee (HTML cache obsolete)');
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
    _assurerZoneNarrationCutscene();
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

    if (!_initCutsceneUI()) {
        logger.warn('[cutscene] éléments portrait introuvables dans le DOM');
    }
    _reinitPersonnagesCutscene();

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

    _detecterParticipants(_obtenirSequenceCutscene());
    definirHumeurRoboCutscene(options.humeurRobo ?? 'content');
    store.histoire.cutscene.enCours = true;

    _stopTypewriter();
    _stopBouclePortraits();
    stopFondCutscene();

    _viderTextesCutscene();

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

    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (elProgress && textes.length > 0) {
        elProgress.textContent = `1 / ${textes.length}`;
    }

    return true;
}

export function passerCutscene() {
    if (!store.histoire.cutscene.enCours) return;
    _stopTypewriter();
    cutsceneIndex = cutsceneLignes.length - 1;
    avancerCutscene();
}

export function avancerCutscene() {
    if (!store.histoire.cutscene.enCours) return;

    if (_typewriterActif) {
        _stopTypewriter();
        const el = _obtenirElTexteLigneCourante();
        if (el) el.textContent = cutsceneLignes[cutsceneIndex] ?? '';
        _typewriterActif = false;
        return;
    }

    cutsceneIndex++;
    const elProgress = document.getElementById('histoire-cutscene-progress');
    if (cutsceneIndex >= cutsceneLignes.length) {
        _terminerCutscene();
        return;
    }
    if (elProgress && cutsceneLignes.length > 0) {
        elProgress.textContent = `${cutsceneIndex + 1} / ${cutsceneLignes.length}`;
    }
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
    let estNarration = _estLigneNarration(personnageId);
    const dialogueEl = document.getElementById('texte-dialogue-cutscene');
    const narrationEl = document.getElementById('texte-narration-cutscene');
    let texteEl = estNarration ? narrationEl : dialogueEl;
    if (!texteEl && estNarration && dialogueEl) {
        estNarration = false;
        texteEl = dialogueEl;
        logger.warn('[cutscene] zone narration absente, repli vers boite dialogue');
    }
    if (!texteEl) return;

    const { PORTRAITS } = obtenirHistoireTextesSync();
    const p =
        PORTRAITS[personnageId] ?? PORTRAITS[idPortraitMeta(personnageId)] ?? PORTRAITS.narrateur;

    _appliquerModeCutscene(estNarration);
    if (estNarration && dialogueEl) {
        dialogueEl.textContent = '';
    } else if (!estNarration && narrationEl) {
        narrationEl.textContent = '';
    }

    _personnageParlant = personnageId;
    const fondPrecedent = _fondPersonnageId;
    _appliquerFondPersonnage(personnageId);

    if (fondPrecedent !== personnageId || !estFondCutsceneActif()) {
        stopFondCutscene();
        demarrerFondCutscene(personnageId);
    }

    const nomEl = document.getElementById('nom-perso-dialogue');
    if (nomEl) {
        if (estNarration) {
            nomEl.textContent = '';
        } else {
            nomEl.textContent = p.nom;
            nomEl.style.setProperty(
                '--couleur-perso',
                COULEUR_PERSONNAGE[personnageId] ?? p.couleur
            );
        }
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
