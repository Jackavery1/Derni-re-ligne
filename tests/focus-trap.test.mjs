import { describe, it, expect, vi } from 'vitest';
import { activerFocusTrap, collecterFocusables } from '../js/ui/focus-trap.js';

/** @param {string} id */
function creerFocusable(id) {
    return {
        id,
        offsetParent: {},
        focus: vi.fn(),
    };
}

describe('focus-trap', () => {
    it('collecterFocusables ignore les elements masques', () => {
        const conteneur = {
            querySelectorAll: () => [
                creerFocusable('visible'),
                { ...creerFocusable('masque'), offsetParent: null },
            ],
        };
        expect(collecterFocusables(conteneur).map((el) => el.id)).toEqual(['visible']);
    });

    it('active le focus initial et enregistre un handler Tab', () => {
        const bouton = creerFocusable('fermer');
        const conteneur = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        const retirer = activerFocusTrap(conteneur, { elements: [bouton], focusInitial: bouton });
        expect(bouton.focus).toHaveBeenCalled();
        expect(conteneur.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        retirer();
        expect(conteneur.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('retourne une noop si aucun focusable', () => {
        const conteneur = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        expect(activerFocusTrap(conteneur, { elements: [] })).toEqual(expect.any(Function));
        expect(conteneur.addEventListener).not.toHaveBeenCalled();
    });
});
