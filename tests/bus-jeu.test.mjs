import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ecouter, emettre, reinitialiserBusJeu } from '../js/etat/bus-jeu.js';

describe('bus-jeu', () => {
    beforeEach(() => {
        reinitialiserBusJeu();
    });

    it('propage un evenement aux ecouteurs', () => {
        const spy = vi.fn();
        ecouter('test:event', spy);
        emettre('test:event', { ok: true });
        expect(spy).toHaveBeenCalledWith({ ok: true });
    });

    it('desabonne via le retour de ecouter', () => {
        const spy = vi.fn();
        const desabonner = ecouter('test:event', spy);
        desabonner();
        emettre('test:event');
        expect(spy).not.toHaveBeenCalled();
    });

    it('desabonne sans erreur si la map a ete reinitialisee', () => {
        const desabonner = ecouter('test:event', vi.fn());
        reinitialiserBusJeu();
        expect(() => desabonner()).not.toThrow();
    });

    it('ignore les evenements sans ecouteurs', () => {
        expect(() => emettre('inexistant')).not.toThrow();
    });
});
