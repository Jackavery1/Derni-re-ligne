import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../js/achievements-donnees.js';
import { ICONES_PIXEL } from '../js/icones-pixel.js';
import {
    obtenirIdIconeAchievement,
    obtenirAccentCategorie,
    obtenirTexteVerrouille,
} from '../js/achievements-icones-map.js';

describe('achievements-icones-map', () => {
    it('chaque achievement a une icône pixel valide', () => {
        for (const ach of Object.values(ACHIEVEMENTS)) {
            const idIcone = obtenirIdIconeAchievement(ach.id, ach.categorie);
            expect(ICONES_PIXEL[idIcone], `${ach.id} → ${idIcone}`).toBeTruthy();
            expect(obtenirAccentCategorie(ach.categorie)).toMatch(/^#[0-9a-f]{6}$/i);
        }
    });

    it('masque les indices pour les catégories narratives sensibles', () => {
        expect(obtenirTexteVerrouille('histoire_secrets', 'Spoiler')).toBe('Fragment non gravé');
        expect(obtenirTexteVerrouille('histoire_fins', 'Spoiler')).toBe('Fragment non gravé');
        expect(obtenirTexteVerrouille('score', 'Atteindre 10 000 points')).toContain('10 000');
    });
});
