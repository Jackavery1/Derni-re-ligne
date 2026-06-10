import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => {
    vi.stubGlobal(
        'DOMParser',
        class {
            parseFromString() {
                return { body: { childNodes: [{ nodeName: 'DIV' }] } };
            }
        }
    );
});

vi.mock('../js/ecrans-config.js', () => ({
    LISTE_ECRANS_CHARGEMENT: ['ecran-test'],
}));

import { chargerEcrans } from '../js/charger-ecrans.js';

describe('charger-ecrans', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.stubGlobal(
            'DOMParser',
            class {
                parseFromString() {
                    return { body: { childNodes: [{ nodeName: 'DIV' }] } };
                }
            }
        );
    });

    it('charge les fragments HTML dans le conteneur', async () => {
        const conteneur = { replaceChildren: vi.fn(), append: vi.fn() };
        vi.stubGlobal('document', {
            getElementById: (id) => (id === 'conteneur-ecrans' ? conteneur : null),
            querySelector: () => null,
        });
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('<div id="test-ecran">OK</div>'),
            })
        );

        await chargerEcrans();

        expect(fetch).toHaveBeenCalledWith('html/ecran-test.html');
        expect(conteneur.replaceChildren).toHaveBeenCalled();
        expect(conteneur.append).toHaveBeenCalled();
    });

    it('retente le fetch apres echec reseau', async () => {
        const conteneur = { replaceChildren: vi.fn(), append: vi.fn() };
        vi.stubGlobal('document', {
            getElementById: (id) => (id === 'conteneur-ecrans' ? conteneur : null),
            querySelector: () => null,
        });

        const fetchMock = vi
            .fn()
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve('<div>OK</div>'),
            });
        vi.stubGlobal('fetch', fetchMock);

        const promesse = chargerEcrans();
        await vi.advanceTimersByTimeAsync(300);
        await promesse;

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('echoue apres 3 tentatives', async () => {
        vi.stubGlobal('document', {
            getElementById: () => ({ replaceChildren: vi.fn(), append: vi.fn() }),
            querySelector: () => null,
        });
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

        let erreur;
        const promesse = chargerEcrans().catch((err) => {
            erreur = err;
        });
        await vi.advanceTimersByTimeAsync(900);
        await promesse;

        expect(erreur).toBeInstanceOf(Error);
        expect(erreur.message).toBe('network');
        expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('lance si conteneur-ecrans absent', async () => {
        vi.stubGlobal('document', { getElementById: () => null, querySelector: () => null });
        await expect(chargerEcrans()).rejects.toThrow('conteneur-ecrans introuvable');
    });
});
