import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const spec = process.argv[2] ?? 'e2e/smoke.spec.mjs';
const indexDist = join(racine, 'dist', 'index.html');
const marqueurTest = 'neo-test-init.js';

let htmlOriginal = null;

function activerApiTestDist() {
    htmlOriginal = readFileSync(indexDist, 'utf8');
    if (htmlOriginal.includes(marqueurTest)) return;
    writeFileSync(
        indexDist,
        htmlOriginal.replace(
            '</body>',
            '        <script type="module" src="js/neo-test-init.js"></script>\n    </body>'
        )
    );
}

function restaurerIndexDist() {
    if (htmlOriginal != null) writeFileSync(indexDist, htmlOriginal);
}

activerApiTestDist();

const resultat = spawnSync('npx', ['playwright', 'test', spec], {
    cwd: racine,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, E2E_DIST: '1' },
});

restaurerIndexDist();

process.exit(resultat.status ?? 1);
