import { CONFIG } from '../config/config-jeu.js';

/** @type {Record<'j1' | 'j2', Record<string, boolean>>} */
const touchesActives = { j1: {}, j2: {} };

/** @type {Record<'j1' | 'j2', Record<string, { moment: number, repete: boolean }>>} */
const dasEtat = { j1: {}, j2: {} };

/** @param {'j1' | 'j2'} joueur @param {string} code */
export function coopActiverTouche(joueur, code) {
    touchesActives[joueur][code] = true;
    if (!dasEtat[joueur][code]) {
        dasEtat[joueur][code] = { moment: 0, repete: false };
    } else {
        dasEtat[joueur][code].moment = 0;
        dasEtat[joueur][code].repete = false;
    }
}

/** @param {'j1' | 'j2'} joueur @param {string} code */
export function coopDesactiverTouche(joueur, code) {
    delete touchesActives[joueur][code];
    delete dasEtat[joueur][code];
}

export function reinitialiserDasCoop() {
    touchesActives.j1 = {};
    touchesActives.j2 = {};
    dasEtat.j1 = {};
    dasEtat.j2 = {};
}

const CODES_SOFT_DROP = new Set(['KeyS', 'ArrowDown']);

/**
 * @param {number} deltaTemps
 * @param {Record<'j1' | 'j2', Partial<Record<string, () => void>>>} actionParJoueur
 */
export function mettreAJourDasCoop(deltaTemps, actionParJoueur) {
    for (const joueur of /** @type {const} */ (['j1', 'j2'])) {
        for (const [code, action] of Object.entries(actionParJoueur[joueur] ?? {})) {
            if (!touchesActives[joueur][code] || !action) continue;
            const das = dasEtat[joueur][code] ?? { moment: 0, repete: false };
            dasEtat[joueur][code] = das;
            das.moment += deltaTemps;
            const delaiInitial = CODES_SOFT_DROP.has(code) ? CONFIG.dasDelaiSoft : CONFIG.dasDelai;
            if (!das.repete && das.moment >= delaiInitial) {
                das.repete = true;
                das.moment = 0;
                action();
            } else if (das.repete && das.moment >= CONFIG.arrInterval) {
                das.moment = 0;
                action();
            }
        }
    }
}
