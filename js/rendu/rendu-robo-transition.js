const DUREE_TRANSITION_MS = 175;

/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} */
let _humeurAffichee = 'neutre';
/** @type {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} */
let _humeurCible = 'neutre';
let _debutTransitionMs = 0;

function _easingSortie(t) {
    const p = Math.min(1, Math.max(0, t));
    return p * (2 - p);
}

/**
 * @param {'neutre'|'content'|'excite'|'triste'|'alerte'|'tetris'} humeur
 * @param {number} tMs
 */
export function synchroniserTransitionHumeurRobo(humeur, tMs) {
    if (humeur === _humeurCible && _debutTransitionMs === 0) {
        _humeurAffichee = humeur;
        return;
    }
    if (humeur !== _humeurCible) {
        _humeurAffichee = _humeurCible;
        _humeurCible = humeur;
        _debutTransitionMs = tMs;
    }
}

/**
 * @param {number} tMs
 * @returns {{ humeurFrom: typeof _humeurAffichee, humeurTo: typeof _humeurCible, blend: number }}
 */
export function obtenirTransitionHumeurRobo(tMs) {
    if (_debutTransitionMs <= 0 || _humeurAffichee === _humeurCible) {
        return { humeurFrom: _humeurCible, humeurTo: _humeurCible, blend: 1 };
    }
    const blend = _easingSortie((tMs - _debutTransitionMs) / DUREE_TRANSITION_MS);
    if (blend >= 1) {
        _humeurAffichee = _humeurCible;
        _debutTransitionMs = 0;
        return { humeurFrom: _humeurCible, humeurTo: _humeurCible, blend: 1 };
    }
    return { humeurFrom: _humeurAffichee, humeurTo: _humeurCible, blend };
}

export function reinitialiserTransitionHumeurRobo() {
    _humeurAffichee = 'neutre';
    _humeurCible = 'neutre';
    _debutTransitionMs = 0;
}
