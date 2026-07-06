import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const racineProjet = join(dirname(fileURLToPath(import.meta.url)), '..');
const racineJs = join(racineProjet, 'js');
const SEUIL_HOTSPOT_LIGNES = 450;
const MARQUEUR_DEBUT = '/* PRECACHE:DEBUT */';
const MARQUEUR_FIN = '/* PRECACHE:FIN */';

const ALLOWLIST_STORE_CORE = new Set([
    'store-core.js',
    'store-jeu.js',
    'store-etat-partie.js',
    'store-refs-canvas.js',
    'accessibilite.js',
    'mode-histoire.js',
]);

function listerFichiersJs(dossier) {
    /** @type {string[]} */
    const fichiers = [];
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
        const chemin = join(dossier, entree.name);
        if (entree.isDirectory()) {
            fichiers.push(...listerFichiersJs(chemin));
        } else if (entree.name.endsWith('.js')) {
            fichiers.push(chemin);
        }
    }
    return fichiers;
}

function compterLignes(chemin) {
    return readFileSync(chemin, 'utf8').split('\n').length;
}

describe('maintainabilite', () => {
    it('store.histoire.actif est encapsule dans mode-histoire.js', () => {
        for (const chemin of listerFichiersJs(racineJs)) {
            const nom = chemin.split(/[/\\]/).pop();
            if (nom === 'mode-histoire.js') continue;
            const contenu = readFileSync(chemin, 'utf8');
            expect(contenu, chemin).not.toMatch(/store\.histoire\.actif/);
        }
    });

    it('store-core est importe uniquement par la couche etat', () => {
        const violations = [];
        for (const chemin of listerFichiersJs(racineJs)) {
            const nom = chemin.split(/[/\\]/).pop();
            if (ALLOWLIST_STORE_CORE.has(nom)) continue;
            const contenu = readFileSync(chemin, 'utf8');
            if (/from ['"]\.\/store-core\.js['"]/.test(contenu)) {
                violations.push(
                    chemin.replace(racineJs + '\\', 'js\\').replace(racineJs + '/', 'js/')
                );
            }
        }
        expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });

    it(`aucun module js ne depasse ${SEUIL_HOTSPOT_LIGNES} lignes`, () => {
        const depassements = [];
        for (const chemin of listerFichiersJs(racineJs)) {
            const lignes = compterLignes(chemin);
            if (lignes > SEUIL_HOTSPOT_LIGNES) {
                depassements.push({ chemin: chemin.replace(racineJs + '\\', 'js\\'), lignes });
            }
        }
        expect(depassements, JSON.stringify(depassements, null, 2)).toEqual([]);
    });

    it(`sw.js ne depasse pas ${SEUIL_HOTSPOT_LIGNES} lignes`, () => {
        const lignes = compterLignes(join(racineProjet, 'sw.js'));
        expect(lignes).toBeLessThanOrEqual(SEUIL_HOTSPOT_LIGNES);
    });

    it('tous les modules js racine sont listes dans le precache SW dev', () => {
        const swPrecache = readFileSync(join(racineProjet, 'sw-precache.js'), 'utf8');
        const debut = swPrecache.indexOf(MARQUEUR_DEBUT);
        const fin = swPrecache.indexOf(MARQUEUR_FIN);
        expect(debut).toBeGreaterThanOrEqual(0);
        expect(fin).toBeGreaterThan(debut);
        const blocPrecache = swPrecache.slice(debut, fin);

        const exclusPrecache = new Set(['./js/codex-histoire.js']);

        const manquants = readdirSync(racineJs)
            .filter((f) => f.endsWith('.js'))
            .map((f) => `./js/${f}`)
            .filter((entree) => !exclusPrecache.has(entree))
            .filter((entree) => !blocPrecache.includes(`'${entree}'`));

        expect(manquants, `Relancez npm run sync:sw — manquants: ${manquants.join(', ')}`).toEqual(
            []
        );
    });
});
