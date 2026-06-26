import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { listerSortiesTestUniquement } from './budget-exclus-test.mjs';

/**
 * @param {import('esbuild').Metafile} metafile
 * @param {string} [dossierSortie='dist/js']
 */
export function sommerBundleProd(metafile, dossierSortie = 'dist/js') {
    /** @type {Set<string>} */
    const exclusBudget = new Set(['neo-test-init.js']);
    const exclusPath = join(dossierSortie, 'budget-exclus.json');
    if (existsSync(exclusPath)) {
        for (const nom of JSON.parse(readFileSync(exclusPath, 'utf8'))) {
            exclusBudget.add(nom);
        }
    } else {
        for (const nom of listerSortiesTestUniquement(metafile)) {
            exclusBudget.add(nom);
        }
    }

    let octets = 0;
    /** @type {string[]} */
    const fichiers = [];
    for (const [sortie, info] of Object.entries(metafile.outputs)) {
        if (!sortie.endsWith('.js')) continue;
        const nom = sortie.replace(/^.*[/\\]/, '');
        if (nom === 'budget-exclus.json' || exclusBudget.has(nom)) continue;
        octets += info.bytes;
        fichiers.push(nom);
    }

    const entree = fichiers.find((f) => f.startsWith('bundle'));
    const koEntree = entree ? Math.round(statSync(join(dossierSortie, entree)).size / 1024) : null;

    return { octets, ko: Math.round(octets / 1024), fichiers: fichiers.length, koEntree, entree };
}
