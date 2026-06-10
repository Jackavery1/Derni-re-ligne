import { describe, it, expect, vi, beforeEach } from 'vitest';
import { creerFile } from '../js/file-narrative.js';

describe('file-narrative', () => {
    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('deroule les etapes dans l ordre', () => {
        const ordre = [];
        const file = creerFile('test-ordre');
        file.ajouter({
            id: 'a',
            executer: (suivant) => {
                ordre.push('a');
                suivant();
            },
        });
        file.ajouter({
            id: 'b',
            executer: (suivant) => {
                ordre.push('b');
                suivant();
            },
        });
        file.demarrer();
        expect(ordre).toEqual(['a', 'b']);
    });

    it('saute les etapes dont la condition est falsy', () => {
        const ordre = [];
        const file = creerFile('test-skip');
        file.ajouter({
            id: 'a',
            executer: (suivant) => {
                ordre.push('a');
                suivant();
            },
        });
        file.ajouter({
            id: 'skip-me',
            condition: () => false,
            executer: (suivant) => {
                ordre.push('skip-me');
                suivant();
            },
        });
        file.ajouter({
            id: 'c',
            executer: (suivant) => {
                ordre.push('c');
                suivant();
            },
        });
        file.demarrer();
        expect(ordre).toEqual(['a', 'c']);
    });

    it('ignore le second appel de suivant', () => {
        const ordre = [];
        const file = creerFile('test-double');
        file.ajouter({
            id: 'a',
            executer: (suivant) => {
                ordre.push('a');
                suivant();
                suivant();
            },
        });
        file.ajouter({
            id: 'b',
            executer: (suivant) => {
                ordre.push('b');
                suivant();
            },
        });
        file.demarrer();
        expect(ordre).toEqual(['a', 'b']);
    });
});
