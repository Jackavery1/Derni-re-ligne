import { describe, it, expect, beforeEach } from 'vitest';
import {
    calculerPointsProgression,
    biomeEstDebloque,
    calculerEtoiles,
    formaterEtoiles,
    chargerBiomeActif,
    chargerNiveauGlobal,
    sauvegarderNiveauGlobal,
    sauvegarderBiomeActif,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
    ecrireStockage,
    lireStockage,
} from '../js/progression.js';

describe('progression', () => {
    beforeEach(() => {
        localStorage.clear();
    });
    it('Score nul : aucun point de progression', () => {
        expect(calculerPointsProgression(0, 10)).toBe(0);
    });

    it('Petit score : au moins 1 point', () => {
        expect(calculerPointsProgression(500, 4)).toBeGreaterThanOrEqual(1);
    });

    it('Gros score : plusieurs points', () => {
        expect(calculerPointsProgression(10000, 40)).toBeGreaterThanOrEqual(5);
    });

    it('Biome débloqué au seuil exact', () => {
        expect(biomeEstDebloque(6, 6)).toBe(true);
    });

    it('Biome verrouillé sous le seuil', () => {
        expect(biomeEstDebloque(5, 6)).toBe(false);
    });

    it('Étoiles : record vide', () => {
        expect(calculerEtoiles(0)).toBe(0);
    });

    it('Étoiles : palier 2', () => {
        expect(calculerEtoiles(5000)).toBe(2);
    });

    it('Étoiles : palier 3', () => {
        expect(calculerEtoiles(15000)).toBe(3);
    });

    it('Format étoiles 3 pleines', () => {
        expect(formaterEtoiles(3)).toBe('★★★');
    });

    it('Format étoiles 1 pleine', () => {
        expect(formaterEtoiles(1)).toBe('★☆☆');
    });

    it('Biome actif par défaut', () => {
        expect(chargerBiomeActif()).toBe('classique');
    });

    it('Clé localStorage inconnue retourne défaut', () => {
        expect(lireStockage('cle_invalide', 'defaut')).toBe('defaut');
    });

    it('ecrireStockage refuse une clé invalide', () => {
        expect(ecrireStockage('cle_invalide', 'x')).toBe(false);
    });

    it('chargerNiveauGlobal lit la valeur stockée', () => {
        localStorage.setItem('tetrisNeo_niveauGlobal', '12');
        expect(chargerNiveauGlobal()).toBe(12);
    });

    it('sauvegarderNiveauGlobal persiste', () => {
        sauvegarderNiveauGlobal(7);
        expect(chargerNiveauGlobal()).toBe(7);
    });

    it('sauvegarderBiomeActif et rechargement', () => {
        sauvegarderBiomeActif('lave');
        expect(chargerBiomeActif()).toBe('lave');
    });

    it('sauvegarderRecordBiome met à jour le record', () => {
        expect(sauvegarderRecordBiome('classique', 5000)).toBe(true);
        expect(obtenirRecordBiome('classique')).toBe(5000);
    });

    it('sauvegarderRecordBiome ignore un score inférieur', () => {
        sauvegarderRecordBiome('classique', 1000);
        expect(sauvegarderRecordBiome('classique', 500)).toBe(false);
        expect(obtenirRecordBiome('classique')).toBe(1000);
    });
});
