import { CONFIG } from '../config/config-jeu.js';
import { etat } from '../etat/store-jeu.js';

/** @typedef {'tourner_cw' | 'tourner_ccw' | 'hold' | 'gauche' | 'droite' | 'bas' | 'chute'} ActionBufferisee */

export function obtenirInputBufferMax() {
    if (etat.modeJeu === 'sprint') {
        return CONFIG.sprintInputBufferMax ?? CONFIG.inputBufferMax ?? 2;
    }
    return CONFIG.inputBufferMax ?? 2;
}

/** @returns {ActionBufferisee[]} */
export function creerBufferInputVide() {
    return [];
}

/** @param {ActionBufferisee[] | ActionBufferisee | null | undefined} file */
export function premierBufferInput(file) {
    if (Array.isArray(file)) return file[0] ?? null;
    return file ?? null;
}

/** @param {ActionBufferisee[] | ActionBufferisee | null | undefined} file */
export function bufferInputEstVide(file) {
    if (Array.isArray(file)) return file.length === 0;
    return file == null;
}

/** @param {ActionBufferisee[] | ActionBufferisee | null | undefined} file @param {ActionBufferisee} action */
export function ajouterBufferInput(file, action) {
    const max = obtenirInputBufferMax();
    const q = Array.isArray(file) ? [...file] : file != null ? [file] : [];
    if (q.length >= max) q.shift();
    q.push(action);
    return q;
}

/** @param {ActionBufferisee[] | ActionBufferisee | null | undefined} file */
export function retirerPremierBufferInput(file) {
    if (!Array.isArray(file)) {
        if (file == null) return { file: creerBufferInputVide(), action: null };
        return { file: creerBufferInputVide(), action: file };
    }
    if (!file.length) return { file, action: null };
    const q = [...file];
    const action = q.shift() ?? null;
    return { file: q, action };
}
