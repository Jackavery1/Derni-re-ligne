import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../js/store-core.js';
import { ECRANS } from '../js/ecrans-config.js';
import { SCENE_DEFAUT_POST_MONDE } from '../js/histoire-narratif.js';
import { SCENES_CUTSCENE } from '../js/scenes-cutscene.js';
import { chargerHistoireTextes } from '../js/charger-histoire-textes.js';
import {
    demarrerPrechargementCarte,
    annulerPrechargementMedias,
} from '../js/prechargement-medias.js';

describe('prechargement-medias', () => {
    beforeEach(async () => {
        store.ecranActuel = ECRANS.HISTOIRE_MAP;
        vi.stubGlobal('navigator', { connection: undefined });
        await chargerHistoireTextes();
        annulerPrechargementMedias();
    });

    it('declenche le preload sans erreur sur la carte histoire', async () => {
        const fetchOrigine = globalThis.fetch;
        const fetchSpy = vi.fn(async (url, opts) => {
            if (String(url).includes('.json')) return fetchOrigine(url, opts);
            return new Response('');
        });
        vi.stubGlobal('fetch', fetchSpy);

        demarrerPrechargementCarte();
        await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled(), { timeout: 3000 });
        annulerPrechargementMedias();

        const urls = fetchSpy.mock.calls.map(([url]) => String(url));
        expect(urls.some((u) => u.includes('assets/musique/'))).toBe(true);
    });

    it('inclut vide_errance pour monde_vide dans le registre post-monde', () => {
        expect(SCENE_DEFAUT_POST_MONDE.monde_vide).toBe('vide_errance');
        expect(SCENES_CUTSCENE.vide_errance?.src).toContain('scene_vide_errance');
    });
});
