import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/histoire/histoire-session.js', async () => {
    const { configurerActionsHistoire } = await import('../js/histoire/histoire-actions.js');
    configurerActionsHistoire({
        demarrerMonde: vi.fn(),
        demarrerMondeCache: vi.fn(),
        retourCarte: vi.fn(),
        retourTitreDepuisCarte: vi.fn(),
        continuerBossDistorsion: vi.fn(),
    });
    return {};
});

describe('assurerActionsHistoire', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('configure demarrerMonde et retourTitre apres chargement session', async () => {
        const { obtenirActionsHistoire } = await import('../js/histoire/histoire-actions.js');
        const { assurerActionsHistoire } =
            await import('../js/histoire/histoire-assurer-actions.js');

        await assurerActionsHistoire();

        expect(typeof obtenirActionsHistoire().demarrerMonde).toBe('function');
        expect(typeof obtenirActionsHistoire().retourTitreDepuisCarte).toBe('function');
        expect(typeof obtenirActionsHistoire().retourCarte).toBe('function');
    });

    it('reutilise la meme promesse si deja en cours', async () => {
        const { configurerActionsHistoire } = await import('../js/histoire/histoire-actions.js');
        configurerActionsHistoire({
            demarrerMonde: null,
            retourTitreDepuisCarte: null,
            retourCarte: null,
        });
        const { assurerActionsHistoire } =
            await import('../js/histoire/histoire-assurer-actions.js');
        const p1 = assurerActionsHistoire();
        const p2 = assurerActionsHistoire();
        expect(p1).toBe(p2);
        await p1;
    });

    it('court-circuite si deja configure', async () => {
        const { obtenirActionsHistoire, configurerActionsHistoire } =
            await import('../js/histoire/histoire-actions.js');
        const demarrerMonde = vi.fn();
        configurerActionsHistoire({
            demarrerMonde,
            retourTitreDepuisCarte: vi.fn(),
            retourCarte: vi.fn(),
        });
        const { assurerActionsHistoire } =
            await import('../js/histoire/histoire-assurer-actions.js');
        await assurerActionsHistoire();
        expect(obtenirActionsHistoire().demarrerMonde).toBe(demarrerMonde);
    });
});
