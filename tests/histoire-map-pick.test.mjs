import { describe, it, expect } from 'vitest';
import { noeudSousCurseur } from '../js/histoire/histoire-map-pick.js';

describe('histoire-map-pick', () => {
    it('applique un plancher de hitbox 24 meme pour un petit rayon (paradoxe)', () => {
        const etatCarte = {
            canvasCarte: null,
            camera: {
                y: 0,
                zoom: 1,
                cibleY: 0,
                cibleZoom: 1,
                vitesseLerp: 1,
                scrollMin: 0,
                scrollMax: 0,
                initialise: true,
            },
            positionsNoeuds: {
                monde_paradoxe: { x: 100, y: 100, rayon: 14 },
            },
            mondesVisibles: new Set(['monde_paradoxe']),
        };
        const dansHit = noeudSousCurseur(etatCarte, 100 + 23, 100);
        expect(dansHit?.id).toBe('monde_paradoxe');
        const horsHit = noeudSousCurseur(etatCarte, 100 + 25, 100);
        expect(horsHit).toBeNull();
    });
});
