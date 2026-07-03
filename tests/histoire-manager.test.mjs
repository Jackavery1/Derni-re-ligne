import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../js/store-jeu.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { obtenirEtatHistoirePersiste, persisterEtatHistoire } from '../js/histoire-etat.js';
import {
    obtenirEtatHistoire,
    obtenirEtatMonde,
    mondePeutEtreJoue,
    rafraichirEtatHistoire,
} from '../js/histoire-manager.js';

describe('histoire-etat', () => {
    beforeEach(() => {
        store.histoire.etat = null;
    });

    it('charge et met en cache l état histoire', () => {
        const etat = obtenirEtatHistoirePersiste();
        expect(etat.chapitreActuel).toBe(ETAT_HISTOIRE_VIDE.chapitreActuel);
        expect(store.histoire.etat).toBe(etat);
    });

    it('persiste l état histoire dans le store', () => {
        const etat = obtenirEtatHistoirePersiste();
        etat.mondesCompletes = ['monde_prologue'];
        persisterEtatHistoire(etat);
        expect(store.histoire.etat.mondesCompletes).toContain('monde_prologue');
    });
});

describe('histoire-manager', () => {
    beforeEach(() => {
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
    });

    it('obtenirEtatMonde retourne disponible pour le prologue', () => {
        expect(obtenirEtatMonde('monde_prologue')).toBe('disponible');
    });

    it('mondePeutEtreJoue exige le monde précédent complété', () => {
        expect(mondePeutEtreJoue('monde_lave')).toBe(false);
        store.histoire.etat.mondesCompletes = ['monde_prologue'];
        expect(mondePeutEtreJoue('monde_lave')).toBe(true);
    });

    it('mondePeutEtreJoue refuse un id inconnu', () => {
        expect(mondePeutEtreJoue('monde_inexistant')).toBe(false);
    });

    it('rafraichirEtatHistoire recharge depuis le stockage', () => {
        const etat = obtenirEtatHistoire();
        etat.mondesCompletes = ['monde_prologue'];
        persisterEtatHistoire(etat);
        store.histoire.etat = null;
        const recharge = rafraichirEtatHistoire();
        expect(recharge.mondesCompletes).toContain('monde_prologue');
    });
});
