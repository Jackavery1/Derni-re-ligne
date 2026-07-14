import { describe, it, expect } from 'vitest';
import { ETAT_D9_PARTIE1, ETAT_D9_PARTIE2 } from '../e2e/etats-histoire-campagne-d9.mjs';
import { chargerEtatHistoireCampagne } from '../e2e/helpers-campagne-narratif.mjs';

describe('campagne D9 — fixtures de reprise', () => {
    it('d9-partie1 expose un jalon apres 8 mondes', () => {
        expect(ETAT_D9_PARTIE1.bossVaincus).toEqual(['brasier', 'sentinelle']);
        expect(ETAT_D9_PARTIE1.mondesCompletes).toContain('monde_glace');
        expect(ETAT_D9_PARTIE1.interludesVusIds).toContain('interlude_gardiens');
    });

    it('d9-partie2 expose un jalon apres 16 mondes', () => {
        expect(ETAT_D9_PARTIE2.mondesCompletes).toContain('monde_vide');
        expect(ETAT_D9_PARTIE2.bossVaincus).toContain('avantgarde');
    });

    it('chargerEtatHistoireCampagne retombe sur fixtures si cache absent', () => {
        expect(chargerEtatHistoireCampagne('d9-partie1')).toEqual(ETAT_D9_PARTIE1);
        expect(chargerEtatHistoireCampagne('d9-partie2')).toEqual(ETAT_D9_PARTIE2);
        expect(chargerEtatHistoireCampagne('inexistant')).toBeNull();
    });
});
