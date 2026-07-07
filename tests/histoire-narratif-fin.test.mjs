import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import * as textesHistoire from '../js/histoire-textes.js';
import { activerModeHistoire, desactiverModeHistoire } from '../js/etat/mode-histoire.js';
import { attendreMock } from './helpers-narratif-async.mjs';

const { afficherCutsceneHistoire, executerFin } = vi.hoisted(() => ({
    afficherCutsceneHistoire: vi.fn((_textes, _persos, onFin) => onFin?.()),
    executerFin: vi.fn(),
}));

vi.mock('../js/histoire/histoire-manager-ui.js', () => ({
    afficherCutsceneHistoire,
}));

vi.mock('../js/fins-histoire.js', () => ({
    executerFin,
}));

vi.mock('../js/histoire/histoire-etat.js', () => ({
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
    /** @type {typeof import('../js/histoire/histoire-narratif.js').declencherFin} */
    let declencherFin;

    beforeAll(async () => {
        globalThis.fetch = async (url) => {
            if (String(url).includes('histoire-textes.json')) {
                return { ok: true, json: async () => textesHistoire };
            }
            return { ok: false, status: 404, json: async () => ({}) };
        };
        const { chargerHistoireTextes } = await import('../js/io/charger-histoire-textes.js');
        await chargerHistoireTextes();
        ({ declencherFin } = await import('../js/histoire/histoire-narratif.js'));
    }, 30000);

    beforeEach(() => {
        vi.clearAllMocks();
        desactiverModeHistoire();
        activerModeHistoire();
    });

    it('enchaîne épilogue, outro LE CYCLE et executerFin pour fin_normale', async () => {
        declencherFin('fin_normale');
        await attendreMock(afficherCutsceneHistoire, 2);

        const [textesEpilogue] = afficherCutsceneHistoire.mock.calls[0];
        const [textesOutro] = afficherCutsceneHistoire.mock.calls[1];

        expect(textesEpilogue.length).toBeGreaterThan(0);
        expect(textesOutro.some((l) => String(l.texte ?? l).includes('LE CYCLE'))).toBe(true);
        expect(executerFin).toHaveBeenCalledWith('fin_normale');
    });

    it('expose OUTRO_FINS pour les trois IDs de fin', async () => {
        const { obtenirHistoireTextesSync } = await import('../js/io/charger-histoire-textes.js');
        const { OUTRO_FINS } = obtenirHistoireTextesSync();
        for (const cle of ['fin_normale', 'fin_vraie', 'fin_secrete']) {
            expect(OUTRO_FINS[cle]?.length).toBeGreaterThan(0);
        }
        expect(OUTRO_FINS.fin_vraie.some((l) => l.texte.includes("L'HARMONIE"))).toBe(true);
        expect(OUTRO_FINS.fin_secrete.some((l) => l.texte.includes('LA LIGNE PARFAITE'))).toBe(
            true
        );
    });

    it('enchaîne épilogue, outro et executerFin pour fin_secrete', async () => {
        declencherFin('fin_secrete');
        await attendreMock(afficherCutsceneHistoire, 2);

        const [textesOutro] = afficherCutsceneHistoire.mock.calls[1];
        expect(textesOutro.some((l) => String(l.texte ?? l).includes('LA LIGNE PARFAITE'))).toBe(
            true
        );
        expect(executerFin).toHaveBeenCalledWith('fin_secrete');
    });

    it('enchaîne épilogue, outro et executerFin pour fin_vraie', async () => {
        declencherFin('fin_vraie');
        await attendreMock(afficherCutsceneHistoire, 2);

        const [textesOutro] = afficherCutsceneHistoire.mock.calls[1];
        expect(textesOutro.some((l) => String(l.texte ?? l).includes("L'HARMONIE"))).toBe(true);
        expect(executerFin).toHaveBeenCalledWith('fin_vraie');
    });
});
