import { logger } from '../logger.js';
import { abonnerBoucleMenuUnifiee, desabonnerBoucleMenuUnifiee } from '../planificateur-raf.js';
import {
    calculerAnimRobo,
    calculerBoundsCapsule,
    calculerBoundsEcran,
    dessinerCorpsRobo,
    dessinerAntenneRobo,
    dessinerCouronneRobo,
} from './rendu-robo-corps.js';
import { dessinerVisageRobo } from './rendu-robo-visage.js';
import {
    obtenirTransitionHumeurRobo,
    reinitialiserTransitionHumeurRobo,
    synchroniserTransitionHumeurRobo,
} from './rendu-robo-transition.js';

export { PALETTE_ROBO } from './rendu-robo-donnees.js';
export { dessinerRoboMiniature } from './rendu-robo-mini.js';
export { reinitialiserTransitionHumeurRobo } from './rendu-robo-transition.js';

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} */
let _humeurActuelle = 'neutre';
/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} */
let _humeurSauveeTetris = 'neutre';
/** @type {HTMLCanvasElement|null} */
let _canvas = null;
let _arcEnCielActif = false;
let _couronneActif = false;
let _clignementInactif = false;
let _boucleAbonnee = false;
/** @type {MutationObserver|null} */
let _observateurVisibilite = null;
/** @type {number|null} */
let _timeoutTetris = null;

const FOND_MASCOTTE = '#08081a';
const REF_W = 120;
const REF_H = 150;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {number} t
 * @param {{
 *   arcEnCiel?: boolean,
 *   couronne?: boolean,
 *   fondTransparent?: boolean,
 *   niveauDetail?: 'complet'|'mini',
 *   refletEcran?: boolean,
 *   skipClear?: boolean,
 * }} options
 */
function _dessinerRoboCore(ctx, w, h, humeur, t, options) {
    const niveauDetail = options.niveauDetail ?? 'complet';

    if (!options.skipClear) {
        ctx.clearRect(0, 0, w, h);
        if (!options.fondTransparent) {
            ctx.fillStyle = FOND_MASCOTTE;
            ctx.fillRect(0, 0, w, h);
        }
    }

    const E = Math.min(w / REF_W, h / REF_H);
    const cx = w / 2;
    const anim = calculerAnimRobo(humeur, t, E);
    let offsetY = 0;
    if (niveauDetail === 'mini') {
        anim.offsetY = 0;
        anim.antenneAngle = 0;
        anim.antenneTipAlpha = 1;
        anim.mainOffsetY = 0;
    } else {
        offsetY = anim.offsetY;
    }

    const bounds = calculerBoundsCapsule(cx, E, offsetY, h);
    const ecranBounds = calculerBoundsEcran(bounds);

    ctx.save();
    ctx.imageSmoothingEnabled = true;

    if (options.arcEnCiel) {
        ctx.filter = `hue-rotate(${(t * 80) % 360}deg)`;
    }

    dessinerCorpsRobo(ctx, bounds, E, humeur, t, anim, niveauDetail);
    dessinerVisageRobo(
        ctx,
        cx,
        E,
        offsetY,
        h,
        humeur,
        t,
        niveauDetail === 'mini' ? 0 : anim.inclinaisonTete,
        _clignementInactif,
        ecranBounds,
        { reflet: options.refletEcran !== false && niveauDetail !== 'mini' }
    );
    dessinerAntenneRobo(ctx, bounds, E, anim);

    if (options.couronne && niveauDetail === 'complet') {
        dessinerCouronneRobo(ctx, cx, E, offsetY, h, t);
    }

    ctx.restore();
}

/**
 * Dessine ROBO v3 (capsule écran-visage) sur le canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {number} t
 * @param {{
 *   arcEnCiel?: boolean,
 *   couronne?: boolean,
 *   fondTransparent?: boolean,
 *   niveauDetail?: 'complet'|'mini',
 *   refletEcran?: boolean,
 * }} [options]
 */
export function dessinerRobo(ctx, w, h, humeur, t, options = {}) {
    const niveauDetail = options.niveauDetail ?? 'complet';
    if (niveauDetail === 'mini') {
        _dessinerRoboCore(ctx, w, h, humeur, t, options);
        return;
    }

    const tMs = t * 1000;
    synchroniserTransitionHumeurRobo(humeur, tMs);
    const { humeurFrom, humeurTo, blend } = obtenirTransitionHumeurRobo(tMs);

    if (blend >= 1 || humeurFrom === humeurTo) {
        _dessinerRoboCore(ctx, w, h, humeurTo, t, options);
        return;
    }

    _dessinerRoboCore(ctx, w, h, humeurFrom, t, options);
    ctx.save();
    ctx.globalAlpha = blend;
    _dessinerRoboCore(ctx, w, h, humeurTo, t, {
        ...options,
        fondTransparent: true,
        skipClear: true,
    });
    ctx.restore();
}

/** @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur */
export function definirHumeurRobo(humeur) {
    _humeurActuelle = humeur;
}

export function definirClignementInactifMascotte(actif) {
    _clignementInactif = actif;
}

export function definirArcEnCiel(actif) {
    _arcEnCielActif = actif;
}

export function definirCouronne(actif) {
    _couronneActif = actif;
}

export function notifierTetrisRobo() {
    if (_timeoutTetris !== null) {
        clearTimeout(_timeoutTetris);
    }
    if (_humeurActuelle !== 'tetris') {
        _humeurSauveeTetris = _humeurActuelle;
    }
    _humeurActuelle = 'tetris';
    _timeoutTetris = setTimeout(() => {
        _humeurActuelle = _humeurSauveeTetris;
        _timeoutTetris = null;
    }, 600);
}

function _mascotteVisible() {
    if (!document.body.classList.contains('partie-active')) return false;
    const section = document.getElementById('section-mascotte');
    if (!section) return false;
    if (section.classList.contains('element-masque')) return false;
    const style = getComputedStyle(section);
    return style.display !== 'none' && style.visibility !== 'hidden';
}

function _synchroniserAbonnementBoucle() {
    const visible = _mascotteVisible();
    if (visible && !_boucleAbonnee) {
        abonnerBoucleMenuUnifiee(_boucle);
        _boucleAbonnee = true;
    } else if (!visible && _boucleAbonnee) {
        desabonnerBoucleMenuUnifiee(_boucle);
        _boucleAbonnee = false;
    }
}

function _installerObservateurVisibilite() {
    if (_observateurVisibilite || typeof MutationObserver === 'undefined') return;
    const section = document.getElementById('section-mascotte');
    if (!section) return;
    _observateurVisibilite = new MutationObserver(() => _synchroniserAbonnementBoucle());
    _observateurVisibilite.observe(section, {
        attributes: true,
        attributeFilter: ['class', 'style'],
    });
}

export function demarrerBoucleRobo() {
    _canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById('canvas-mascotte'));
    if (!_canvas) return;
    _installerObservateurVisibilite();
    _synchroniserAbonnementBoucle();
}

export function arreterBoucleRobo() {
    if (_boucleAbonnee) {
        desabonnerBoucleMenuUnifiee(_boucle);
        _boucleAbonnee = false;
    }
    _observateurVisibilite?.disconnect();
    _observateurVisibilite = null;
}

function _boucle(timestamp) {
    if (!_canvas) return;
    if (!_mascotteVisible()) {
        _synchroniserAbonnementBoucle();
        return;
    }
    const ctx = _canvas.getContext('2d');
    if (!ctx) return;
    try {
        const t = timestamp / 1000;
        dessinerRobo(ctx, _canvas.width, _canvas.height, _humeurActuelle, t, {
            arcEnCiel: _arcEnCielActif,
            couronne: _couronneActif,
        });
    } catch (err) {
        logger.warn('[rendu-robo] erreur boucle :', err);
    }
}
