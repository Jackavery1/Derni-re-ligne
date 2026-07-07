import { describe, it, expect } from 'vitest';
import { calculerPositionsNoeuds } from '../js/histoire/histoire-map-layout.js';
import { mettreAJourVisibiliteCarte } from '../js/histoire/histoire-map-visibilite.js';

describe('histoire-map-layout', () => {
    it('place les mondes principaux et les mondes caches debloques', () => {
        const etatCarte = {
            canvasCarte: { width: 800, height: 600 },
            positionsNoeuds: {},
        };
        calculerPositionsNoeuds(etatCarte);
        expect(etatCarte.positionsNoeuds.monde_prologue).toMatchObject({
            x: 400,
            rayon: 20,
        });
        expect(etatCarte.positionsNoeuds.monde_finale).toBeDefined();
    });
});

describe('histoire-map-visibilite', () => {
    it('expose le prologue quand aucun monde complete', () => {
        const etatCarte = {
            mondesVisibles: new Set(),
            mondesFantomes: new Set(),
            mondeActuel: null,
            positionsNoeuds: { monde_prologue: { x: 0, y: 0, rayon: 20 } },
        };
        mettreAJourVisibiliteCarte(etatCarte);
        expect(etatCarte.mondesVisibles.has('monde_prologue')).toBe(true);
        expect(etatCarte.mondeActuel).toBe('monde_prologue');
    });
});
