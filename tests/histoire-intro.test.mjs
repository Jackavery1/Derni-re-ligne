import { describe, it, expect, beforeEach } from 'vitest';
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
        expect(seq).toHaveLength(15);
        expect(seq[0].texte).toMatch(/inventé un jeu/);
        expect(seq[0].personnage).toBe('narrateur');
        expect(seq.some((l) => l.personnage === 'systeme')).toBe(true);
        expect(seq.some((l) => l.personnage === 'vera')).toBe(true);
        expect(seq.some((l) => l.texte.includes('Jour 2 554'))).toBe(true);
    });

    it('persiste la vue intro via localStorage', () => {
        expect(introHistoireDejaVue()).toBe(false);
        marquerIntroHistoireVue();
        expect(introHistoireDejaVue()).toBe(true);
        expect(localStorage.getItem('derniereLigne_introHistoireVue')).toBe('1');
    });
});
