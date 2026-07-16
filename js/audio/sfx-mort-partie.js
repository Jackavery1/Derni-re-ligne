import { AudioMoteur } from './audio.js';

let _sfxMortJoue = false;

/** Joue le SFX de mort une seule fois par run (topout ou GO forcé). */
export function jouerSfxMortPartie() {
    if (_sfxMortJoue) return false;
    _sfxMortJoue = true;
    AudioMoteur.son('game_over');
    return true;
}

export function reinitialiserSfxMortPartie() {
    _sfxMortJoue = false;
}

/** @internal tests */
export function _sfxMortPartieDejaJouePourTests() {
    return _sfxMortJoue;
}
