import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('navigation-actions', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('delegate cacher et afficher apres configuration', async () => {
        const { configurerNavigationActions, cacherEcransDiffere, afficherEcranDiffere } =
            await import('../js/ui/navigation-actions.js');
        const cacherEcrans = vi.fn();
        const afficherEcranAsync = vi.fn(async () => undefined);

        configurerNavigationActions({ cacherEcrans, afficherEcranAsync });
        cacherEcransDiffere();
        afficherEcranDiffere('ecran-titre');

        expect(cacherEcrans).toHaveBeenCalledOnce();
        expect(afficherEcranAsync).toHaveBeenCalledWith('ecran-titre');
    });

    it('afficherEcranDiffereAsync rejette si navigation non configuree', async () => {
        const { afficherEcranDiffereAsync } = await import('../js/ui/navigation-actions.js');
        await expect(afficherEcranDiffereAsync('ecran-titre')).rejects.toThrow(
            /navigation non configuree/
        );
    });

    it('afficherEcranDiffereAsync utilise preccharger si non encore cable', async () => {
        const { configurerNavigationActions, afficherEcranDiffereAsync } =
            await import('../js/ui/navigation-actions.js');
        const afficherEcranAsync = vi.fn(async () => 'ok');
        const preccharger = vi.fn(async () => {
            configurerNavigationActions({ afficherEcranAsync });
        });
        configurerNavigationActions({ preccharger });
        await expect(afficherEcranDiffereAsync('ecran-codex')).resolves.toBe('ok');
        expect(preccharger).toHaveBeenCalledOnce();
        expect(afficherEcranAsync).toHaveBeenCalledWith('ecran-codex');
    });

    it('afficherEcranDiffereAsync resolue apres configuration', async () => {
        const { configurerNavigationActions, afficherEcranDiffereAsync } =
            await import('../js/ui/navigation-actions.js');
        const afficherEcranAsync = vi.fn(async () => 'ok');
        configurerNavigationActions({ afficherEcranAsync });
        await expect(afficherEcranDiffereAsync('ecran-titre')).resolves.toBe('ok');
        expect(afficherEcranAsync).toHaveBeenCalledWith('ecran-titre');
    });
});
