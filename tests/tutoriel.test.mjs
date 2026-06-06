import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initialiserTutoriel } from '../js/tutoriel.js';

function creerElement(initialClasses = ['element-masque']) {
    const classes = new Set(initialClasses);
    return {
        classList: {
            contains: (c) => classes.has(c),
            add: (c) => {
                classes.add(c);
            },
            remove: (c) => {
                classes.delete(c);
            },
        },
        addEventListener: vi.fn(),
        click: vi.fn(),
    };
}

describe('tutoriel', () => {
    /** @type {ReturnType<typeof creerElement>} */
    let overlay;
    /** @type {ReturnType<typeof creerElement>} */
    let btnFermer;

    beforeEach(() => {
        localStorage.clear();
        overlay = creerElement(['element-masque']);
        btnFermer = creerElement([]);
        btnFermer.addEventListener = vi.fn((_evt, fn) => {
            btnFermer.click = fn;
        });

        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'overlay-tutoriel') return overlay;
            if (id === 'btn-tutoriel-fermer') return btnFermer;
            if (id === 'btn-tutoriel-options') return creerElement([]);
            if (id === 'tab-controles') return creerElement([]);
            return null;
        });
    });

    it('affiche l overlay la première fois', () => {
        initialiserTutoriel();
        expect(overlay.classList.contains('element-masque')).toBe(false);
    });

    it('ne réaffiche pas l overlay après fermeture', () => {
        initialiserTutoriel();
        btnFermer.click();
        initialiserTutoriel();
        expect(overlay.classList.contains('element-masque')).toBe(true);
    });
});
