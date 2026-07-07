import { describe, it, expect } from 'vitest';
import {
    resoudreConfigFondBiome,
    obtenirConfigFondBiome,
} from '../js/rendu/rendu-fond-biome-donnees.js';
import {
    creerParticulesFondBiome,
    dessinerParticulesFondBiome,
} from '../js/rendu/rendu-fond-biome-particules.js';

describe('rendu-fond-biome-donnees', () => {
    it('resout les alias biome courts', () => {
        expect(resoudreConfigFondBiome('lave')).toBe('monde_lave');
        expect(resoudreConfigFondBiome('monde_ocean')).toBe('monde_ocean');
        expect(resoudreConfigFondBiome('inconnu')).toBeNull();
    });

    it('expose la config particules pour chaque biome resolu', () => {
        const cle = resoudreConfigFondBiome('cyber');
        const config = obtenirConfigFondBiome(cle);
        expect(config?.particules.type).toBe('pluie_data');
        expect(config?.particules.n).toBeGreaterThan(0);
    });
});

describe('rendu-fond-biome-particules', () => {
    it('cree le nombre de particules demande par la config', () => {
        const config = obtenirConfigFondBiome('monde_prologue');
        const particules = creerParticulesFondBiome(config, 320, 640);
        expect(particules).toHaveLength(config.particules.n);
    });

    it('dessine sans erreur sur canvas mock', () => {
        const config = obtenirConfigFondBiome('monde_lave');
        const particules = creerParticulesFondBiome(config, 200, 400);
        const ctx = {
            save: () => {},
            restore: () => {},
            fillRect: () => {},
            stroke: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            arc: () => {},
            fillText: () => {},
            globalAlpha: 1,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
        };
        expect(() =>
            dessinerParticulesFondBiome(ctx, config, particules, 1000, 200, 400, {
                reduits: false,
                facteurAmp: 1,
            })
        ).not.toThrow();
    });
});
