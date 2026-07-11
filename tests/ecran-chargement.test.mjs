import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/** @type {Map<string, object>} */
const noeuds = new Map();

function creerNoeud(tag, { id = '', className = '' } = {}) {
    const classes = new Set(className.split(/\s+/).filter(Boolean));
    const attrs = new Map();
    const noeud = {
        tagName: tag.toUpperCase(),
        id,
        className,
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
        },
        style: {},
        textContent: '',
        setAttribute(name, value) {
            attrs.set(name, String(value));
        },
        getAttribute(name) {
            return attrs.has(name) ? attrs.get(name) : null;
        },
    };
    if (id) noeuds.set(id, noeud);
    return noeud;
}

function installerDomChargement() {
    noeuds.clear();
    const ecran = creerNoeud('div', { id: 'ecran-chargement', className: 'ecran-chargement' });
    const message = creerNoeud('p', { id: 'ecran-chargement-message' });
    const progress = creerNoeud('div', {
        id: 'ecran-chargement-progress',
        className: 'ecran-chargement-barre',
    });
    const barre = creerNoeud('div', {
        id: 'ecran-chargement-barre',
        className: 'ecran-chargement-barre-fill',
    });
    ecran.appendChild = () => {};
    globalThis.document = {
        getElementById: (id) => noeuds.get(id) ?? null,
    };
    void ecran;
    void message;
    void progress;
    void barre;
}

import {
    afficherEcranChargement,
    definirMessageChargement,
    definirProgressionChargement,
    masquerEcranChargement,
} from '../js/ui/ecran-chargement.js';

describe('ecran-chargement', () => {
    beforeEach(() => {
        installerDomChargement();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('affiche et met a jour la progression', () => {
        afficherEcranChargement('Demarrage…');
        const ecran = noeuds.get('ecran-chargement');
        expect(ecran?.classList.contains('actif')).toBe(true);
        expect(ecran?.getAttribute('aria-busy')).toBe('true');
        expect(noeuds.get('ecran-chargement-message')?.textContent).toBe('Demarrage…');

        definirProgressionChargement(0.5);
        expect(noeuds.get('ecran-chargement-barre')?.style.width).toBe('50%');
        expect(noeuds.get('ecran-chargement-progress')?.getAttribute('aria-valuenow')).toBe('50');

        definirMessageChargement('Presque pret…');
        expect(noeuds.get('ecran-chargement-message')?.textContent).toBe('Presque pret…');
    });

    it('masque l ecran apres la transition', () => {
        afficherEcranChargement();
        masquerEcranChargement();
        const ecran = noeuds.get('ecran-chargement');
        expect(ecran?.classList.contains('sortie')).toBe(true);
        vi.advanceTimersByTime(500);
        expect(ecran?.classList.contains('actif')).toBe(false);
        expect(ecran?.getAttribute('aria-busy')).toBe('false');
    });
});
