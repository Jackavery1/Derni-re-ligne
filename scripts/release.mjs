import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
const next = `${major}.${minor}.${patch + 1}`;
pkg.version = next;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

const sw = readFileSync('sw.js', 'utf8');
const matchShell = sw.match(/VERSION_SHELL = 'dl-shell-v(\d+)'/);
const nextShell = matchShell ? parseInt(matchShell[1], 10) + 1 : 1;
let swMaj = sw.replace(
    /VERSION_SHELL = 'dl-shell-v\d+'/,
    `VERSION_SHELL = 'dl-shell-v${nextShell}'`
);

writeFileSync('sw.js', swMaj);

const html = readFileSync('index.html', 'utf8');
writeFileSync('index.html', html.replace(/\?v=[\d.]+/g, `?v=${next}`));

const readme = readFileSync('README.md', 'utf8');
writeFileSync('README.md', readme.replace(/\*\*Version[^:]*: [\d.]+\*\*/, `**Version : ${next}**`));

execSync('node scripts/generer-precache.mjs', { stdio: 'inherit' });
execSync('node scripts/verifier-versions.mjs', { stdio: 'inherit' });

console.log(`Release ${next} — cache SW dl-shell-v${nextShell}`);
console.log('Verifiez CHANGELOG.md puis : git commit, git tag v' + next + ', git push --tags');
