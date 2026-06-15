import { describe, it, expect, beforeEach } from 'vitest';
import {
    controlesTactilesActifs,
    definirControlesTactilesActifs,
    appliquerControlesTactilesDepuisStockage,
} from '../js/controles-tactiles.js';

describe('controles-tactiles', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.className = '';
        document.body.classList.add = (cls) => {
            if (!document.body.className.includes(cls)) {
                document.body.className = document.body.className
                    ? `${document.body.className} ${cls}`
                    : cls;
            }
        };
        document.body.classList.remove = (cls) => {
            document.body.className = document.body.className
                .split(/\s+/)
                .filter((c) => c && c !== cls)
                .join(' ');
        };
        document.body.classList.contains = (cls) =>
            document.body.className.split(/\s+/).includes(cls);
        document.body.classList.toggle = (cls, force) => {
            const present = document.body.classList.contains(cls);
            const actif = force ?? !present;
            if (actif && !present) document.body.classList.add(cls);
            if (!actif && present) document.body.classList.remove(cls);
        };
    });

    it('respecte la preference explicite ON', () => {
        definirControlesTactilesActifs(true);
        expect(controlesTactilesActifs()).toBe(true);
        expect(document.body.classList.contains('controles-tactiles-actifs')).toBe(true);
    });

    it('respecte la preference explicite OFF', () => {
        definirControlesTactilesActifs(false);
        expect(controlesTactilesActifs()).toBe(false);
        expect(document.body.classList.contains('controles-tactiles-actifs')).toBe(false);
    });

    it('applique la classe body depuis le stockage', () => {
        definirControlesTactilesActifs(true);
        document.body.classList.remove('controles-tactiles-actifs');
        appliquerControlesTactilesDepuisStockage();
        expect(document.body.classList.contains('controles-tactiles-actifs')).toBe(true);
    });
});
