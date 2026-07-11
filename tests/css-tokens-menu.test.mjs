import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const EXPORT_ANGLAIS_RE = /export function (get|set|handle|is|has)[A-Z]\w+/;

/** Identifiants stables (API publique, libs, clés JSON) — pas de renommage massif. */
const IDENTIFIANTS_STABLES = [
    'CONFIG',
    'store',
    'AudioMoteur',
    'logger',
    'describe',
    'it',
    'expect',
    'document',
    'fetch',
    'localStorage',
];

const FEUILLES_EXCLUES = new Set(['variables.css', 'dev.css']);

const feuillesStyles = readdirSync('styles')
    .filter((f) => f.endsWith('.css') && !FEUILLES_EXCLUES.has(f))
    .sort();

describe('css — tokens (pas de hex literals hors variables.css)', () => {
    for (const fichier of feuillesStyles) {
        it(`${fichier} n utilise pas de hex literals`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            const hex = css.match(HEX_RE) ?? [];
            expect(hex).toEqual([]);
        });
    }
});

describe('conventions — identifiants stables', () => {
    it('liste de référence documentée pour éviter les renommages massifs', () => {
        expect(IDENTIFIANTS_STABLES).toContain('CONFIG');
        expect(IDENTIFIANTS_STABLES).toContain('store');
    });

    it('js/ui/ n exporte pas de fonctions get/handle/is en anglais', () => {
        const contrevenants = readdirSync('js/ui')
            .filter((f) => f.endsWith('.js'))
            .flatMap((fichier) => {
                const src = readFileSync(join('js/ui', fichier), 'utf8');
                const m = src.match(EXPORT_ANGLAIS_RE);
                return m ? [`${fichier}: ${m[0]}`] : [];
            });
        expect(contrevenants).toEqual([]);
    });
});
