import { logger } from './logger.js';
import { abonnerBoucleMenuUnifiee, desabonnerBoucleMenuUnifiee } from './planificateur-raf.js';
import {
    calculerAnimRobo,
    calculerBoundsEcran,
    dessinerCorpsRobo,
    dessinerAntenneRobo,
    dessinerCouronneRobo,
} from './rendu-robo-corps.js';
import { dessinerVisageRobo } from './rendu-robo-visage.js';

export { PALETTE_ROBO } from './rendu-robo-donnees.js';
export { dessinerRoboMiniature } from './rendu-robo-mini.js';

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} */
let _humeurActuelle = 'neutre';
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

/**
 * Dessine ROBO v3 (capsule écran-visage) sur le canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'} humeur
 * @param {number} t
 * @param {{ arcEnCiel?: boolean, couronne?: boolean, fondTransparent?: boolean }} [options]
 */
const FOND_MASCOTTE = '#08081a';

export function dessinerRobo(ctx, w, h, humeur, t, options = {}) {
    ctx.clearRect(0, 0, w, h);
    if (!options.fondTransparent) {
        ctx.fillStyle = FOND_MASCOTTE;
        ctx.fillRect(0, 0, w, h);
    }

    const E = Math.min(w / 120, h / 150);
    const cx = w / 2;
    const anim = calculerAnimRobo(humeur, t, E);
    const offsetY = anim.offsetY;
    const ecranBounds = calculerBoundsEcran(cx, E, offsetY, h);

    ctx.save();
    ctx.imageSmoothingEnabled = true;

    if (options.arcEnCiel) {
        ctx.filter = `hue-rotate(${(t * 80) % 360}deg)`;
    }

    dessinerCorpsRobo(ctx, cx, E, offsetY, h, humeur, t, anim);
    dessinerVisageRobo(
        ctx,
        cx,
        E,
        offsetY,
        h,
        humeur,
        t,
        anim.inclinaisonTete,
        _clignementInactif,
        ecranBounds
    );
    dessinerAntenneRobo(ctx, cx, E, offsetY, h, anim);

    if (options.couronne) {
        dessinerCouronneRobo(ctx, cx, E, offsetY, h, t);
    }

    ctx.restore();
}

/** @param {'neutre'|'content'|'excite'|'triste'|'alerte'} humeur */
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
    _humeurActuelle = 'tetris';
    _timeoutTetris = setTimeout(() => {
        _humeurActuelle = 'neutre';
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
