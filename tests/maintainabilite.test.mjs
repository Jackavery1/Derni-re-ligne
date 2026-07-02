import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const racineProjet = join(dirname(fileURLToPath(import.meta.url)), '..');
const racineJs = join(racineProjet, 'js');
const SEUIL_HOTSPOT_LIGNES = 450;
const MARQUEUR_DEBUT = '/* PRECACHE:DEBUT */';
const MARQUEUR_FIN = '/* PRECACHE:FIN */';

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

describe('maintainabilite', () => {
    it('store.histoire.actif est encapsule dans mode-histoire.js', () => {
        const fichiers = readdirSync(racineJs).filter((f) => f.endsWith('.js'));
        for (const fichier of fichiers) {
            if (fichier === 'mode-histoire.js') continue;
            const contenu = readFileSync(join(racineJs, fichier), 'utf8');
            expect(contenu, fichier).not.toMatch(/store\.histoire\.actif/);
        }
    });

    it(`aucun module js ne depasse ${SEUIL_HOTSPOT_LIGNES} lignes`, () => {
        const depassements = [];
        for (const chemin of listerFichiersJs(racineJs)) {
            const lignes = readFileSync(chemin, 'utf8').split('\n').length;
            if (lignes > SEUIL_HOTSPOT_LIGNES) {
                depassements.push({ chemin: chemin.replace(racineJs + '\\', 'js\\'), lignes });
            }
        }
        expect(depassements, JSON.stringify(depassements, null, 2)).toEqual([]);
    });

    it('tous les modules js racine sont listes dans le precache SW dev', () => {
        const sw = readFileSync(join(racineProjet, 'sw.js'), 'utf8');
        const debut = sw.indexOf(MARQUEUR_DEBUT);
        const fin = sw.indexOf(MARQUEUR_FIN);
        expect(debut).toBeGreaterThanOrEqual(0);
        expect(fin).toBeGreaterThan(debut);
        const blocPrecache = sw.slice(debut, fin);

        const manquants = readdirSync(racineJs)
            .filter((f) => f.endsWith('.js'))
            .map((f) => `./js/${f}`)
            .filter((entree) => !blocPrecache.includes(`'${entree}'`));

        expect(manquants, `Relancez npm run sync:sw — manquants: ${manquants.join(', ')}`).toEqual(
            []
        );
    });
});
