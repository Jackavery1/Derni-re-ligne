import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const racineJs = join(import.meta.dirname, '..', 'js');

const DOMAINES_PHYSIQUES = [
    { dossier: 'config', prefixe: 'config' },
    { dossier: 'logique', prefixe: 'logique-' },
    { dossier: 'histoire', prefixe: 'histoire-' },
    { dossier: 'rendu', prefixe: 'rendu-' },
    { dossier: 'ui', prefixe: 'ui-' },
    { dossier: 'etat', prefixe: 'store-' },
    { dossier: 'io', prefixe: 'progression' },
    { dossier: 'audio', prefixe: 'audio' },
];

function compterDansDossier(dossier, filtre) {
    const chemin = join(racineJs, dossier);
    if (!existsSync(chemin)) return 0;
    return readdirSync(chemin, { withFileTypes: true }).filter(
        (e) => e.isFile() && e.name.endsWith('.js') && filtre(e.name)
    ).length;
}

describe('convention domaines js/', () => {
    it('documente les domaines dans docs/domaines.md', () => {
        const doc = readFileSync(join(import.meta.dirname, '..', 'docs', 'domaines.md'), 'utf8');
        expect(doc).toContain('js/config/');
        expect(doc).toContain('js/logique/');
        expect(doc).toContain('js/histoire/');
    });

    it('couvre chaque domaine avec des modules dans un dossier physique', () => {
        expect(
            compterDansDossier('logique', (n) => n.startsWith('logique-'))
        ).toBeGreaterThanOrEqual(3);
        expect(
            compterDansDossier('histoire', (n) => n.startsWith('histoire-'))
        ).toBeGreaterThanOrEqual(5);
        expect(compterDansDossier('rendu', (n) => n.startsWith('rendu-'))).toBeGreaterThanOrEqual(
            3
        );
        expect(compterDansDossier('ui', (n) => n.startsWith('ui-'))).toBeGreaterThanOrEqual(3);
        for (const { dossier } of DOMAINES_PHYSIQUES) {
            expect(existsSync(join(racineJs, dossier)), dossier).toBe(true);
        }
    });
});
