import { readFileSync } from 'fs';

const fichier = process.argv[2];
if (!fichier) {
    console.error('Usage: node scripts/verifier-commit-msg.mjs <fichier-message>');
    process.exit(1);
}

const msg = readFileSync(fichier, 'utf8');
const premiereLigne = msg.split(/\r?\n/)[0].trim();
const pattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\([a-z0-9-]+\))?: .+/;

if (!pattern.test(premiereLigne)) {
    console.error('Commit refusé : utiliser Conventional Commits (feat:, fix:, refactor:, etc.)');
    console.error('Exemple : feat(release): v2.5.34 portrait VERA et bundle prod');
    process.exit(1);
}
