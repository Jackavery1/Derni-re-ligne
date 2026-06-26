import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const args = process.argv.slice(2);
const pushSeul = args.includes('--push-only');
const skipPrepush = args.includes('--skip-prepush');

function run(cmd, env = {}) {
    console.log(`\n▶ ${cmd}`);
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

if (!pushSeul) {
    run('npm run release');
    run('npm run verify:versions');
    run('npm test');
    run('npm run build');
}

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const message = `feat(release): v${version} remediations audits B/C/D, portrait VERA et pipeline prod`;

run('git add -A');
if (existsSync('assets/splash-chargement.png.tmp')) {
    run('git reset HEAD -- assets/splash-chargement.png.tmp');
}
run(`git commit -m "${message}"`);
run(`git tag v${version}`);

const env = skipPrepush ? { SKIP_PREPUSH: '1' } : {};
run('git push origin main --tags', env);

console.log(`\nRelease v${version} publiée.`);
