import { describe, it, expect, vi, beforeEach } from 'vitest';

const chargerClassementLeaderboard = vi.fn();

vi.mock('../js/io/leaderboard-cloud.js', () => ({
    chargerClassementLeaderboard,
}));

vi.mock('../js/config/config-sync.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        syncCloudActif: vi.fn(() => true),
        syncCloudConfigure: vi.fn(() => true),
    };
});

describe('options-sync-cloud-ui — leaderboard', () => {
    /** @type {Map<string, HTMLElement>} */
    let noeuds;

    beforeEach(async () => {
        vi.resetModules();
        const { chargerBiomesJeu } = await import('../js/config/biomes.js');
        await chargerBiomesJeu();
        noeuds = new Map();

        const titre = { textContent: '' };
        const liste = { replaceChildren: vi.fn(), appendChild: vi.fn() };
        const selectMode = {
            value: 'marathon',
            options: [{ value: 'marathon' }, { value: 'sprint' }, { value: 'coop' }],
        };
        const selectBiome = {
            value: 'classique',
            options: [],
            appendChild(opt) {
                this.options.push(opt);
            },
        };

        noeuds.set('leaderboard-options-titre', titre);
        noeuds.set('liste-leaderboard-options', liste);
        noeuds.set('select-leaderboard-mode', selectMode);
        noeuds.set('select-leaderboard-biome', selectBiome);

        vi.spyOn(document, 'getElementById').mockImplementation(
            (id) => /** @type {HTMLElement | null} */ (noeuds.get(id) ?? null)
        );

        chargerClassementLeaderboard.mockResolvedValue([
            { pseudo: 'Alpha', score: 9000, sprint_ms: null, niveau: 4 },
        ]);
    });

    it('peuple les biomes et charge selon les filtres', async () => {
        const { BIOMES, ORDRE_BIOMES_LIBRE } = await import('../js/config/biomes.js');
        const { peuplerSelectsLeaderboardOptions, rafraichirLeaderboardOptions } =
            await import('../js/ui/options-sync-cloud-ui.js');

        peuplerSelectsLeaderboardOptions();
        const selectBiome = /** @type {{ value: string, options: { value: string }[] }} */ (
            noeuds.get('select-leaderboard-biome')
        );
        expect(selectBiome.options.length).toBe(ORDRE_BIOMES_LIBRE.length);

        const selectMode = /** @type {{ value: string }} */ (noeuds.get('select-leaderboard-mode'));
        selectMode.value = 'coop';
        selectBiome.value = 'lave';

        await rafraichirLeaderboardOptions();

        expect(chargerClassementLeaderboard).toHaveBeenCalledWith({
            mode: 'coop',
            biome: 'lave',
            limit: 8,
        });
        expect(noeuds.get('leaderboard-options-titre')?.textContent).toContain(BIOMES.lave.nom);
    }, 15000);
});
