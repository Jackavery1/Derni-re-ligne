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

/** @type {Record<string, string[]>} */
const remediations = {
    'npm run format:check': [
        'Le pre-push vérifie tout le dépôt (pas seulement vos fichiers).',
        '→ npm run format',
        '→ git add -A && npm run commit -- "chore(format): prettier" si des fichiers ont changé',
    ],
    'npm run typecheck': [
        '→ npm run typecheck',
        '→ Corriger les unions JSDoc (@param) signalées par tsc',
    ],
    'npm run lint': ['→ npm run lint', '→ Corriger les erreurs ESLint listées ci-dessus'],
    'npm run verify:data': [
        '→ npm run histoire:json',
        '→ npm run verify:data',
        '→ Inclure data/histoire-textes.json dans le commit si modifié',
    ],
    'npm test': [
        '→ npm test',
        '→ Si timeout Vitest : relancer (charge machine) ou npx vitest run <fichier>',
    ],
};

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
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch {
        console.error(`\n✗ Étape échouée : ${cmd}`);
        const conseils = remediations[cmd];
        if (conseils) {
            console.error('\nQue faire :');
            for (const ligne of conseils) console.error(ligne);
        }
        console.error(
            '\nRejouer sans push : npm run verify:pre-push',
            "\nUrgence : $env:SKIP_PREPUSH='1'; git push"
        );
        process.exit(1);
    }
}
