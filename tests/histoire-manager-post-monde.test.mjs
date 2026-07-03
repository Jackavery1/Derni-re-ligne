import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../js/store-jeu.js';
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

vi.mock('../js/histoire-session.js', () => ({
    enchainerCampagneApresMonde: vi.fn(() => Promise.resolve(true)),
}));

describe('histoire-manager-post-monde', () => {
    beforeEach(() => {
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.dernierJournal = null;
        vi.clearAllMocks();
    });

    it('enchaine la campagne apres le narratif post-monde', async () => {
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire-manager-post-monde.js');
        const { enchainerCampagneApresMonde } = await import('../js/histoire-session.js');

        const monde = { id: 'monde_prologue', biomeId: 'classique', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.fragmentsVusIds = ['apres_prologue'];
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(
            () => {
                expect(enchainerCampagneApresMonde).toHaveBeenCalledWith('monde_prologue');
            },
            { timeout: 10000 }
        );
    }, 15000);

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
        await vi.waitFor(() => {
            expect(afficherCutsceneHistoire).toHaveBeenCalled();
        });
        expect(store.histoire.etat.fragmentsVusIds).toContain('apres_prologue');
    });

    it('enregistre le fragment VERA apres premiere completion vide', async () => {
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire-manager-post-monde.js');

        const monde = { id: 'monde_vide', biomeId: 'vide', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(() => {
            expect(store.histoire.etat.fragmentsVusIds).toContain('apres_vide');
        });
    });

    it('joue interlude_gardiens apres premiere completion rouille', async () => {
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire-manager-post-monde.js');
        const { afficherCutsceneHistoire } = await import('../js/histoire-manager-ui.js');

        const monde = { id: 'monde_rouille', biomeId: 'rouille', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.fragmentsVusIds = ['apres_rouille'];
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(() => expect(afficherCutsceneHistoire).toHaveBeenCalled());

        const textes = afficherCutsceneHistoire.mock.calls.at(-1)?.[0];
        const lignes = Array.isArray(textes) ? textes : (textes?.lignes ?? []);
        expect(lignes.some((l) => String(l.texte ?? l).includes('GARDIEN'))).toBe(true);
        expect(store.histoire.etat.interludesVusIds).toContain('interlude_gardiens');
    });

    it('chaque monde post-monde a un fragment VERA defini', async () => {
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { CLE_FRAGMENT_PAR_MONDE } = await import('../js/histoire-manager-post-monde.js');
        const { FRAGMENTS_VERA_SIGNAL } = await import('../js/histoire-textes/journaux.js');

        for (const cle of Object.values(CLE_FRAGMENT_PAR_MONDE)) {
            const fragment = FRAGMENTS_VERA_SIGNAL[cle];
            expect(fragment, cle).toBeTruthy();
            expect(fragment.length, cle).toBeGreaterThan(0);
        }
    });
});
