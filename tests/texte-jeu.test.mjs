import { describe, it, expect } from 'vitest';
import { sansAccentsE, definirTexteUi } from '../js/logique/texte-jeu.js';

describe('texte-jeu', () => {
    it('remplace e accentues par e', () => {
        expect(sansAccentsE("L'ÉVEIL — complété")).toBe("L'EVEIL — complete");
        expect(sansAccentsE('SYSTÈME')).toBe('SYSTEME');
    });

    it('laisse les autres lettres intactes', () => {
        expect(sansAccentsE('À propos du cosmos')).toBe('À propos du cosmos');
    });

    it('definirTexteUi affiche sans accents et conserve aria-label accentue', () => {
        /** @type {{ textContent: string, attrs: Record<string, string>, setAttribute: (n: string, v: string) => void, getAttribute: (n: string) => string | null, removeAttribute: (n: string) => void }} */
        const el = {
            textContent: '',
            attrs: {},
            setAttribute(n, v) {
                this.attrs[n] = v;
            },
            getAttribute(n) {
                return this.attrs[n] ?? null;
            },
            removeAttribute(n) {
                delete this.attrs[n];
            },
        };
        definirTexteUi(el, 'Éveil complété');
        expect(el.textContent).toBe('Eveil complete');
        expect(el.getAttribute('aria-label')).toBe('Éveil complété');
    });
});
