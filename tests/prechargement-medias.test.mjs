import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../js/etat/store-jeu.js';
import { ECRANS } from '../js/ui/ecrans-config.js';
import { SCENE_DEFAUT_POST_MONDE } from '../js/histoire/histoire-narratif.js';
import { SCENES_CUTSCENE } from '../js/scenes-cutscene.js';
import { chargerHistoireTextes } from '../js/io/charger-histoire-textes.js';
import {
    demarrerPrechargementCarte,
    annulerPrechargementMedias,
    listerUrlsScenesPrechargeMonde,
} from '../js/prechargement-medias.js';

describe('prechargement-medias', () => {
    beforeEach(async () => {
        store.ecranActuel = ECRANS.HISTOIRE_MAP;
        store.histoire.etat = null;
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

    it('liste vide_errance pour monde_cosmos avant partie (scene lazy)', async () => {
        await chargerHistoireTextes();
        const urls = listerUrlsScenesPrechargeMonde('monde_cosmos');
        expect(urls).toContain(SCENES_CUTSCENE.vide_errance.src);
        expect(urls.some((u) => u.includes('scene_vide_errance'))).toBe(true);
    });
});
