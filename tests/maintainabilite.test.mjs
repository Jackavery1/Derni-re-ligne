import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const racineJs = join(dirname(fileURLToPath(import.meta.url)), '..', 'js');

describe('maintainabilite', () => {
    it('store.histoire.actif est encapsule dans mode-histoire.js', () => {
        const fichiers = readdirSync(racineJs).filter((f) => f.endsWith('.js'));
        for (const fichier of fichiers) {
            if (fichier === 'mode-histoire.js') continue;
            const contenu = readFileSync(join(racineJs, fichier), 'utf8');
            expect(contenu, fichier).not.toMatch(/store\.histoire\.actif/);
        }
    });
});
