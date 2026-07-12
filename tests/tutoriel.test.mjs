import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/ui/focus-trap.js', () => ({
    activerFocusTrap: vi.fn(() => () => {}),
}));

import { activerFocusTrap } from '../js/ui/focus-trap.js';
import {
    initialiserTutoriel,
    afficherTutorielContextuel,
    afficherTutorielPrologueApresCutscene,
    afficherTutorielLibreAvantPartie,
    NOMBRE_SLIDES_PROLOGUE,
    NOMBRE_SLIDES_LIBRE,
} from '../js/ui/tutoriel.js';

function creerElement(initialClasses = ['element-masque']) {
    const classes = new Set(initialClasses);
    const attributes = { 'aria-hidden': 'true' };
    return {
        attributes,
        setAttribute: (name, value) => {
            attributes[name] = value;
        },
        getAttribute: (name) => attributes[name],
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
        querySelectorAll: vi.fn(function () {
            return this.childNodes.filter((n) => n?.tagName === 'BUTTON');
        }),
        removeEventListener: vi.fn(),
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
        vi.mocked(activerFocusTrap).mockClear();
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
        expect(overlay.getAttribute('aria-hidden')).toBe('false');
        expect(corps.replaceChildren).toHaveBeenCalled();
        expect(blocControles.replaceChildren).toHaveBeenCalled();
        expect(blocControles.classList.contains('element-masque')).toBe(false);
    });

    it('le tutoriel prologue compte au plus 3 slides', () => {
        expect(NOMBRE_SLIDES_PROLOGUE).toBeLessThanOrEqual(3);
        expect(NOMBRE_SLIDES_PROLOGUE).toBe(3);
    });

    it('appelle onCompris directement si le tutoriel prologue a déjà été vu', () => {
        const cb = vi.fn();
        afficherTutorielPrologueApresCutscene();
        for (let i = 0; i < NOMBRE_SLIDES_PROLOGUE; i++) btnFermer.onclick?.();
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

    it('affiche le tutoriel libre la première fois', () => {
        afficherTutorielLibreAvantPartie();
        expect(overlay.classList.contains('element-masque')).toBe(false);
        expect(corps.replaceChildren).toHaveBeenCalled();
    });

    it('le tutoriel libre compte 3 slides', () => {
        expect(NOMBRE_SLIDES_LIBRE).toBe(3);
    });

    it('active le focus trap a l ouverture du tutoriel libre', () => {
        afficherTutorielLibreAvantPartie();
        expect(activerFocusTrap).toHaveBeenCalledTimes(1);
        expect(activerFocusTrap.mock.calls[0][0]).toBe(overlay);
    });

    it('appelle onCompris directement si le tutoriel libre a déjà été vu', () => {
        const cb = vi.fn();
        afficherTutorielLibreAvantPartie();
        for (let i = 0; i < NOMBRE_SLIDES_LIBRE; i++) btnFermer.onclick?.();
        afficherTutorielLibreAvantPartie(cb);
        expect(cb).toHaveBeenCalledTimes(1);
    });
});
