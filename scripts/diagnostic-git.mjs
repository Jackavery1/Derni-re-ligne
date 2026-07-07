import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { messageAideCommit, validerPremiereLigne } from './lib/conventional-commit.mjs';

function essayer(cmd) {
    try {
        execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
        return { ok: true };
    } catch (err) {
        return { ok: false, sortie: String(err.stdout ?? '') + String(err.stderr ?? '') };
    }
}

console.log('Diagnostic commit / push — Dernière Ligne\n');

const huskyPreCommit = existsSync('.husky/pre-commit');
const huskyPrePush = existsSync('.husky/pre-push');
const huskyCommitMsg = existsSync('.husky/commit-msg');
console.log(
    huskyPreCommit && huskyPrePush && huskyCommitMsg
        ? '✓ Hooks Husky présents (pre-commit, pre-push, commit-msg)'
        : '✗ Hooks Husky incomplets — lancez : npm run prepare'
);

const exemple = 'feat(test): exemple commit';
const validation = validerPremiereLigne(exemple);
console.log(
    validation.ok
        ? '✓ Vérificateur Conventional Commits opérationnel'
        : '✗ Vérificateur Conventional Commits défectueux'
);

const etapes = [
    { nom: 'lint', cmd: 'npm run lint' },
    { nom: 'format', cmd: 'npm run format:check' },
    { nom: 'typecheck', cmd: 'npm run typecheck' },
    { nom: 'cycles', cmd: 'npm run check:circular' },
    { nom: 'données', cmd: 'npm run verify:data' },
];

for (const { nom, cmd } of etapes) {
    const resultat = essayer(cmd);
    if (resultat.ok) {
        console.log(`✓ pre-push / ${nom}`);
        continue;
    }
    console.log(`✗ pre-push / ${nom} — échec`);
    const extrait = resultat.sortie.split(/\r?\n/).slice(-6).join('\n').trim();
    if (extrait) console.log(`  ${extrait.replace(/\n/g, '\n  ')}`);
}

console.log('\nAide commit (PowerShell) :');
console.log('  npm run commit -- "feat(scope): sujet" "Corps optionnel"');
console.log('\nAide push :');
console.log('  npm run verify:pre-push   # rejouer le hook sans pousser');
console.log("  $env:SKIP_PREPUSH='1'; git push   # urgence (CI valide)");

if (existsSync('package.json')) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    console.log(`\nVersion : ${pkg.version}`);
}

const mauvais = 'mise a jour';
if (!validerPremiereLigne(mauvais).ok) {
    console.log('\nExemple refusé par commit-msg :');
    console.log(messageAideCommit(mauvais).split('\n').slice(0, 4).join('\n'));
}
