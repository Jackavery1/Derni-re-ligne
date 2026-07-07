import { describe, it, expect, beforeEach } from 'vitest';
import {
    donneesPartie,
    reinitialiserDonneesPartie,
    calculerProfilStyle,
    genererTitreStyle,
    obtenirAxeDominant,
    obtenirNoteVera,
    calculerHauteurPlateau,
    enregistrerReaction,
} from '../js/profil-jeu.js';
import { etat } from '../js/etat/store-jeu.js';

describe('profil-jeu', () => {
    beforeEach(() => {
        reinitialiserDonneesPartie();
        etat.plateau = Array.from({ length: 20 }, () => Array(10).fill(0));
    });

    it('calculerProfilStyle retourne null si moins de 3 verrouillages', () => {
        donneesPartie.timestampsVerrou = [1, 2];
        expect(calculerProfilStyle(donneesPartie, 0)).toBeNull();
    });

    it('calculerProfilStyle retourne 6 axes entre 0 et 100', () => {
        donneesPartie.timestampsVerrou = [0, 1000, 2000, 3000];
        donneesPartie.atterrissagesColonne = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
        donneesPartie.nbHardDrops = 1;
        donneesPartie.nbRotations = 2;
        const profil = calculerProfilStyle(donneesPartie, 4);
        expect(profil).not.toBeNull();
        for (const val of Object.values(profil)) {
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThanOrEqual(100);
        }
    });

    it('genererTitreStyle retourne un titre sans profil', () => {
        expect(genererTitreStyle(null)).toBe('JOUEUR MYSTÉRIEUX');
    });

    it('genererTitreStyle produit un titre avec profil', () => {
        const profil = {
            vitesse: 90,
            precision: 20,
            agressivite: 10,
            endurance: 30,
            creativite: 15,
            equilibre: 25,
        };
        const titre = genererTitreStyle(profil);
        expect(titre.length).toBeGreaterThan(3);
    });

    it('calculerHauteurPlateau mesure le tas', () => {
        etat.plateau[19][5] = '#00f5ff';
        expect(calculerHauteurPlateau()).toBe(1);
        etat.plateau[17][3] = '#ffe600';
        expect(calculerHauteurPlateau()).toBe(3);
    });

    it('obtenirNoteVera suit l axe dominant du profil', () => {
        const profil = {
            vitesse: 10,
            precision: 20,
            agressivite: 85,
            endurance: 30,
            creativite: 15,
            equilibre: 25,
        };
        expect(obtenirAxeDominant(profil)).toBe('agressivite');
        expect(obtenirNoteVera(profil)).toContain('fonce');
    });

    it('enregistrerReaction ne compte qu une fois par pièce', () => {
        donneesPartie.dernierTempsApparition = Date.now() - 500;
        enregistrerReaction();
        expect(donneesPartie.tempsReactions).toHaveLength(1);
        enregistrerReaction();
        expect(donneesPartie.tempsReactions).toHaveLength(1);
    });
});
