import { describe, it, expect } from 'vitest';
import {
    obtenirDefiDuJour,
    lireScoreDefiJour,
    enregistrerScoreDefiJour,
} from '../js/logique/defi-jour.js';
import { obtenirGuideMondeSecret } from '../js/histoire/conditions-secrets.js';

describe('defi-jour', () => {
    it('produit un defi stable pour une date donnee', () => {
        const a = obtenirDefiDuJour(new Date('2026-06-11T12:00:00Z'));
        const b = obtenirDefiDuJour(new Date('2026-06-11T18:00:00Z'));
        expect(a).toEqual(b);
        expect(a.objectifLignes).toBeGreaterThanOrEqual(15);
    });

    it('enregistre le meilleur score du jour', () => {
        const { date } = obtenirDefiDuJour(new Date('2026-01-01T00:00:00Z'));
        enregistrerScoreDefiJour(date, 1000);
        enregistrerScoreDefiJour(date, 500);
        expect(lireScoreDefiJour(date)).toBe(1000);
    });
});

describe('guide mondes secrets', () => {
    it('documente miroir trame et paradoxe', () => {
        expect(obtenirGuideMondeSecret('monde_miroir')).toMatch(/Archiviste/i);
        expect(obtenirGuideMondeSecret('monde_trame')).toMatch(/transmissions/i);
        expect(obtenirGuideMondeSecret('monde_paradoxe')).toMatch(/fin secrete/i);
    });
});
