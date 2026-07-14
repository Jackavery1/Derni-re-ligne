import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGBA_RE = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g;
const MICRO_TYPO_RE = /font-size:\s*0\.35rem\b/g;
function lignesMicroRemIllisibles(css) {
    return css.split('\n').filter((line) => {
        if (!/font-size:\s*0\.(?:1[89]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-5])rem/.test(line))
            return false;
        if (/clamp\(/.test(line)) return false;
        if (/var\(--typo-/.test(line)) return false;
        return true;
    });
}
function lignesMicroEmIllisibles(css) {
    return css.split('\n').filter((line) => {
        if (!/font-size:\s*0\.(?:3[0-9]|4[0-9]|5[0-5])em\b/.test(line)) return false;
        if (/var\(--typo-/.test(line)) return false;
        return true;
    });
}
function lignesClampRemSansPlancherPx(css) {
    return css.split('\n').filter((line) => {
        if (!/font-size:\s*clamp\(/.test(line)) return false;
        if (/var\(--typo-/.test(line)) return false;
        if (/clamp\(\s*11px/.test(line)) return false;
        const match = line.match(/clamp\(\s*([\d.]+)rem/);
        if (!match) return false;
        return parseFloat(match[1]) < 0.56;
    });
}
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

const FEUILLES_EXCLUES = new Set(['variables.css', 'tokens-rgba.css', 'dev.css']);
const AGREGATEURS_CUTSCENES = new Set(['cutscenes.css']);

const feuillesStyles = readdirSync('styles')
    .filter((f) => f.endsWith('.css') && !FEUILLES_EXCLUES.has(f))
    .sort();

const feuillesCutscenes = readdirSync(join('assets', 'cutscenes'))
    .filter((f) => f.endsWith('.css') && !AGREGATEURS_CUTSCENES.has(f))
    .sort();

describe('css — tokens (pas de hex literals hors variables.css)', () => {
    for (const fichier of feuillesStyles) {
        it(`${fichier} n utilise pas de hex literals`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            const hex = css.match(HEX_RE) ?? [];
            expect(hex).toEqual([]);
        });
        it(`${fichier} n utilise pas de rgba literals`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            const rgba = css.match(RGBA_RE) ?? [];
            expect(rgba).toEqual([]);
        });
        it(`${fichier} n utilise pas font-size 0.35rem (typo hud micro)`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            const micro = css.match(MICRO_TYPO_RE) ?? [];
            expect(micro).toEqual([]);
        });
        it(`${fichier} n utilise pas de micro-rem illisible (< 0.56rem)`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            const micro = lignesMicroRemIllisibles(css);
            expect(micro).toEqual([]);
        });
    }

    for (const fichier of feuillesCutscenes) {
        it(`assets/cutscenes/${fichier} n utilise pas de hex literals`, () => {
            const css = readFileSync(join('assets', 'cutscenes', fichier), 'utf8');
            const hex = css.match(HEX_RE) ?? [];
            expect(hex).toEqual([]);
        });
        it(`assets/cutscenes/${fichier} n utilise pas de rgba literals`, () => {
            const css = readFileSync(join('assets', 'cutscenes', fichier), 'utf8');
            const rgba = css.match(RGBA_RE) ?? [];
            expect(rgba).toEqual([]);
        });
    }
});

const FEUILLES_MENU_TYPO = [
    'menu-narratif-base.css',
    'menu-narratif-cutscene.css',
    'ecran-titre-menu.css',
];

describe('css — menu titre typo lisible', () => {
    for (const fichier of FEUILLES_MENU_TYPO) {
        it(`${fichier} n utilise pas de micro-em illisible (< 0.56em)`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            expect(lignesMicroEmIllisibles(css)).toEqual([]);
        });
        it(`${fichier} n utilise pas de clamp rem sans plancher 11px`, () => {
            const css = readFileSync(join('styles', fichier), 'utf8');
            expect(lignesClampRemSansPlancherPx(css)).toEqual([]);
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
