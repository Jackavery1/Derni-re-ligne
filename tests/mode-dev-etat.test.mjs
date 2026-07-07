import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    modeDevActif,
    activerSessionDev,
    desactiverSessionDev,
} from '../js/logique/mode-dev-etat.js';
import { mondePeutEtreJoue } from '../js/histoire/histoire-mondes.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

function mockSessionStorage() {
    const store = new Map();
    vi.stubGlobal('sessionStorage', {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
    });
}

describe('mode-dev-etat', () => {
    beforeEach(() => {
        mockSessionStorage();
        desactiverSessionDev();
    });

    afterEach(() => {
        desactiverSessionDev();
        vi.unstubAllGlobals();
    });

    it('inactif par défaut', () => {
        expect(modeDevActif()).toBe(false);
    });

    it('activation session', () => {
        activerSessionDev();
        expect(modeDevActif()).toBe(true);
        desactiverSessionDev();
        expect(modeDevActif()).toBe(false);
    });

    it('mondePeutEtreJoue reste strict sans conditions (pas de bypass carte)', () => {
        activerSessionDev();
        expect(mondePeutEtreJoue('monde_miroir', ETAT_HISTOIRE_VIDE)).toBe(false);
        expect(mondePeutEtreJoue('monde_lave', ETAT_HISTOIRE_VIDE)).toBe(false);
    });
});
