import { describe, it, expect } from 'vitest';
import { CONFIG } from '../js/config/config.js';

describe('config-jeu sprint', () => {
    it('courbe sprint plus douce que marathon au demarrage', () => {
        expect(CONFIG.sprintVitesseBase).toBeGreaterThan(CONFIG.vitesseBase);
        expect(CONFIG.sprintReductionParNiveau).toBeLessThan(CONFIG.reductionParNiveau);
        expect(CONFIG.sprintSpawnGraceMs).toBeGreaterThan(CONFIG.spawnGraceMs);
    });
});
