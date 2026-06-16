import { writeFileSync } from 'fs';
import { CODEX_HISTOIRE } from '../js/codex-histoire.js';
import { CODEX_MONDES } from '../js/codex-donnees/mondes.js';
import { CODEX_RELIQUES } from '../js/codex-donnees/reliques.js';
import { CODEX_CHRONIQUES } from '../js/codex-donnees/chroniques.js';
import { NIVEAUX_ARCHI } from '../js/archi-donnees.js';
import { obtenirNiveauxArchiProceduraux } from '../js/archi-generateur.js';

function extraireTextesCodex(sources) {
    /** @type {Record<string, object>} */
    const textes = {};
    /** @type {Record<string, string>} */
    const conditionsSrc = {};

    for (const source of sources) {
        for (const [id, entree] of Object.entries(source)) {
            const { condition, ...statique } = entree;
            textes[id] = statique;
            if (typeof condition !== 'function') {
                throw new Error(`Condition codex manquante : ${id}`);
            }
            conditionsSrc[id] = condition.toString();
        }
    }

    return { textes, conditionsSrc };
}

function genererFichierConditions(conditionsSrc) {
    const lignes = [
        '/** Généré par scripts/exporter-codex-archi.mjs — ne pas éditer à la main. */',
        '',
    ];
    lignes.push('export const CONDITIONS_CODEX = {');
    for (const [id, src] of Object.entries(conditionsSrc).sort(([a], [b]) => a.localeCompare(b))) {
        lignes.push(`    ${JSON.stringify(id)}: ${src},`);
    }
    lignes.push('};');
    lignes.push('');
    return `${lignes.join('\n')}`;
}

const codexBrut = {
    ...CODEX_MONDES,
    ...CODEX_RELIQUES,
    ...CODEX_CHRONIQUES,
};
Object.assign(codexBrut, CODEX_HISTOIRE);

const { textes, conditionsSrc } = extraireTextesCodex([codexBrut]);
writeFileSync('data/codex-textes.json', `${JSON.stringify(textes)}\n`);
writeFileSync('js/codex-conditions.js', genererFichierConditions(conditionsSrc));

const niveauxArchi = [...NIVEAUX_ARCHI, ...obtenirNiveauxArchiProceduraux()];
writeFileSync('data/archi-niveaux.json', `${JSON.stringify(niveauxArchi)}\n`);

console.log(
    `Codex exporté → data/codex-textes.json (${Object.keys(textes).length} entrées), js/codex-conditions.js`
);
console.log(`Architecte exporté → data/archi-niveaux.json (${niveauxArchi.length} niveaux)`);
