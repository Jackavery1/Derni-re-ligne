import { execSync } from 'child_process';

if (process.env.SKIP_PREPUSH === '1') {
    console.log('pre-push ignoré (SKIP_PREPUSH=1) — la CI GitHub validera le push.');
    process.exit(0);
}

/** Vérifications rapides avant push manuel (~1–2 min). Build, bundle et E2E dist : CI GitHub. */
const etapesRapides = [
    'npm run lint',
    'npm run format:check',
    'npm run typecheck',
    'npm run check:circular',
    'npm run verify:data',
    'npm test',
];

/** Build + smoke dist (~2–3 min) — PRE_PUSH_BUILD=1 */
const etapesBuild = [
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

let etapes = [...etapesRapides];
if (process.env.PRE_PUSH_BUILD === '1') etapes = [...etapes, ...etapesBuild];
if (process.env.PRE_PUSH_FULL === '1')
    etapes = [...etapesRapides, ...etapesBuild, ...etapesE2eCompletes];

if (process.env.PRE_PUSH_FULL === '1') {
    console.log('pre-push complet (PRE_PUSH_FULL=1) — build + smoke + audits + E2E.');
} else if (process.env.PRE_PUSH_BUILD === '1') {
    console.log('pre-push build (PRE_PUSH_BUILD=1) — lint/tests + build + smoke dist.');
} else {
    console.log(
        'pre-push rapide (~1–2 min) — build/smoke/E2E en CI. Options : PRE_PUSH_BUILD=1 ou PRE_PUSH_FULL=1 git push'
    );
}

for (const cmd of etapes) {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}
