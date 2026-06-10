import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as textesHistoire from '../js/histoire-textes.js';

const afficherCutsceneHistoire = vi.fn((_textes, _persos, onFin) => onFin?.());
const executerFin = vi.fn();

vi.mock('../js/histoire-manager-ui.js', () => ({
    afficherCutsceneHistoire,
}));

vi.mock('../js/fins-histoire.js', () => ({
    executerFin,
}));

vi.mock('../js/histoire-etat.js', () => ({
    obtenirEtatHistoirePersiste: () => ({
        outroVue: false,
        interludesVusIds: [],
        mondesCompletes: [],
        journauxTrouves: [],
        toutesFinObtenues: [],
        conditionsParadoxe: {},
        conditionsTrame: {},
        conditionsMiroir: {},
    }),
    persisterEtatHistoire: vi.fn(),
}));

describe('declencherFin — épilogue puis outro', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.fetch = async (url) => {
            if (String(url).includes('histoire-textes.json')) {
                return { ok: true, json: async () => textesHistoire };
            }
            return { ok: false, status: 404, json: async () => ({}) };
        };
    });

    it('enchaîne épilogue, outro LE CYCLE et executerFin pour fin_normale', async () => {
        const { store } = await import('../js/store-core.js');
        store.histoire.actif = true;
        const { chargerHistoireTextes } = await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { declencherFin } = await import('../js/histoire-narratif.js');

        declencherFin('fin_normale');

        await vi.waitFor(() => expect(afficherCutsceneHistoire).toHaveBeenCalledTimes(2));

        const [textesEpilogue] = afficherCutsceneHistoire.mock.calls[0];
        const [textesOutro] = afficherCutsceneHistoire.mock.calls[1];

        expect(textesEpilogue.length).toBeGreaterThan(0);
        expect(textesOutro.some((t) => String(t).includes('LE CYCLE'))).toBe(true);
        expect(executerFin).toHaveBeenCalledWith('fin_normale');
    });

    it('expose OUTRO_FINS pour les trois IDs de fin', async () => {
        const { chargerHistoireTextes, obtenirHistoireTextesSync } =
            await import('../js/charger-histoire-textes.js');
        await chargerHistoireTextes();
        const { OUTRO_FINS } = obtenirHistoireTextesSync();
        for (const cle of ['fin_normale', 'fin_vraie', 'fin_secrete']) {
            expect(OUTRO_FINS[cle]?.length).toBeGreaterThan(0);
        }
        expect(OUTRO_FINS.fin_vraie.some((l) => l.texte.includes("L'HARMONIE"))).toBe(true);
        expect(OUTRO_FINS.fin_secrete.some((l) => l.texte.includes('LA LIGNE PARFAITE'))).toBe(
            true
        );
    });
});
