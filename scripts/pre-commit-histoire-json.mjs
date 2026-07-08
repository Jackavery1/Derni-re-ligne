import { execSync } from 'child_process';

const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);

const toucheTextes = staged.some(
    (f) => f.startsWith('js/histoire-textes/') || f === 'js/histoire-textes.js'
);

if (!toucheTextes) {
    console.log('pre-commit: verify:histoire-json ignoré (aucun module histoire-textes stagé)');
    process.exit(0);
}

execSync('node scripts/verifier-histoire-json-a-jour.mjs', { stdio: 'inherit' });
