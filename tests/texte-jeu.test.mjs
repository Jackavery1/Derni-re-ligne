import { describe, it, expect } from 'vitest';
import { sansAccentsE } from '../js/texte-jeu.js';

describe('texte-jeu', () => {
    it('remplace e accentues par e', () => {
        expect(sansAccentsE("L'ÉVEIL — complété")).toBe("L'EVEIL — complete");
        expect(sansAccentsE('SYSTÈME')).toBe('SYSTEME');
    });

    it('laisse les autres lettres intactes', () => {
        expect(sansAccentsE('À propos du cosmos')).toBe('À propos du cosmos');
    });
});
