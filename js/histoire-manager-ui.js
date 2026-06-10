import { obtenirHistoireTextesSync } from './charger-histoire-textes.js';
import { definirExpressionVera } from './portraits-vera.js';
import { store } from './store-core.js';
import { ECRANS } from './ecrans-config.js';
import { logger } from './logger.js';
import { obtenirCanvas } from './dom-utils.js';
import { definirHumeurRoboCutscene, dessinerPortraitCutscene } from './portraits-cutscene.js';
import { dessinerRobo } from './rendu-robo.js';

/** @type {typeof import('./navigation-ecrans.js') | null} */
let _navigationModule = null;
const _navigationPromise = import('./navigation-ecrans.js').then((m) => {
    _navigationModule = m;
    return m;
});

function _afficherEcran(idEcran) {
    if (_navigationModule) {
        _navigationModule.afficherEcran(idEcran);
        return;
    }
    void _navigationPromise.then(({ afficherEcran }) => afficherEcran(idEcran));
}

function _cacherEcrans() {
    if (_navigationModule) {
        _navigationModule.cacherEcrans();
        return;
    }
    void _navigationPromise.then(({ cacherEcrans }) => cacherEcrans());
}

// ─── Positionnement des personnages dans le dialogue ─────────────────────

const POSITION_PERSONNAGE = {
    robo: 'gauche',
    vera: 'droite',
    distorsion: 'droite',
    narrateur: 'centre',
    systeme: 'droite',
    brasier: 'droite',
    brasier_voix: 'droite',
    sentinelle: 'droite',
    sentinelle_voix: 'droite',
    archiviste: 'droite',
    archiviste_voix: 'droite',
    avantgarde: 'droite',
    avantgarde_voix: 'droite',
};

const COULEUR_PERSONNAGE = {
    robo: '#00ddc8',
    vera: '#ff99ff',
    distorsion: '#9944ff',
    narrateur: 'rgba(255,255,255,0.5)',
    systeme: '#44ff88',
    brasier: '#ff6600',
    brasier_voix: '#ff6600',
    sentinelle: '#aaddff',
    sentinelle_voix: '#aaddff',
    archiviste: '#cc88ff',
    archiviste_voix: '#cc88ff',
    avantgarde: '#ff88ff',
    avantgarde_voix: '#ff88ff',
};

const CONFIG_FOND_CUTSCENE = {
    robo: { type: 'scanlines', couleur: '#00ddc8' },
    vera: { type: 'orbites', couleur: '#ff99ff' },
    distorsion: { type: 'vortex', couleur: '#9944ff' },
    systeme: { type: 'terminal', couleur: '#44ff88' },
    brasier: { type: 'flammes', couleur: '#ff6600' },
    brasier_voix: { type: 'flammes', couleur: '#ff6600' },
    sentinelle: { type: 'neige', couleur: '#aaddff' },
    sentinelle_voix: { type: 'neige', couleur: '#aaddff' },
    archiviste: { type: 'pluie_data', couleur: '#cc88ff' },
    archiviste_voix: { type: 'pluie_data', couleur: '#cc88ff' },
    avantgarde: { type: 'energie', couleur: '#ff88ff' },
    avantgarde_voix: { type: 'energie', couleur: '#ff88ff' },
    narrateur: { type: 'etoiles', couleur: 'rgba(255,255,255,0.3)' },
};

let _canvasPortraitGauche = null;
let _canvasPortraitDroite = null;
let _ctxPortraitGauche = null;
let _ctxPortraitDroite = null;
let _canvasBgCutscene = null;
let _ctxBg = null;
let _rafBg = null;
/** @type {{ type: string, couleur: string } | null} */
let _fondActif = null;
let _personnageGauche = null;
let _personnageDroite = null;
let _rafPortraits = null;
let _personnageParlant = 'narrateur';
let _cutsceneUiPret = false;

let cutsceneIndex = 0;
let cutsceneLignes = [];
let cutscenePersonnages = [];
let cutsceneCallbackFin = null;
let journalCallbackFermer = null;

let _typewriterTimeout = null;
let _typewriterActif = false;
let _fondPersonnageId = 'narrateur';

const ALIAS_PORTRAIT_META = {
    archiviste_voix: 'archiviste',
    avantgarde_voix: 'avantgarde',
};

const ALIAS_PORTRAIT_RENDU = {
    archiviste_voix: 'archiviste',
    avantgarde_voix: 'avantgarde',
};

function _idPortraitMeta(personnageId) {
    return ALIAS_PORTRAIT_META[personnageId] ?? personnageId;
}

function _idPortraitRendu(personnageId) {
    return ALIAS_PORTRAIT_RENDU[personnageId] ?? personnageId;
}

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
    if (_canvasBgCutscene) _ctxBg = _canvasBgCutscene.getContext('2d');
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

function _demarrerFondCutscene(personnageId) {
    if (!_ctxBg || !_canvasBgCutscene) return;
    _fondActif = CONFIG_FOND_CUTSCENE[personnageId] ?? CONFIG_FOND_CUTSCENE.narrateur;
    _canvasBgCutscene.width = window.innerWidth;
    _canvasBgCutscene.height = window.innerHeight;
    if (!_rafBg) _rafBg = requestAnimationFrame(_boucleFondCutscene);
}

function _stopFondCutscene() {
    if (_rafBg) {
        cancelAnimationFrame(_rafBg);
        _rafBg = null;
    }
    _fondActif = null;
    if (_ctxBg && _canvasBgCutscene) {
        _ctxBg.clearRect(0, 0, _canvasBgCutscene.width, _canvasBgCutscene.height);
    }
}

const FONDS_CUTSCENE = {
    scanlines(ctx, w, h, ts) {
        ctx.strokeStyle = 'rgba(0,221,200,0.12)';
        ctx.lineWidth = 1;
        const decal = (ts * 0.03) % 12;
        for (let y = -12 + decal; y < h; y += 12) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0,221,200,0.08)';
        for (let i = 0; i < 30; i++) {
            const phase = Math.abs(Math.sin(ts * 0.0008 + i * 0.7));
            if (phase > 0.8) {
                const x = Math.abs(Math.sin(i * 137) * w);
                const y = Math.abs(Math.sin(i * 89) * h);
                ctx.fillRect(x, y, 2, 2);
            }
        }
    },
    orbites(ctx, w, h, ts) {
        const cx = w * 0.5;
        const cy = h * 0.45;
        for (let i = 0; i < 6; i++) {
            const ang = ts * 0.0006 * (i % 2 === 0 ? 1 : -0.7) + i * 1.05;
            const rx = 180 + i * 40;
            const ry = 100 + i * 20;
            const x = cx + Math.cos(ang) * rx;
            const y = cy + Math.sin(ang) * ry;
            const alpha = 0.15 + 0.15 * Math.abs(Math.sin(ts * 0.001 + i));
            ctx.strokeStyle = `rgba(255,153,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 6 + i * 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    vortex(ctx, w, h, ts) {
        const cx = w * 0.5;
        const cy = h * 0.45;
        for (let i = 0; i < 5; i++) {
            const r = 60 + i * 50 + Math.sin(ts * 0.001 + i) * 20;
            const a = ts * 0.0008 * (i % 2 === 0 ? 1 : -1) + i;
            const alpha = 0.08 + 0.05 * i;
            ctx.strokeStyle = `rgba(153,68,255,${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx + Math.sin(a) * 15, cy + Math.cos(a) * 10, r, a, a + Math.PI * 1.6);
            ctx.stroke();
        }
        if (Math.sin(ts * 0.002) > 0.7) {
            const y = (ts * 0.05) % h;
            ctx.fillStyle = 'rgba(255,0,200,0.12)';
            ctx.fillRect(0, y, w, 2);
        }
    },
    terminal(ctx, w, h, ts) {
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(68,255,136,0.18)';
        for (let i = 0; i < 15; i++) {
            const y = (i * 77 + ts * 0.04) % h;
            const x = (i * 137) % w;
            ctx.fillText(String.fromCharCode(48 + ((i + Math.floor(ts * 0.01)) % 62)), x, y);
        }
    },
    flammes(ctx, w, h, ts) {
        const puls = 0.5 + 0.5 * Math.sin(ts * 0.003);
        ctx.fillStyle = `rgba(255,100,0,${puls * 0.08})`;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) {
            const yb = h * (0.5 + i * 0.07);
            ctx.strokeStyle = 'rgba(255,80,0,0.07)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, yb);
            for (let x = 0; x <= w; x += 20) {
                ctx.lineTo(x, yb + Math.sin(x * 0.03 + ts * 0.002) * 8);
            }
            ctx.stroke();
        }
    },
    neige(ctx, w, h, ts) {
        ctx.fillStyle = 'rgba(180,220,255,0.25)';
        for (let i = 0; i < 25; i++) {
            const x = (i * 137 + ts * 0.015 * ((i % 3) + 1)) % w;
            const y = (i * 89 + ts * 0.008 * ((i % 2) + 0.5)) % h;
            ctx.fillRect(x, y, 2, 2);
        }
    },
    pluie_data(ctx, w, h, ts) {
        ctx.font = '9px monospace';
        for (let i = 0; i < 20; i++) {
            const y = (i * 57 + ts * 0.025 * (0.5 + i * 0.07)) % h;
            const alpha = 0.08 + 0.08 * Math.abs(Math.sin(ts * 0.001 + i));
            ctx.fillStyle = `rgba(200,136,255,${alpha})`;
            ctx.fillText(
                String.fromCharCode(48 + ((i + Math.floor(ts * 0.008)) % 62)),
                (i * 97) % w,
                y
            );
        }
    },
    energie(ctx, w, h, ts) {
        for (let i = 0; i < 8; i++) {
            const ang = ts * 0.001 * (i % 2 === 0 ? 0.8 : -0.6) + i * 0.8;
            const r = 100 + Math.sin(ts * 0.0015 + i) * 40;
            const x = w * 0.5 + Math.cos(ang) * r;
            const y = h * 0.45 + Math.sin(ang) * r * 0.6;
            ctx.fillStyle = `hsla(${i * 45 + ts * 0.05},100%,60%,0.12)`;
            ctx.fillRect(x, y, 4, 4);
        }
    },
};

function _fondEtoilesDefaut(ctx, w, h, ts) {
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 40; i++) {
        const puls = 0.5 + 0.5 * Math.sin(ts * 0.0005 * ((i % 5) + 1) + i * 0.6);
        ctx.globalAlpha = puls * 0.3;
        ctx.fillRect(
            (i * 127) % w,
            (i * 89) % h,
            1 + (i % 4 === 0 ? 1 : 0),
            1 + (i % 7 === 0 ? 1 : 0)
        );
    }
    ctx.globalAlpha = 1;
}

function _boucleFondCutscene(ts) {
    if (!_fondActif || !_ctxBg) return;
    _rafBg = requestAnimationFrame(_boucleFondCutscene);

    const w = _canvasBgCutscene.width;
    const h = _canvasBgCutscene.height;
    _ctxBg.clearRect(0, 0, w, h);

    _ctxBg.fillStyle = 'rgba(4,4,20,0.85)';
    _ctxBg.fillRect(0, 0, w, h);

    const dessiner = FONDS_CUTSCENE[_fondActif.type] ?? _fondEtoilesDefaut;
    dessiner(_ctxBg, w, h, ts);
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

    const idRendu = _idPortraitRendu(personnageId);

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
    _stopFondCutscene();

    const nomEl = document.getElementById('nom-perso-dialogue');
    texteEl.textContent = '';
    if (nomEl) nomEl.textContent = '';

    const premiereLigne = cutscenePersonnages[0] ?? 'narrateur';
    _demarrerFondCutscene(premiereLigne);
    _demarrerBouclePortraits();

    _afficherEcran(ECRANS.HISTOIRE_CUTSCENE);
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
        _cacherEcrans();
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
        _stopFondCutscene();
        _reinitPersonnagesCutscene();
        _cacherEcrans();
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
        PORTRAITS[personnageId] ?? PORTRAITS[_idPortraitMeta(personnageId)] ?? PORTRAITS.narrateur;

    _personnageParlant = personnageId;
    const fondPrecedent = _fondPersonnageId;
    _appliquerFondPersonnage(personnageId);

    if (fondPrecedent !== personnageId || !_rafBg) {
        _stopFondCutscene();
        _demarrerFondCutscene(personnageId);
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
                el.classList.add('histoire-journal-para-endommage');
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
        elDommage.classList.toggle('element-masque', !journal.estEndommage);
    }

    journalCallbackFermer = onFermer ?? null;

    _afficherEcran(ECRANS.HISTOIRE_JOURNAL);
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
    _cacherEcrans();
    cb?.();
}

export function afficherFinHistoire(finId) {
    void import('./fins-histoire.js').then(({ executerFin }) => executerFin(finId));
}

export function afficherBoutonCarteGameOver(afficher) {
    const btn = document.getElementById('btn-histoire-carte');
    if (btn) btn.style.display = afficher ? 'inline-block' : 'none';
}
