import { describe, it, expect } from 'vitest';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire/histoire-donnees-exports.js';
import { obtenirProchainMondeCampagne } from '../js/histoire/histoire-mondes.js';

describe('obtenirProchainMondeCampagne', () => {
    it('retourne le monde suivant non complete dans la sequence', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = ['monde_prologue'];
        expect(obtenirProchainMondeCampagne('monde_prologue', etat)).toBe('monde_lave');
    });

    it('ignore les mondes deja completes plus loin dans la sequence', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = ['monde_prologue', 'monde_lave', 'monde_rouille'];
        expect(obtenirProchainMondeCampagne('monde_prologue', etat)).toBe('monde_boss_1');
    });

    it('retourne null si le monde suivant n est pas encore debloque', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = ['monde_prologue', 'monde_lave'];
        expect(obtenirProchainMondeCampagne('monde_rouille', etat)).toBeNull();
        etat.mondesCompletes.push('monde_rouille');
        expect(obtenirProchainMondeCampagne('monde_rouille', etat)).toBe('monde_boss_1');
    });

    it('retourne le prochain monde apres un boss', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = ['monde_prologue', 'monde_lave', 'monde_rouille', 'monde_boss_1'];
        expect(obtenirProchainMondeCampagne('monde_boss_1', etat)).toBe('monde_ocean');
    });

    it('retourne eclipse apres le desert', () => {
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.mondesCompletes = [
            'monde_prologue',
            'monde_lave',
            'monde_rouille',
            'monde_ocean',
            'monde_foret',
            'monde_glace',
            'monde_boss_2',
            'monde_desert',
        ];
        etat.bossVaincus = ['brasier', 'sentinelle'];
        expect(obtenirProchainMondeCampagne('monde_desert', etat)).toBe('monde_eclipse');
    });
});
