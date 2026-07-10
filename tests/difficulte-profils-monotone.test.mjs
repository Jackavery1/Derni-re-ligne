import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { DIFFICULTE_MONDES } = JSON.parse(
    readFileSync(
        join(dirname(fileURLToPath(import.meta.url)), '../data/difficulte-mondes.json'),
        'utf8'
    )
);

/** Mondes dont la courbe en « vagues » est un choix de design documenté (respiration mid-run). */
const MONDES_VAGUES_INTENTIONNELLES = new Set([
    'monde_glace',
    'monde_eclipse',
    'monde_cyber',
    'monde_fuochi',
    'monde_cosmos',
    'monde_vide',
    'monde_miroir',
    'monde_trame',
    'monde_paradoxe',
]);

describe('difficulte profils — montee monotone', () => {
    for (const [mondeId, cfg] of Object.entries(DIFFICULTE_MONDES)) {
        if (cfg.boss) continue;

        it(`${mondeId} — paliers non decroissants par seuil de progression`, () => {
            const profil = [...(cfg.profilVitesse ?? [])].sort((a, b) => a.a - b.a);
            for (let i = 1; i < profil.length; i++) {
                const precedent = profil[i - 1].palier;
                const courant = profil[i].palier;
                if (MONDES_VAGUES_INTENTIONNELLES.has(mondeId) && courant < precedent) {
                    continue;
                }
                expect(
                    courant,
                    `${mondeId} @ ${profil[i].a}: palier ${courant} < ${precedent}`
                ).toBeGreaterThanOrEqual(precedent);
            }
        });
    }

    describe('boss — phasePaliers', () => {
        it('monde_boss_3 — phases de combat croissantes', () => {
            const paliers = DIFFICULTE_MONDES.monde_boss_3.phasePaliers;
            expect(paliers[2]).toBeGreaterThan(paliers[1]);
        });
    });
});
