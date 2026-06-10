import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    introHistoireDejaVue,
    marquerIntroHistoireVue,
    obtenirSequenceIntro,
} from '../js/histoire-intro.js';
import { chargerHistoireTextes } from '../js/charger-histoire-textes.js';
import { INTRO_HISTOIRE } from '../js/histoire-textes.js';

describe('histoire-intro', () => {
    beforeEach(async () => {
        localStorage.removeItem('derniereLigne_introHistoireVue');
        await chargerHistoireTextes();
    });

    it('expose une séquence d’environ 15 lignes avec narrateur, systeme et vera', () => {
        const seq = obtenirSequenceIntro();
        expect(seq).toEqual(INTRO_HISTOIRE);
        expect(seq.scene).toBe('observatoire');
        const lignes = seq.lignes ?? seq;
        expect(lignes).toHaveLength(15);
        expect(lignes[0].texte).toMatch(/inventé un jeu/);
        expect(lignes[0].personnage).toBe('narrateur');
        expect(lignes.some((l) => l.personnage === 'systeme')).toBe(true);
        expect(lignes.some((l) => l.personnage === 'vera')).toBe(true);
        expect(lignes.some((l) => l.texte.includes('Jour 2 554'))).toBe(true);
    });

    it('persiste la vue intro via localStorage', () => {
        expect(introHistoireDejaVue()).toBe(false);
        marquerIntroHistoireVue();
        expect(introHistoireDejaVue()).toBe(true);
        expect(localStorage.getItem('derniereLigne_introHistoireVue')).toBe('1');
    });

    it('obtenirHistoireTextesSync exige un chargement prealable', async () => {
        vi.resetModules();
        const mod = await import('../js/charger-histoire-textes.js');
        expect(() => mod.obtenirHistoireTextesSync()).toThrow(/chargerHistoireTextes/);
        await mod.chargerHistoireTextes();
        const textes = mod.obtenirHistoireTextesSync();
        expect(textes.INTRO_HISTOIRE?.lignes?.length ?? textes.INTRO_HISTOIRE?.length).toBe(15);
        expect(textes.INTERLUDES?.interlude_gardiens?.length).toBeGreaterThan(3);
        expect(textes.OUTRO_FINS?.fin_normale?.length).toBeGreaterThan(0);
    });
});
