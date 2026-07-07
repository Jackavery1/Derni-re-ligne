import { describe, it, expect } from 'vitest';
import {
    obtenirDecalageCentreConstellation,
    LARGEUR_PANNEAU_SEL_DESKTOP,
    SEUIL_PANNEAU_SEL_MOBILE,
} from '../js/logique/constellation-zone.js';

describe('constellation-zone', () => {
    it('decale le centre quand le panneau est ouvert sur desktop', () => {
        expect(obtenirDecalageCentreConstellation(true, 1920)).toBe(
            -LARGEUR_PANNEAU_SEL_DESKTOP / 2
        );
    });

    it('ne decale pas sur mobile', () => {
        expect(obtenirDecalageCentreConstellation(true, SEUIL_PANNEAU_SEL_MOBILE - 1)).toBe(0);
    });

    it('ne decale pas quand le panneau est ferme', () => {
        expect(obtenirDecalageCentreConstellation(false, 1920)).toBe(0);
    });
});
