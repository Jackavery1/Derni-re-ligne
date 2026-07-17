import { obtenirActionsHistoire } from './histoire-actions.js';

/** @type {Promise<void> | null} */
let _assurerPromise = null;

/** Charge histoire-session (configure demarrerMonde / retour titre) une seule fois. */
export function assurerActionsHistoire() {
    const actions = obtenirActionsHistoire();
    if (actions.demarrerMonde && actions.retourTitreDepuisCarte) {
        return Promise.resolve();
    }
    if (!_assurerPromise) {
        _assurerPromise = import('./histoire-session.js').then(() => undefined);
    }
    return _assurerPromise;
}
