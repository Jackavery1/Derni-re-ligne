import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    initialiserTutoriel,
    afficherTutorielContextuel,
    afficherTutorielPrologueApresCutscene,
} from '../js/tutoriel.js';

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
    /** @type {ReturnType<typeof creerElement>} */
    let blocControles;

    beforeEach(() => {
        localStorage.clear();
        overlay = creerElement(['element-masque']);
        btnFermer = creerElement([]);
        corps = creerElement([]);
        blocControles = creerElement(['element-masque']);

        vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'overlay-tutoriel') return overlay;
            if (id === 'btn-tutoriel-fermer') return btnFermer;
            if (id === 'tutoriel-titre') return creerElement([]);
            if (id === 'tutoriel-corps') return corps;
            if (id === 'tutoriel-controles') return blocControles;
            if (id === 'tutoriel-indicateur') return creerElement([]);
            return null;
        });

        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = creerElement([]);
            el.tagName = tag;
            return el;
        });
    });

    it('initialiserTutoriel n affiche plus l overlay à l accueil', () => {
        initialiserTutoriel();
        expect(overlay.classList.contains('element-masque')).toBe(true);
    });

    it('affiche le tutoriel prologue avec contrôles la première fois', () => {
        afficherTutorielPrologueApresCutscene();
        expect(overlay.classList.contains('element-masque')).toBe(false);
        expect(corps.replaceChildren).toHaveBeenCalled();
        expect(blocControles.replaceChildren).toHaveBeenCalled();
        expect(blocControles.classList.contains('element-masque')).toBe(false);
    });

    it('appelle onCompris directement si le tutoriel prologue a déjà été vu', () => {
        const cb = vi.fn();
        afficherTutorielPrologueApresCutscene();
        for (let i = 0; i < 4; i++) btnFermer.onclick?.();
        afficherTutorielPrologueApresCutscene(cb);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(overlay.classList.contains('element-masque')).toBe(true);
    });

    it('affiche le tutoriel coop la première fois', () => {
        afficherTutorielContextuel('coop');
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
