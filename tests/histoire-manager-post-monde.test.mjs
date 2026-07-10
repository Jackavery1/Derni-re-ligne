import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../js/etat/store-jeu.js';
import { ETAT_HISTOIRE_VIDE } from '../js/histoire-donnees.js';

vi.mock('../js/io/charger-histoire-textes.js', async () => {
    const textes = await import('../js/histoire-textes.fallback.js');
    return {
        chargerHistoireTextes: vi.fn(async () => textes),
        obtenirHistoireTextesSync: vi.fn(() => textes),
    };
});

vi.mock('../js/histoire/histoire-narratif.js', () => ({
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

vi.mock('../js/ui/ui-panneau-objectifs.js', () => ({
    afficherRecapAvantNarratif: vi.fn((_m, _e, cb) => cb?.()),
}));

vi.mock('../js/histoire/histoire-manager-ui.js', () => ({
    afficherCutsceneHistoire: vi.fn((_t, _p, cb) => cb?.()),
    afficherBoutonCarteGameOver: vi.fn(),
}));

vi.mock('../js/etat/mode-histoire.js', () => ({
    modeHistoireEnCours: vi.fn(() => true),
}));

vi.mock('../js/ui/navigation-ecrans.js', () => ({
    afficherEcran: vi.fn(),
}));

vi.mock('../js/histoire/histoire-session.js', () => ({
    enchainerCampagneApresMonde: vi.fn(() => Promise.resolve(true)),
}));

describe('histoire-manager-post-monde', () => {
    beforeEach(() => {
        store.histoire.etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.dernierJournal = null;
        vi.clearAllMocks();
    });

    it('enchaine la campagne apres le narratif post-monde', async () => {
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire/histoire-manager-post-monde.js');
        const { enchainerCampagneApresMonde } = await import('../js/histoire/histoire-session.js');
        await import('../js/histoire/histoire-manager-ui.js');

        const monde = { id: 'monde_prologue', biomeId: 'classique', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.fragmentsVusIds = ['apres_prologue'];
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(() => {
            expect(enchainerCampagneApresMonde).toHaveBeenCalledWith('monde_prologue');
        });
    });

    it('joue post-monde prologue avant transition chapitre I', async () => {
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const narratifReel = await vi.importActual('../js/histoire/histoire-narratif.js');
        const {
            obtenirTransitionApresVictoire,
            obtenirCutscenePostMonde,
            afficherTransitionChapitre,
        } = await import('../js/histoire/histoire-narratif.js');
        vi.mocked(obtenirTransitionApresVictoire).mockImplementation(
            narratifReel.obtenirTransitionApresVictoire
        );
        vi.mocked(obtenirCutscenePostMonde).mockImplementation(
            narratifReel.obtenirCutscenePostMonde
        );

        const { declencherNarratifPostMonde } =
            await import('../js/histoire/histoire-manager-post-monde.js');
        const { afficherCutsceneHistoire } = await import('../js/histoire/histoire-manager-ui.js');

        const monde = { id: 'monde_prologue', biomeId: 'classique', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.fragmentsVusIds = ['apres_prologue'];
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(() => {
            expect(afficherTransitionChapitre).toHaveBeenCalledWith(
                'vers_chapitre_1',
                expect.any(Function)
            );
        });

        const idxPostMonde = afficherCutsceneHistoire.mock.calls.findIndex(([entree]) => {
            const lignes = Array.isArray(entree) ? entree : (entree?.lignes ?? []);
            return lignes.some((l) =>
                String(l.texte ?? l).includes('ressemble à de la satisfaction')
            );
        });
        const idxTransition = afficherTransitionChapitre.mock.invocationCallOrder[0];
        const idxPostMondeCall = afficherCutsceneHistoire.mock.invocationCallOrder[idxPostMonde];

        expect(idxPostMonde).toBeGreaterThanOrEqual(0);
        expect(idxPostMondeCall).toBeLessThan(idxTransition);
    });

    it('boss 1 ne joue pas de post-monde avant transition chapitre II', async () => {
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const narratifReel = await vi.importActual('../js/histoire/histoire-narratif.js');
        const {
            obtenirTransitionApresVictoire,
            obtenirCutscenePostMonde,
            afficherTransitionChapitre,
        } = await import('../js/histoire/histoire-narratif.js');
        vi.mocked(obtenirTransitionApresVictoire).mockImplementation(
            narratifReel.obtenirTransitionApresVictoire
        );
        vi.mocked(obtenirCutscenePostMonde).mockImplementation(
            narratifReel.obtenirCutscenePostMonde
        );

        const { declencherNarratifPostMonde } =
            await import('../js/histoire/histoire-manager-post-monde.js');
        const { afficherCutsceneHistoire } = await import('../js/histoire/histoire-manager-ui.js');

        const monde = {
            id: 'monde_boss_1',
            biomeId: 'lave',
            estBoss: true,
            bossId: 'brasier',
        };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, true, true]);
        await vi.waitFor(() => {
            expect(afficherTransitionChapitre).toHaveBeenCalledWith(
                'vers_chapitre_2',
                expect.any(Function)
            );
        });

        const postMondePrologue = afficherCutsceneHistoire.mock.calls.some(([entree]) => {
            const lignes = Array.isArray(entree) ? entree : (entree?.lignes ?? []);
            return lignes.some((l) =>
                String(l.texte ?? l).includes('ressemble à de la satisfaction')
            );
        });
        expect(postMondePrologue).toBe(false);
    });

    it('enregistre le fragment VERA apres premiere completion prologue', async () => {
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire/histoire-manager-post-monde.js');
        const { afficherCutsceneHistoire } = await import('../js/histoire/histoire-manager-ui.js');

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
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire/histoire-manager-post-monde.js');

        const monde = { id: 'monde_vide', biomeId: 'vide', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(() => {
            expect(store.histoire.etat.fragmentsVusIds).toContain('apres_vide');
        });
    });

    it('joue interlude_gardiens apres premiere completion rouille', async () => {
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherNarratifPostMonde } =
            await import('../js/histoire/histoire-manager-post-monde.js');
        const { afficherCutsceneHistoire } = await import('../js/histoire/histoire-manager-ui.js');

        const monde = { id: 'monde_rouille', biomeId: 'rouille', estBoss: false };
        const etat = structuredClone(ETAT_HISTOIRE_VIDE);
        etat.fragmentsVusIds = ['apres_rouille'];
        store.histoire.etat = etat;

        declencherNarratifPostMonde(monde, etat, true, [true, false, false]);
        await vi.waitFor(() => expect(afficherCutsceneHistoire).toHaveBeenCalled());

        const textes = afficherCutsceneHistoire.mock.calls.at(-1)?.[0];
        const lignes = Array.isArray(textes) ? textes : (textes?.lignes ?? []);
        expect(lignes.some((l) => String(l.texte ?? l).includes('GARDIEN'))).toBe(true);
        expect(textes?.scene ?? lignes[0]?.scene).toBe('interlude_gardiens');
        expect(store.histoire.etat.interludesVusIds).toContain('interlude_gardiens');
    });

    it('chaque monde post-monde a un fragment VERA defini', async () => {
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { CLE_FRAGMENT_PAR_MONDE } =
            await import('../js/histoire/histoire-manager-post-monde.js');
        const { FRAGMENTS_VERA_SIGNAL } = await import('../js/histoire-textes/journaux.js');

        for (const cle of Object.values(CLE_FRAGMENT_PAR_MONDE)) {
            const fragment = FRAGMENTS_VERA_SIGNAL[cle];
            expect(fragment, cle).toBeTruthy();
            expect(fragment.length, cle).toBeGreaterThan(0);
        }
    });
});
