import { TOUCHES_DEFAUT } from '../config/config.js';
import { lireStockage, ecrireStockage } from '../io/progression.js';

const CLE_STOCKAGE = 'derniereLigne_touches';

/** @typedef {typeof TOUCHES_DEFAUT} MappingTouches */

/** @type {(keyof MappingTouches)[]} */
export const ACTIONS_TOUCHES = [
    'gauche',
    'droite',
    'bas',
    'tournerH',
    'tournerAH',
    'chute',
    'hold',
    'pause',
];

/** @type {Record<keyof MappingTouches, string>} */
export const LIBELLES_ACTIONS = {
    gauche: 'Gauche',
    droite: 'Droite',
    bas: 'Descendre',
    tournerH: 'Tourner (horaire)',
    tournerAH: 'Tourner (anti-horaire)',
    chute: 'Chute rapide',
    hold: 'Réserve',
    pause: 'Pause',
};

/** @returns {MappingTouches} */
export function obtenirTouches() {
    try {
        const raw = lireStockage(CLE_STOCKAGE, '');
        if (!raw) return { ...TOUCHES_DEFAUT };
        const parsed = JSON.parse(raw);
        return { ...TOUCHES_DEFAUT, ...parsed };
    } catch {
        return { ...TOUCHES_DEFAUT };
    }
}

/** @param {Partial<MappingTouches>} touches */
export function sauvegarderTouches(touches) {
    const fusion = { ...obtenirTouches(), ...touches };
    ecrireStockage(CLE_STOCKAGE, JSON.stringify(fusion));
}

export function reinitialiserTouches() {
    ecrireStockage(CLE_STOCKAGE, '');
}

/** @param {string} code */
export function formaterCodeTouche(code) {
    const MAP = {
        ArrowLeft: '←',
        ArrowRight: '→',
        ArrowUp: '↑',
        ArrowDown: '↓',
        Space: 'ESPACE',
        Escape: 'ÉCHAP',
        ShiftLeft: '⇧ G',
        ShiftRight: '⇧ D',
    };
    if (MAP[code]) return MAP[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    return code;
}
