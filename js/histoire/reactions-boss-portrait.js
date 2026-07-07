import { logger } from '../logger.js';
import { store } from '../etat/store-jeu.js';
import { modeHistoireEnCours } from '../etat/mode-histoire.js';
import { obtenirEffetsAccessibiliteReduits } from '../ui/accessibilite.js';
import { PRESETS_BOSS } from '../rendu/expressions-cutscene-presets.js';

const DUREE_TRANSITION_MS = 400;
const DUREE_TETRIS_AGRESSIF_MS = 1500;

/** @typedef {'calme'|'agressif'|'vacillant'} ExpressionBoss */

/** @type {ExpressionBoss} */
let _expressionPhase = 'calme';
/** @type {ExpressionBoss} */
let _expressionCible = 'calme';
let _debutTransition = 0;
/** @type {Record<string, number | boolean> | null} */
let _paramsDepart = null;
let _timerTetrisAgressif = null;

/** @param {Record<string, number | boolean>} a @param {Record<string, number | boolean>} b @param {number} t */
function _lerp(a, b, t) {
    const cles = new Set([...Object.keys(a), ...Object.keys(b)]);
    /** @type {Record<string, number | boolean>} */
    const out = {};
    for (const cle of cles) {
        const va = a[cle];
        const vb = b[cle];
        if (typeof va === 'boolean' || typeof vb === 'boolean') {
            out[cle] = t >= 1 ? vb : va;
        } else if (typeof va === 'number' && typeof vb === 'number') {
            out[cle] = va + (vb - va) * t;
        } else {
            out[cle] = vb ?? va;
        }
    }
    return out;
}

function _easing(t) {
    const p = Math.min(1, Math.max(0, t));
    return p * (2 - p);
}

/** @param {ExpressionBoss} humeur */
function _preset(humeur) {
    return { ...(PRESETS_BOSS[humeur] ?? PRESETS_BOSS.calme) };
}

function _actif() {
    return modeHistoireEnCours() && !!store.histoire.boss.actif;
}

/** @param {ExpressionBoss} expression @param {number} [timestamp] */
function _definirExpression(expression, timestamp = performance.now()) {
    if (!_actif()) return;
    _paramsDepart = obtenirParamsPortraitBossCombat(timestamp);
    _expressionCible = expression;
    _debutTransition = timestamp;
    logger.debug('[reactions] boss portrait →', expression);
}

/**
 * @typedef {{ vitesseAnim: number, glow: number, echelle: number, vacillant: boolean, effetsReduits: boolean }} ParamsPortraitBossCombat
 */

/** @param {number} timestamp @returns {ParamsPortraitBossCombat} */
export function obtenirParamsPortraitBossCombat(timestamp = performance.now()) {
    if (!_actif()) return { ...PRESETS_BOSS.calme, effetsReduits: true };
    const cible = _preset(_expressionCible);
    const effetsReduits = obtenirEffetsAccessibiliteReduits();
    if (effetsReduits || !_paramsDepart) {
        return { ...cible, effetsReduits: true };
    }
    const elapsed = timestamp - _debutTransition;
    const t = _easing(elapsed / DUREE_TRANSITION_MS);
    const interpole = _lerp(_paramsDepart, cible, t);
    return /** @type {ParamsPortraitBossCombat} */ ({
        ...cible,
        ...interpole,
        effetsReduits: false,
    });
}

export function obtenirExpressionBossCombat() {
    return _expressionCible;
}

export function notifierPresentationBossPortrait() {
    if (!_actif()) return;
    _expressionPhase = 'calme';
    _definirExpression('calme');
}

export function notifierDebutCombatBossPortrait() {
    if (!_actif()) return;
    _expressionPhase = 'calme';
    _definirExpression('calme');
}

export function notifierPhaseBossPortrait() {
    if (!_actif()) return;
    _expressionPhase = 'agressif';
    if (_expressionCible === 'vacillant') return;
    _definirExpression('agressif');
}

export function notifierTetrisBossPortrait() {
    if (!_actif()) return;
    if (_expressionCible === 'vacillant') return;
    if (_timerTetrisAgressif !== null) clearTimeout(_timerTetrisAgressif);
    _definirExpression('agressif');
    _timerTetrisAgressif = setTimeout(() => {
        _timerTetrisAgressif = null;
        if (!_actif() || _expressionCible === 'vacillant') return;
        _definirExpression(_expressionPhase);
    }, DUREE_TETRIS_AGRESSIF_MS);
}

export function notifierQuasiVaincuBossPortrait() {
    if (!_actif()) return;
    if (_timerTetrisAgressif !== null) {
        clearTimeout(_timerTetrisAgressif);
        _timerTetrisAgressif = null;
    }
    _definirExpression('vacillant');
}

export function notifierGameOverBossPortrait() {
    if (!modeHistoireEnCours()) return;
    if (_timerTetrisAgressif !== null) {
        clearTimeout(_timerTetrisAgressif);
        _timerTetrisAgressif = null;
    }
    _definirExpression('calme');
}

export function reinitialiserReactionsBossPortrait() {
    _expressionPhase = 'calme';
    _expressionCible = 'calme';
    _debutTransition = 0;
    _paramsDepart = null;
    if (_timerTetrisAgressif !== null) {
        clearTimeout(_timerTetrisAgressif);
        _timerTetrisAgressif = null;
    }
}
