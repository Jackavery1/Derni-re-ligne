import { describe, it, expect } from 'vitest';
import { CONFIG } from '../js/config/config-jeu.js';

const FPS_REF = 60;
const msParFrame = 1000 / FPS_REF;

describe('gameplay config — seuils audit B', () => {
    it('spawnGraceMs couvre au moins 24 frames a 60fps', () => {
        const frames = CONFIG.spawnGraceMs / msParFrame;
        expect(frames).toBeGreaterThanOrEqual(24);
    });

    it('sprintSpawnGraceMs couvre au moins 24 frames a 60fps', () => {
        const frames = CONFIG.sprintSpawnGraceMs / msParFrame;
        expect(frames).toBeGreaterThanOrEqual(24);
    });

    it('coyoteTimeMs dans la plage 4-8 frames a 60fps', () => {
        const frames = CONFIG.coyoteTimeMs / msParFrame;
        expect(frames).toBeGreaterThanOrEqual(4);
        expect(frames).toBeLessThanOrEqual(8);
    });

    it('inputBufferMax dans la plage 1-3 actions', () => {
        expect(CONFIG.inputBufferMax).toBeGreaterThanOrEqual(1);
        expect(CONFIG.inputBufferMax).toBeLessThanOrEqual(3);
    });

    it('lockDelay offre une fenetre de placement confortable', () => {
        expect(CONFIG.lockDelay).toBeGreaterThanOrEqual(300);
    });
});
