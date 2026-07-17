import { describe, it, expect, beforeEach, vi } from 'vitest';

function creerEl({ id, classes = [], clickable = false } = {}) {
    const set = new Set(classes);
    const el = {
        id,
        classList: {
            contains: (c) => set.has(c),
            add: (c) => set.add(c),
            remove: (c) => set.delete(c),
        },
        click: vi.fn(),
    };
    if (clickable) el.click = vi.fn();
    return el;
}

describe('ui-raccourcis-ecrans', () => {
    /** @type {Map<string, ReturnType<typeof creerEl>>} */
    let noeuds;
    /** @type {((e: KeyboardEvent) => void) | null} */
    let handlerKeydown;

    beforeEach(() => {
        vi.resetModules();
        handlerKeydown = null;
        noeuds = new Map([
            ['ecran-options', creerEl({ id: 'ecran-options', classes: ['actif'] })],
            ['btn-options-retour', creerEl({ id: 'btn-options-retour', clickable: true })],
            ['ecran-histoire-cutscene', creerEl({ id: 'ecran-histoire-cutscene' })],
            ['ecran-pause', creerEl({ id: 'ecran-pause' })],
        ]);
        const bodyClasses = new Set();
        globalThis.document = {
            body: {
                classList: {
                    contains: (c) => bodyClasses.has(c),
                    add: (c) => bodyClasses.add(c),
                    remove: (c) => bodyClasses.delete(c),
                },
            },
            getElementById: (id) => noeuds.get(id) ?? null,
            addEventListener: (type, fn) => {
                if (type === 'keydown') handlerKeydown = fn;
            },
        };
    });

    it('Escape clique le bouton retour de lecran meta actif', async () => {
        const { initialiserRaccourcisEcrans } = await import('../js/ui/ui-raccourcis-ecrans.js');
        initialiserRaccourcisEcrans();
        handlerKeydown?.({ code: 'Escape', key: 'Escape', preventDefault: vi.fn() });
        expect(noeuds.get('btn-options-retour').click).toHaveBeenCalledOnce();
    });

    it('Escape ignore pendant partie-active', async () => {
        const { initialiserRaccourcisEcrans } = await import('../js/ui/ui-raccourcis-ecrans.js');
        initialiserRaccourcisEcrans();
        document.body.classList.add('partie-active');
        handlerKeydown?.({ code: 'Escape', key: 'Escape', preventDefault: vi.fn() });
        expect(noeuds.get('btn-options-retour').click).not.toHaveBeenCalled();
    });

    it('Escape clique retour carte histoire', async () => {
        noeuds.get('ecran-options').classList.remove('actif');
        noeuds.set('ecran-histoire-map', creerEl({ id: 'ecran-histoire-map', classes: ['actif'] }));
        noeuds.set('btn-histoire-retour', creerEl({ id: 'btn-histoire-retour', clickable: true }));
        const { initialiserRaccourcisEcrans } = await import('../js/ui/ui-raccourcis-ecrans.js');
        initialiserRaccourcisEcrans();
        handlerKeydown?.({ code: 'Escape', key: 'Escape', preventDefault: vi.fn() });
        expect(noeuds.get('btn-histoire-retour').click).toHaveBeenCalledOnce();
    });

    it('Escape clique retour selection archi', async () => {
        noeuds.get('ecran-options').classList.remove('actif');
        noeuds.set(
            'ecran-archi-selection',
            creerEl({ id: 'ecran-archi-selection', classes: ['actif'] })
        );
        noeuds.set('archi-sel-retour', creerEl({ id: 'archi-sel-retour', clickable: true }));
        const { initialiserRaccourcisEcrans } = await import('../js/ui/ui-raccourcis-ecrans.js');
        initialiserRaccourcisEcrans();
        handlerKeydown?.({ code: 'Escape', key: 'Escape', preventDefault: vi.fn() });
        expect(noeuds.get('archi-sel-retour').click).toHaveBeenCalledOnce();
    });
});
