import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../js/config/config-jeu.js';
import { DELAI_GAME_OVER_MS } from '../js/logique/partie-fin.js';
import { COMPORTEMENTS_VIVANT } from '../js/logique/vivant-comportements.js';
import { delaiMinimumVivantEffectif } from '../js/logique/vivant.js';

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

    it('sprintInputBufferMax dans la plage 1-3 actions', () => {
        expect(CONFIG.sprintInputBufferMax).toBeGreaterThanOrEqual(1);
        expect(CONFIG.sprintInputBufferMax).toBeLessThanOrEqual(3);
        expect(CONFIG.sprintInputBufferMax).toBeGreaterThanOrEqual(CONFIG.inputBufferMax);
    });

    it('lockDelay offre une fenetre de placement confortable', () => {
        expect(CONFIG.lockDelay).toBeGreaterThanOrEqual(300);
    });

    it('areMs dans la plage 8-12 frames a 60fps', () => {
        const frames = CONFIG.areMs / msParFrame;
        expect(frames).toBeGreaterThanOrEqual(8);
        expect(frames).toBeLessThanOrEqual(12);
    });

    it('delai game over dans la plage 200-350ms (audit B G6)', () => {
        expect(DELAI_GAME_OVER_MS).toBeGreaterThanOrEqual(200);
        expect(DELAI_GAME_OVER_MS).toBeLessThanOrEqual(350);
    });

    it('prologue offre au moins 120 frames avant premier pic difficulte (audit B G3)', async () => {
        const { creerHandlersDifficulte } =
            await import('../js/moteur/neo-test-api-handlers-difficulte.js');
        const resultat = await creerHandlersDifficulte().evaluerEquiteDemarragePrologue();
        expect(resultat.framesAvantPremierPicDifficulte).toBeGreaterThanOrEqual(120);
        expect(resultat.equiteDemarrage).toBe(true);
    });

    it('tous les biomes vivant offrent au moins 120 frames avant premier obstacle (audit B G3)', () => {
        const seuilFrames = 120;
        for (const [biomeId, config] of Object.entries(COMPORTEMENTS_VIVANT)) {
            if (!config) continue;
            const delaiMs = delaiMinimumVivantEffectif(config, 1);
            const frames60 = Math.floor((delaiMs * 60) / 1000);
            expect(frames60, biomeId).toBeGreaterThanOrEqual(seuilFrames);
        }
    });

    it('monde_trame monte par paliers de 1 entre 10 et 14 (audit B G4)', () => {
        const { DIFFICULTE_MONDES } = JSON.parse(
            readFileSync(
                join(dirname(fileURLToPath(import.meta.url)), '../data/difficulte-mondes.json'),
                'utf8'
            )
        );
        const profil = [...(DIFFICULTE_MONDES.monde_trame.profilVitesse ?? [])].sort(
            (a, b) => a.a - b.a
        );
        const paliers1014 = profil.map((p) => p.palier).filter((p) => p >= 10 && p <= 14);
        expect(paliers1014).toEqual([10, 11, 12, 13, 14]);
        for (let i = 1; i < paliers1014.length; i++) {
            expect(paliers1014[i] - paliers1014[i - 1]).toBe(1);
        }
    });
});
