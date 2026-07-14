import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const racineProjet = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Chemins PNG lazy precaches en arriere-plan (source : sw.js). */
export function lireCheminsScenesArrierePlanSw() {
    const sw = readFileSync(join(racineProjet, 'sw.js'), 'utf8');
    const bloc = sw.match(/SCENES_CUTSCENE_ARRIERE_PLAN\s*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
    return [...bloc.matchAll(/'(\.\/[^']+)'/g)].map((m) => m[1]);
}
