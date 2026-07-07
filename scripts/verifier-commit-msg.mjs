import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { messageAideCommit, validerPremiereLigne } from './lib/conventional-commit.mjs';

function resoudreFichierMessage() {
    const candidat = process.argv[2];
    if (candidat && !candidat.startsWith('-')) return candidat;

    try {
        const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf8' }).trim();
        return join(gitDir, 'COMMIT_EDITMSG');
    } catch {
        return null;
    }
}

const fichier = resoudreFichierMessage();
if (!fichier) {
    console.error('Usage: node scripts/verifier-commit-msg.mjs <fichier-message>');
    process.exit(1);
}

const msg = readFileSync(fichier, 'utf8');
const premiereLigne = msg.split(/\r?\n/)[0];
const validation = validerPremiereLigne(premiereLigne);

if (!validation.ok) {
    console.error(messageAideCommit(premiereLigne));
    process.exit(1);
}
