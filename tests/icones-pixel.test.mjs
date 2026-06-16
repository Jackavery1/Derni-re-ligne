import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync } from 'fs';
import { chargerIconesPixel, dessinerIconePixel } from '../js/icones-pixel.js';
import { ICONE_PAR_ENTREE, ACCENT_PAR_ENTREE } from '../js/codex-icones-map.js';
import { CONDITIONS_CODEX } from '../js/codex-conditions.js';
import ICONES_PIXEL from '../data/icones-pixel.json';

const CODEX = Object.fromEntries(
    Object.entries(JSON.parse(readFileSync('data/codex-textes.json', 'utf8'))).map(
        ([id, entree]) => [id, { ...entree, condition: CONDITIONS_CODEX[id] }]
    )
);

describe('icones-pixel', () => {
    beforeAll(async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(ICONES_PIXEL),
            })
        );
        await chargerIconesPixel();
    });
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

    it('chaque icône codex produit un empreinte canvas distincte', () => {
        /** @param {string} idIcone */
        function empreinteIcone(idIcone) {
            const rects = [];
            const ctx = {
                imageSmoothingEnabled: true,
                filter: 'auto',
                fillStyle: '',
                drawImage() {},
                fillRect(x, y, w, h) {
                    rects.push(`${x},${y},${w},${h},${ctx.fillStyle}`);
                },
            };
            dessinerIconePixel(ctx, idIcone, 0, 0, 4);
            return rects.join('|');
        }

        const empreintes = new Set(
            Object.values(CODEX)
                .slice(0, 8)
                .map((entree) => empreinteIcone(ICONE_PAR_ENTREE[entree.id]))
        );
        expect(empreintes.size).toBeGreaterThan(4);
    });
});
