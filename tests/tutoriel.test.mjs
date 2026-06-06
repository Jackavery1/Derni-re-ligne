import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initialiserTutoriel, afficherTutorielContextuel } from '../js/tutoriel.js';

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
        onclick: null,
        textContent: '',
        replaceChildren: vi.fn(function () {
            this.childNodes = [];
        }),
        appendChild: vi.fn(function (el) {
            this.childNodes = this.childNodes ?? [];
            this.childNodes.push(el);
        }),
        childNodes: [],
    };
}

describe('tutoriel', () => {
    /** @type {ReturnType<typeof creerElement>} */
    let overlay;
    /** @type {ReturnType<typeof creerElement>} */
    let btnFermer;
    /** @type {ReturnType<typeof creerElement>} */
    let corps;

    beforeEach(() => {
        localStorage.clear();
        overlay = creerElement(['element-masque']);
        btnFermer = creerElement([]);
        corps = creerElement([]);

        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'overlay-tutoriel') return overlay;
            if (id === 'btn-tutoriel-fermer') return btnFermer;
            if (id === 'btn-tutoriel-options') return creerElement([]);
            if (id === 'tab-controles') return creerElement([]);
            if (id === 'tutoriel-titre') return creerElement([]);
            if (id === 'tutoriel-corps') return corps;
            return null;
        });

        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = creerElement([]);
            el.tagName = tag;
            return el;
        });
    });

    it('affiche l overlay la première fois', () => {
        initialiserTutoriel();
        expect(overlay.classList.contains('element-masque')).toBe(false);
    });

    it('ne réaffiche pas l overlay accueil après fermeture', () => {
        initialiserTutoriel();
        btnFermer.onclick?.();
        initialiserTutoriel();
        expect(overlay.classList.contains('element-masque')).toBe(true);
    });

    it('affiche le tutoriel histoire la première fois', () => {
        afficherTutorielContextuel('histoire');
        expect(overlay.classList.contains('element-masque')).toBe(false);
        expect(corps.replaceChildren).toHaveBeenCalled();
    });

    it('ne réaffiche pas le tutoriel coop après fermeture', () => {
        afficherTutorielContextuel('coop');
        btnFermer.onclick?.();
        afficherTutorielContextuel('coop');
        expect(overlay.classList.contains('element-masque')).toBe(true);
    });
});
