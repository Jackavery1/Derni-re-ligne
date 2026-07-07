import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { messageAideCommit, validerPremiereLigne } from './lib/conventional-commit.mjs';

const args = process.argv.slice(2);

/** @type {string[]} */
const flagsGit = [];
let titre = '';
let corps = '';

for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-m' || arg === '--message') {
        const bloc = args[++i] ?? '';
        const lignes = bloc.split(/\r?\n/);
        if (!titre) titre = lignes[0] ?? '';
        else corps = bloc;
        if (!corps && lignes.length > 1) corps = lignes.slice(1).join('\n').trim();
        continue;
    }

    if (arg === '-F' || arg === '--file') {
        const contenu = readFileSync(args[++i], 'utf8');
        const lignes = contenu.split(/\r?\n/);
        titre = lignes[0] ?? '';
        corps = lignes.slice(1).join('\n').trim();
        continue;
    }

    if (arg.startsWith('-')) {
        flagsGit.push(arg);
        const flagsAvecValeur = new Set(['-c', '--author', '--date']);
        if (flagsAvecValeur.has(arg) && i + 1 < args.length) {
            flagsGit.push(args[++i]);
        }
        continue;
    }

    if (!titre) titre = arg;
    else corps = corps ? `${corps} ${arg}` : arg;
}

if (!titre) {
    console.error('Usage : npm run commit -- "type(scope): sujet" ["corps optionnel"]');
    console.error('        npm run commit -- -m "type(scope): sujet"');
    console.error('Flags git transmis : --amend, -a, --no-verify, etc.');
    process.exit(1);
}

const validation = validerPremiereLigne(titre);
if (!validation.ok) {
    console.error(messageAideCommit(titre));
    process.exit(1);
}

const argv = ['commit', ...flagsGit, '-m', titre];
if (corps) argv.push('-m', corps);

const result = spawnSync('git', argv, { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
