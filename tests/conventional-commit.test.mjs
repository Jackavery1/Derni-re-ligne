import { describe, it, expect } from 'vitest';
import { validerPremiereLigne, messageAideCommit } from '../scripts/lib/conventional-commit.mjs';

describe('conventional-commit', () => {
    it('accepte un titre valide', () => {
        expect(validerPremiereLigne('feat(codex): ajouter entree')).toEqual({ ok: true });
        expect(validerPremiereLigne('fix(types): corriger JSDoc')).toEqual({ ok: true });
    });

    it('refuse un titre sans type conventionnel', () => {
        const resultat = validerPremiereLigne('mise a jour');
        expect(resultat.ok).toBe(false);
    });

    it('refuse un message vide', () => {
        expect(validerPremiereLigne('   ').ok).toBe(false);
    });

    it('aide mentionne npm run commit pour PowerShell', () => {
        const aide = messageAideCommit('bad message');
        expect(aide).toContain('npm run commit');
        expect(aide).toContain('PowerShell');
    });
});
