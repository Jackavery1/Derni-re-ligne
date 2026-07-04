import { execSync } from 'child_process';

if (process.env.SKIP_PREPUSH === '1') {
    console.log('pre-push ignoré (SKIP_PREPUSH=1) — la CI GitHub validera le push.');
    process.exit(0);
}

/** Vérifications rapides avant push manuel (~3–5 min). La CI exécute la suite E2E complète. */
const etapesRapides = [
    'npm run lint',
    'npm run format:check',
    'npm run typecheck',
    'npm run check:circular',
    'npm run verify:data',
    'npm test',
    'npm run build',
    'node scripts/generer-precache.mjs --prod',
    'node scripts/verifier-bundle.mjs',
    'npm run test:e2e:smoke:dist',
];

/** Suite E2E complète (optionnelle, ~20–30 min) — PRE_PUSH_FULL=1 */
const etapesE2eCompletes = [
    'npm run test:e2e:audit',
    'npm run test:e2e:responsive:dist',
    'npm run test:e2e:responsive',
    'npm run test:e2e:perf',
    'npm run test:e2e',
];

const etapes =
    process.env.PRE_PUSH_FULL === '1' ? [...etapesRapides, ...etapesE2eCompletes] : etapesRapides;

if (process.env.PRE_PUSH_FULL === '1') {
    console.log('pre-push complet (PRE_PUSH_FULL=1) — audits + responsive + perf + E2E.');
} else {
    console.log(
        'pre-push rapide — E2E complets en CI uniquement. Pour tout lancer en local : PRE_PUSH_FULL=1 git push'
    );
}

for (const cmd of etapes) {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}
