import { describe, it, expect } from 'vitest';
import { intervalleProchainMeteoMs, nombreCellulesBarrageMeteo } from '../js/meteo.js';

describe('météo — courbe marathon casual', () => {
    it('intervalle plus long aux niveaux bas', () => {
        const bas = intervalleProchainMeteoMs(3);
        expect(bas).toBeGreaterThanOrEqual(120_000);
        expect(bas).toBeLessThanOrEqual(180_000);
    });

    it('intervalle standard à partir du niveau 6', () => {
        const haut = intervalleProchainMeteoMs(6);
        expect(haut).toBeGreaterThanOrEqual(90_000);
        expect(haut).toBeLessThanOrEqual(150_000);
    });

    it('barrage moins agressif aux niveaux bas', () => {
        expect(nombreCellulesBarrageMeteo(5)).toBe(3);
        expect(nombreCellulesBarrageMeteo(9)).toBe(6);
    });

    it('intervalle plus long en late game (niveau 10+)', () => {
        const standard = intervalleProchainMeteoMs(6);
        const late = intervalleProchainMeteoMs(10);
        expect(late).toBeGreaterThanOrEqual(120_000);
        expect(standard).toBeLessThanOrEqual(150_000);
    });
});
