import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);
const next = `${major}.${minor}.${patch + 1}`;
pkg.version = next;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

const cacheVersion = `derniere-ligne-${next}`;

const sw = readFileSync('sw.js', 'utf8');
writeFileSync(
    'sw.js',
    sw.replace(/const VERSION_CACHE = '[^']+';/, `const VERSION_CACHE = '${cacheVersion}';`)
);

const html = readFileSync('index.html', 'utf8');
writeFileSync('index.html', html.replace(/js\/main\.js\?v=[^"']+/, `js/main.js?v=${next}`));

const readme = readFileSync('README.md', 'utf8');
writeFileSync('README.md', readme.replace(/\*\*Version[^:]*: [\d.]+\*\*/, `**Version : ${next}**`));

execSync('node scripts/generate-sw-cache.mjs', { stdio: 'inherit' });
execSync('node scripts/verifier-versions.mjs', { stdio: 'inherit' });

console.log(`Release ${next} — cache SW synchronise`);
console.log('Verifiez CHANGELOG.md puis : git commit, git tag v' + next + ', git push --tags');
