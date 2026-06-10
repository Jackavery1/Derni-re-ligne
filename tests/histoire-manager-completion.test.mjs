import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../js/store-core.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';
import { persisterEtatHistoire } from '../js/histoire-etat.js';
import {
    SEUILS_COMPLETION,
    surFinDeMondeHistoire,
    devCompleterMondeHistoire,
} from '../js/histoire-manager-completion.js';

vi.mock('../js/histoire-manager-ui.js', () => ({
    afficherBoutonCarteGameOver: vi.fn(),
}));

vi.mock('../js/ui-panneau-objectifs.js', () => ({
    afficherRecapAvantNarratif: vi.fn((_monde, _etoiles, cb) => cb?.()),
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
    obtenirCutscenePostMonde: vi.fn(() => null),
}));

describe('histoire-manager-completion', () => {
    beforeEach(async () => {
        localStorage.clear();
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
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
        expect(SEUILS_COMPLETION.classique).toBe(8);
        expect(SEUILS_COMPLETION.lave).toBe(10);
        expect(SEUILS_COMPLETION.miroir).toBe(12);
    });

    it('marque le monde complété quand le seuil de lignes est atteint', () => {
        surFinDeMondeHistoire(8, 1200);
        expect(store.histoire.etat.mondesCompletes).toContain('monde_prologue');
    });

    it('n incrémente pas les continues sur échec d un monde normal', async () => {
        surFinDeMondeHistoire(3, 400);
        expect(store.histoire.etat.mondesCompletes).not.toContain('monde_prologue');
        expect(store.histoire.etat.nbContinuesUtilises).toBe(0);
        expect(store.histoire.etat.continuesParBoss?.monde_prologue ?? 0).toBe(0);
        const ui = await import('../js/histoire-manager-ui.js');
        expect(ui.afficherBoutonCarteGameOver).toHaveBeenCalledWith(true);
    });

    it('incrémente les continues sur échec d un boss', () => {
        store.histoire.mondeActuel = 'monde_boss_1';
        store.histoire.boss.vaincu = false;
        surFinDeMondeHistoire(5, 400);
        expect(store.histoire.etat.mondesCompletes).not.toContain('monde_boss_1');
        expect(store.histoire.etat.nbContinuesUtilises).toBe(1);
        expect(store.histoire.etat.continuesParBoss.monde_boss_1).toBe(1);
        expect(store.histoire.etat.conditionsTrame.tousBossSansContinue).toBe(false);
    });

    it('ignore les fins hors mode histoire', () => {
        store.histoire.actif = false;
        surFinDeMondeHistoire(20, 5000);
        expect(store.histoire.etat.mondesCompletes).toEqual([]);
    });

    it('devCompleterMondeHistoire valide un monde et retourne le suivant', () => {
        const { suivant, dejaComplete } = devCompleterMondeHistoire('monde_prologue');
        expect(dejaComplete).toBe(false);
        expect(store.histoire.etat.mondesCompletes).toContain('monde_prologue');
        expect(suivant).toBe('monde_lave');
    });

    it('devCompleterMondeHistoire enregistre un boss vaincu', () => {
        devCompleterMondeHistoire('monde_boss_1');
        expect(store.histoire.etat.mondesCompletes).toContain('monde_boss_1');
        expect(store.histoire.etat.bossVaincus).toContain('brasier');
    });
});
