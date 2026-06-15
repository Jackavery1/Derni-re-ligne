import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../js/store-core.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

vi.mock('../js/histoire-narratif.js', () => ({
    afficherVictoireBoss: vi.fn((_id, _type, cb) => cb?.()),
    afficherTransitionChapitre: vi.fn((_cle, cb) => cb?.()),
    afficherJournalVera: vi.fn((_j, cb) => cb?.()),
    declencherFin: vi.fn(),
    obtenirTransitionApresVictoire: vi.fn(() => null),
    obtenirTypeFin: vi.fn(() => 'fin_normale'),
    typeFinVersCleBoss: vi.fn(() => 'normal'),
    afficherDecouverteLabo: vi.fn((cb) => cb?.()),
    obtenirCutscenePostMonde: vi.fn(() => null),
}));

vi.mock('../js/ui-panneau-objectifs.js', () => ({
    afficherRecapAvantNarratif: vi.fn((_m, _e, cb) => cb?.()),
}));

vi.mock('../js/histoire-manager-ui.js', () => ({
    afficherCutsceneHistoire: vi.fn((_t, _p, cb) => cb?.()),
    afficherBoutonCarteGameOver: vi.fn(),
}));

vi.mock('../js/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => true),
}));

vi.mock('../js/navigation-ecrans.js', () => ({
    afficherEcran: vi.fn(),
}));

describe('histoire-manager-post-monde', () => {
    beforeEach(() => {
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.dernierJournal = null;
        vi.clearAllMocks();
    });

    it('enregistre le fragment VERA apres premiere completion prologue', async () => {
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire-manager-post-monde.js');
        const { afficherCutsceneHistoire } = await import('../js/histoire-manager-ui.js');

        const monde = { id: 'monde_prologue', biomeId: 'classique', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(afficherCutsceneHistoire).toHaveBeenCalled();
        expect(store.histoire.etat.fragmentsVusIds).toContain('apres_prologue');
    });
});
