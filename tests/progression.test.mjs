import { describe, it, expect, beforeEach } from 'vitest';
import {
    calculerPointsProgression,
    biomeEstDebloque,
    calculerEtoiles,
    obtenirRecordNiveauBiome,
    formaterEtoiles,
    chargerBiomeActif,
    chargerNiveauGlobal,
    sauvegarderNiveauGlobal,
    sauvegarderBiomeActif,
    obtenirRecordBiome,
    sauvegarderRecordBiome,
    ecrireStockage,
    lireStockage,
    lireStockageJson,
    ecrireStockageJson,
    estTableauIds,
    parserIdsStockage,
    supprimerStockageProgression,
    estClePreference,
} from '../js/io/progression.js';

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

    it('Étoiles : paliers montent avec le niveau atteint', () => {
        expect(calculerEtoiles(15000, 10)).toBe(1);
        expect(calculerEtoiles(150000, 10)).toBe(3);
    });

    it('Record niveau : valeur par défaut', () => {
        expect(obtenirRecordNiveauBiome('classique')).toBe(1);
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

    it('estTableauIds valide un tableau de chaînes', () => {
        expect(estTableauIds(['a', 'b'])).toBe(true);
        expect(estTableauIds(['a', 1])).toBe(false);
        expect(estTableauIds({})).toBe(false);
    });

    it('parserIdsStockage refuse un JSON invalide', () => {
        expect(parserIdsStockage('')).toEqual(new Set());
        expect(parserIdsStockage('[1,2]')).toEqual(new Set());
        expect(parserIdsStockage('["a","b"]')).toEqual(new Set(['a', 'b']));
    });

    it('lireStockageJson et ecrireStockageJson pour le codex', () => {
        expect(ecrireStockageJson('tetrisNeo_codex', ['monde_1'])).toBe(true);
        expect(lireStockageJson('tetrisNeo_codex', [])).toEqual(['monde_1']);
    });

    it('ecrireStockageJson refuse une clé invalide', () => {
        expect(ecrireStockageJson('cle_invalide', {})).toBe(false);
    });

    it('refuse une clé arbitraire même avec le préfixe derniereLigne_', () => {
        expect(ecrireStockage('derniereLigne_injection_arbitraire', 'x')).toBe(false);
        expect(lireStockage('derniereLigne_injection_arbitraire', 'defaut')).toBe('defaut');
    });

    it('accepte les clés tutoriel et intro explicitement listées', () => {
        expect(ecrireStockage('derniereLigne_introHistoireVue', '1')).toBe(true);
        expect(lireStockage('derniereLigne_introHistoireVue', '0')).toBe('1');
        expect(ecrireStockage('derniereLigne_tutorielHistoireVu', '1')).toBe(true);
    });

    it('supprimerStockageProgression conserve les préférences', () => {
        ecrireStockage('derniereLigne_volume', '0.4');
        ecrireStockage('derniereLigne_record_classique', '12000');
        ecrireStockageJson('derniereLigne_histoire', { mondesCompletes: ['monde_lave'] });
        expect(estClePreference('derniereLigne_volume')).toBe(true);
        supprimerStockageProgression();
        expect(lireStockage('derniereLigne_volume', '')).toBe('0.4');
        expect(localStorage.getItem('derniereLigne_record_classique')).toBeNull();
        expect(lireStockageJson('derniereLigne_histoire', null)).toBeNull();
    });
});
