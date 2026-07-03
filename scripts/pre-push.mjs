import { execSync } from 'child_process';

if (process.env.SKIP_PREPUSH === '1') {
    console.warn('pre-push ignoré (SKIP_PREPUSH=1) — la CI GitHub validera le push.');
    process.exit(0);
}

const etapes = [
    'npm run lint',
    'npm run format:check',
    'npm run typecheck',
    'npm run check:circular',
    'npm run verify:data',
    'npm test',
    'npm run build',
    'node scripts/generer-precache.mjs --prod',
    'node scripts/verifier-bundle.mjs',
    'npm run test:e2e:audit',
    'npm run test:e2e:smoke:dist',
    'npm run test:e2e:responsive:dist',
    'npm run test:e2e:responsive',
    'npm run test:e2e:perf',
    'npm run test:e2e',
];

for (const cmd of etapes) {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
}
