import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../js/store-core.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { persisterEtatHistoire } from '../js/histoire-etat.js';
import { SEUILS_COMPLETION, surFinDeMondeHistoire } from '../js/histoire-manager-completion.js';

vi.mock('../js/histoire-manager-ui.js', () => ({
    afficherBoutonCarteGameOver: vi.fn(),
}));

vi.mock('../js/histoire-narratif.js', () => ({
    afficherVictoireBoss: vi.fn((_id, _cle, cb) => cb?.()),
    afficherTransitionChapitre: vi.fn((_cle, cb) => cb?.()),
    afficherJournalVera: vi.fn((_journal, cb) => cb?.()),
    declencherFin: vi.fn(),
    obtenirTransitionApresVictoire: vi.fn(() => null),
    obtenirTypeFin: vi.fn(() => 'normal'),
    typeFinVersCleBoss: vi.fn(() => 'normal'),
    afficherDecouverteLabo: vi.fn((_cb) => {}),
}));

describe('histoire-manager-completion', () => {
    beforeEach(async () => {
        localStorage.clear();
        store.histoire.actif = true;
        store.histoire.mondeActuel = 'monde_prologue';
        store.histoire.boss.vaincu = false;
        store.histoire.dernierJournal = null;
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
        persisterEtatHistoire(store.histoire.etat);
        const ui = await import('../js/histoire-manager-ui.js');
        vi.mocked(ui.afficherBoutonCarteGameOver).mockClear();
    });

    it('expose les seuils de completion par biome', () => {
        expect(SEUILS_COMPLETION.classique).toBe(6);
        expect(SEUILS_COMPLETION.lave).toBe(10);
        expect(SEUILS_COMPLETION.miroir).toBe(12);
    });

    it('marque le monde complété quand le seuil de lignes est atteint', () => {
        surFinDeMondeHistoire(6, 1200);
        expect(store.histoire.etat.mondesCompletes).toContain('monde_prologue');
    });

    it('incrémente les continues si le monde n est pas complété', async () => {
        surFinDeMondeHistoire(3, 400);
        expect(store.histoire.etat.mondesCompletes).not.toContain('monde_prologue');
        expect(store.histoire.etat.nbContinuesUtilises).toBe(1);
        const ui = await import('../js/histoire-manager-ui.js');
        expect(ui.afficherBoutonCarteGameOver).toHaveBeenCalledWith(true);
    });

    it('ignore les fins hors mode histoire', () => {
        store.histoire.actif = false;
        surFinDeMondeHistoire(20, 5000);
        expect(store.histoire.etat.mondesCompletes).toEqual([]);
    });
});
