import { describe, it, expect } from 'vitest';
import { ICONES_PIXEL, dessinerIconePixel } from '../js/icones-pixel.js';
import { ICONE_PAR_ENTREE, ACCENT_PAR_ENTREE } from '../js/codex-icones-map.js';
import { CODEX } from '../js/codex-donnees.js';

describe('icones-pixel', () => {
    it('contient toutes les icônes référencées par le codex', () => {
        for (const entree of Object.values(CODEX)) {
            const idIcone = ICONE_PAR_ENTREE[entree.id];
            expect(idIcone, entree.id).toBeTruthy();
            expect(ICONES_PIXEL[idIcone], `${entree.id} → ${idIcone}`).toBeTruthy();
            expect(ACCENT_PAR_ENTREE[entree.id], entree.id).toBeTruthy();
        }
    });

    it('chaque icône est une grille 16×16', () => {
        for (const [cle, icone] of Object.entries(ICONES_PIXEL)) {
            expect(icone.grille, cle).toHaveLength(16);
            for (const ligne of icone.grille) {
                expect(ligne, cle).toHaveLength(16);
            }
        }
    });

    it('dessinerIconePixel ne lève pas sur canvas mock', () => {
        const pixels = [];
        const ctx = {
            imageSmoothingEnabled: true,
            filter: 'auto',
            fillStyle: '',
            drawImage() {},
            fillRect(x, y, w, h) {
                pixels.push([x, y, w, h]);
            },
        };
        dessinerIconePixel(ctx, 'monde_lave', 0, 0, 4);
        expect(pixels.length).toBeGreaterThan(0);
        expect(ctx.imageSmoothingEnabled).toBe(false);
        expect(ctx.filter).toBe('none');
    });
});
