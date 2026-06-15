import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../js/achievements-donnees.js';
import ICONES_PIXEL from '../data/icones-pixel.json';
import {
    obtenirIdIconeAchievement,
    obtenirAccentCategorie,
    obtenirTexteVerrouille,
    obtenirTexteVerrouillePanneau,
    obtenirLibelleCategorieFiltre,
    estCategorieIndiceMasque,
    ICONE_PAR_ACHIEVEMENT,
} from '../js/achievements-icones-map.js';

describe('achievements-icones-map', () => {
    it('chaque achievement a une icône pixel valide', () => {
        for (const ach of Object.values(ACHIEVEMENTS)) {
            const idIcone = obtenirIdIconeAchievement(ach.id, ach.categorie);
            expect(ICONES_PIXEL[idIcone], `${ach.id} → ${idIcone}`).toBeTruthy();
            expect(obtenirAccentCategorie(ach.categorie)).toMatch(/^#[0-9a-f]{6}$/i);
        }
    });

    it('assigne une icone dediee a chaque exploit histoire', () => {
        const histoire = Object.values(ACHIEVEMENTS).filter((a) =>
            a.categorie.startsWith('histoire')
        );
        for (const ach of histoire) {
            expect(ICONE_PAR_ACHIEVEMENT[ach.id], ach.id).toBeTruthy();
        }
    });

    it('masque les indices pour les catégories narratives sensibles', () => {
        expect(obtenirTexteVerrouille('histoire_secrets', 'Spoiler')).toBe('Fragment non gravé');
        expect(obtenirTexteVerrouille('histoire_fins', 'Spoiler')).toBe('Fragment non gravé');
        expect(obtenirTexteVerrouille('score', 'Atteindre 10 000 points')).toContain('10 000');
    });

    it('expose le texte panneau et les libelles de filtre', () => {
        expect(estCategorieIndiceMasque('histoire_vera')).toBe(true);
        expect(estCategorieIndiceMasque('histoire_boss')).toBe(false);
        expect(obtenirTexteVerrouillePanneau('histoire', 'Spoiler')).toContain('La Trame');
        expect(obtenirLibelleCategorieFiltre('lignes')).toBe('SCORE');
        expect(obtenirLibelleCategorieFiltre('histoire_prouesses')).toBe('PROUESSES');
    });
});
