import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const spec = process.argv[2] ?? 'e2e/smoke.spec.mjs';
const resultat = spawnSync('npx', ['playwright', 'test', spec], {
    cwd: racine,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, E2E_DIST: '1' },
});

process.exit(resultat.status ?? 1);
