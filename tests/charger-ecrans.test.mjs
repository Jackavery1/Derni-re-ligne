import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { urlFragmentEcran, fetchAvecRetry, assurerFragmentEcran } from '../js/ui/charger-ecrans.js';

describe('charger-ecrans', () => {
    const origine = globalThis.document;
    const fetchOrigine = globalThis.fetch;

    beforeEach(() => {
        globalThis.document = {
            baseURI: 'http://127.0.0.1:3000/',
            getElementById: () => null,
        };
    });

    afterEach(() => {
        globalThis.document = origine;
        globalThis.fetch = fetchOrigine;
        vi.useRealTimers();
    });

    it('resout les fragments HTML depuis document.baseURI', () => {
        expect(urlFragmentEcran('ecran-titre')).toBe('http://127.0.0.1:3000/html/ecran-titre.html');
        document.baseURI = 'https://jackavery1.github.io/Derni-re-ligne/';
        expect(urlFragmentEcran('ecran-pause')).toBe(
            'https://jackavery1.github.io/Derni-re-ligne/html/ecran-pause.html'
        );
    });

    it('fetchAvecRetry reessaie puis reussit', async () => {
        vi.useFakeTimers();
        let appels = 0;
        globalThis.fetch = vi.fn(async () => {
            appels += 1;
            if (appels < 2) return { ok: false, status: 503 };
            return { ok: true, text: async () => '<div></div>' };
        });

        const promesse = fetchAvecRetry('http://127.0.0.1:3000/html/ecran-titre.html');
        await vi.runAllTimersAsync();
        const reponse = await promesse;
        expect(reponse.ok).toBe(true);
        expect(appels).toBe(2);
    });

    it('fetchAvecRetry echoue apres les tentatives', async () => {
        vi.useFakeTimers();
        globalThis.fetch = vi.fn(async () => ({ ok: false, status: 500 }));

        const promesse = fetchAvecRetry('http://127.0.0.1:3000/html/ecran-titre.html');
        const attente = expect(promesse).rejects.toThrow(/Échec chargement/);
        await vi.runAllTimersAsync();
        await attente;
        expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    });

    it('assurerFragmentEcran injecte une fois puis sert le cache', async () => {
        const enfants = [];
        const conteneur = {
            append: (...noeuds) => {
                enfants.push(...noeuds);
            },
        };
        globalThis.document = {
            baseURI: 'http://127.0.0.1:3000/',
            getElementById: (id) => (id === 'conteneur-ecrans' ? conteneur : null),
        };
        globalThis.DOMParser = class {
            parseFromString() {
                return {
                    body: {
                        childNodes: [{ id: 'ecran-test-fragment' }],
                    },
                };
            }
        };

        let appels = 0;
        globalThis.fetch = vi.fn(async () => {
            appels += 1;
            return { ok: true, text: async () => '<section id="ecran-test"></section>' };
        });

        const nomUnique = `ecran-test-cache-${Date.now()}`;
        await assurerFragmentEcran(nomUnique);
        await assurerFragmentEcran(nomUnique);

        expect(appels).toBe(1);
        expect(enfants).toHaveLength(1);
    });
});
