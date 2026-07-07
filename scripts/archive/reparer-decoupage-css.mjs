import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

/** @param {string} chemin */
function lireDepuisHead(chemin) {
    return execSync(`git show HEAD:styles/${chemin}`, { encoding: 'utf8' });
}

/**
 * @param {string} source
 * @param {number} debut index 1-based inclus
 * @param {number} fin index 1-based inclus, ou Infinity
 */
function extraireLignes(source, debut, fin) {
    const lignes = source.split(/\r?\n/);
    const max = fin === Infinity ? lignes.length : fin;
    return (
        lignes
            .slice(debut - 1, max)
            .join('\n')
            .trimEnd() + '\n'
    );
}

const decoupages = [
    {
        source: 'boss.css',
        parties: [
            { out: 'boss-combat.css', debut: 1, fin: 248 },
            { out: 'boss-portrait.css', debut: 249, fin: Infinity },
        ],
    },
    {
        source: 'interface-jeu.css',
        parties: [
            { out: 'interface-jeu-layout.css', debut: 1, fin: 189 },
            { out: 'interface-jeu-hud.css', debut: 190, fin: Infinity },
        ],
    },
    {
        source: 'mode-architecte.css',
        parties: [
            { out: 'mode-architecte-base.css', debut: 1, fin: 169 },
            { out: 'mode-architecte-niveaux.css', debut: 170, fin: Infinity },
        ],
    },
    {
        source: 'objectifs-histoire.css',
        parties: [
            { out: 'objectifs-histoire-base.css', debut: 1, fin: 228 },
            { out: 'objectifs-histoire-hud.css', debut: 229, fin: Infinity },
        ],
    },
];

for (const { source, parties } of decoupages) {
    const contenu = lireDepuisHead(source);
    for (const { out, debut, fin } of parties) {
        writeFileSync(`styles/${out}`, extraireLignes(contenu, debut, fin));
        console.log(`styles/${out} ← ${source} L${debut}-${fin === Infinity ? 'fin' : fin}`);
    }
}
