import { describe, it, expect, beforeEach } from 'vitest';
import {
    enchainementCampagneActif,
    definirEnchainementCampagneActif,
} from '../js/histoire/preferences-campagne.js';

describe('preferences-campagne', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('active l enchainement par defaut', () => {
        expect(enchainementCampagneActif()).toBe(true);
    });

    it('persiste la desactivation', () => {
        definirEnchainementCampagneActif(false);
        expect(enchainementCampagneActif()).toBe(false);
        expect(localStorage.getItem('derniereLigne_enchainementCampagne')).toBe('false');
    });
});
